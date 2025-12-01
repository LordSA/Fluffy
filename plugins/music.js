import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} from "@discordjs/voice";
import play from "play-dl";
import { config } from "../config.js";

const PREFIX = config.commandPrefix;
const guildQueues = new Map();

function getGuildQueue(guildId) {
  if (!guildQueues.has(guildId)) {
    guildQueues.set(guildId, {
      connection: null,
      player: createAudioPlayer(),
      queue: [],
      playing: false
    });
  }
  return guildQueues.get(guildId);
}

async function connectToChannel(voiceChannel) {
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 20000);
  return connection;
}

async function playNext(guildId, textChannel) {
  const data = getGuildQueue(guildId);

  if (data.queue.length === 0) {
    data.playing = false;
    if (data.connection) {
      data.connection.destroy();
      data.connection = null;
    }
    await textChannel.send("✅ Music queue ended, leaving voice channel.");
    return;
  }

  const track = data.queue[0];

  try {
    const streamInfo = await play.stream(track.url);
    const resource = createAudioResource(streamInfo.stream, {
      inputType: streamInfo.type
    });

    data.player.play(resource);
    data.playing = true;

    await textChannel.send(`🎶 Now playing: ${track.title}`);
  } catch (err) {
    console.error("Error while playing track:", err);
    await textChannel.send("⚠️ Failed to play that track, skipping...");
    data.queue.shift();
    await playNext(guildId, textChannel);
  }
}

export const musicPlugin = {
  name: "music",

  onReady(client) {
    console.log(`Music plugin ready for ${client.user.tag}`);
  },

  async onMessage(client, message) {
    const content = message.content.trim();
    if (!content.startsWith(PREFIX)) return;

    const [cmdRaw, ...rest] = content
      .slice(PREFIX.length)
      .trim()
      .split(/\s+/);

    const cmd = cmdRaw.toLowerCase();
    if (cmd !== "music" && cmd !== "m") return;

    const subcmdRaw = rest[0];
    const args = rest.slice(1);
    if (!subcmdRaw) {
      await message.reply(
        "Music usage:\n`!music play <url or search>`\n`!music skip`\n`!music stop`\n`!music leave`\n`!music queue`"
      );
      return;
    }

    const subcmd = subcmdRaw.toLowerCase();
    const guild = message.guild;
    const member = message.member;
    const channel = message.channel;

    if (!guild) return;

    const data = getGuildQueue(guild.id);

    if (subcmd === "play") {
      const query = args.join(" ").trim();
      if (!query) {
        await message.reply(
          "Usage: `!music play <YouTube URL or search query>`"
        );
        return;
      }

      const voiceChannel = member?.voice?.channel;
      if (!voiceChannel) {
        await message.reply("You must be in a voice channel first.");
        return;
      }

      if (!data.connection) {
        try {
          data.connection = await connectToChannel(voiceChannel);
          data.connection.subscribe(data.player);

          data.player.on("stateChange", (oldState, newState) => {
            if (
              oldState.status === AudioPlayerStatus.Playing &&
              newState.status === AudioPlayerStatus.Idle
            ) {
              data.queue.shift();
              playNext(guild.id, channel);
            }
          });
        } catch (err) {
          console.error("Error joining voice channel:", err);
          await message.reply("Failed to join voice channel.");
          return;
        }
      }

      let videoInfo;

      try {
        if (play.yt_validate(query) === "video") {
          videoInfo = await play.video_info(query);
        } else {
          const results = await play.search(query, { limit: 1 });
          if (!results.length) {
            await message.reply("No results found for that query.");
            return;
          }
          videoInfo = results[0];
        }
      } catch (err) {
        console.error("Error fetching video info:", err);
        await message.reply("Failed to fetch video info.");
        return;
      }

      data.queue.push({
        url: videoInfo.url,
        title: videoInfo.title
      });

      if (!data.playing) {
        await playNext(guild.id, channel);
      } else {
        await message.reply(`✅ Added to queue: ${videoInfo.title}`);
      }

      return;
    }

    if (subcmd === "skip") {
      if (!data.playing || data.queue.length === 0) {
        await message.reply("Nothing is currently playing.");
        return;
      }
      data.player.stop();
      await message.reply("⏭️ Skipped current track.");
      return;
    }

    if (subcmd === "stop") {
      data.queue = [];
      data.player.stop();
      data.playing = false;
      await message.reply("⏹️ Stopped music and cleared the queue.");
      return;
    }

    if (subcmd === "leave") {
      if (data.connection) {
        data.connection.destroy();
        data.connection = null;
      }
      data.queue = [];
      data.playing = false;
      await message.reply("👋 Left the voice channel.");
      return;
    }

    if (subcmd === "queue") {
      if (!data.queue.length) {
        await message.reply("Queue is empty.");
        return;
      }
      const list = data.queue
        .map((track, i) => `${i === 0 ? "▶️" : `${i}.`} ${track.title}`)
        .join("\n");
      await message.reply(`📜 Music queue:\n${list}`);
      return;
    }

    await message.reply(
      "Unknown music command. Try: `!music play`, `!music skip`, `!music stop`, `!music leave`, `!music queue`."
    );
  }
};
