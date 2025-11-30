import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} from "@discordjs/voice";
import play from "play-dl";

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

  await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
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
    await textChannel.send("✅ Queue ended, leaving voice channel.");
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

    await textChannel.send(`🎶 Now playing: **${track.title}**`);

  } catch (err) {
    console.error("Error while playing track:", err);
    await textChannel.send("⚠️ Failed to play that track, skipping...");
    data.queue.shift();
    return playNext(guildId, textChannel);
  }
}

export function isMusicCommand(cmd) {
  return ["play", "skip", "stop", "leave", "queue"].includes(cmd);
}

export async function handleMusicCommand(message, cmd, args) {
  const { guild, member, channel } = message;
  if (!guild) return;

  const data = getGuildQueue(guild.id);

  if (cmd === "play") {
    const query = args.join(" ").trim();
    if (!query) {
      return message.reply("Usage: `!play <YouTube URL or search query>`");
    }

    const voiceChannel = member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply("You must be in a voice channel first.");
    }

    if (!data.connection) {
      try {
        data.connection = await connectToChannel(voiceChannel);
        data.connection.subscribe(data.player);

        data.connection.on("stateChange", (oldState, newState) => {
          console.log(
            `Voice connection state change: ${oldState.status} -> ${newState.status}`
          );
        });

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
        return message.reply("Failed to join voice channel.");
      }
    }

    let videoInfo;

    try {
      if (play.yt_validate(query) === "video") {
        videoInfo = await play.video_info(query);
      } else {
        const results = await play.search(query, { limit: 1 });
        if (!results.length) {
          return message.reply("No results found for that query.");
        }
        videoInfo = results[0];
      }
    } catch (err) {
      console.error("Error fetching YouTube info:", err);
      return message.reply("Failed to fetch video info.");
    }

    data.queue.push({
      url: videoInfo.url,
      title: videoInfo.title
    });

    if (!data.playing) {
      await playNext(guild.id, channel);
    } else {
      await message.reply(`✅ Added to queue: **${videoInfo.title}**`);
    }

    return;
  }

  if (cmd === "skip") {
    if (!data.playing || data.queue.length === 0) {
      return message.reply("Nothing is currently playing.");
    }
    data.player.stop();
    return message.reply("⏭️ Skipped.");
  }

  if (cmd === "stop") {
    data.queue = [];
    data.player.stop();
    if (data.connection) {
      data.connection.destroy();
      data.connection = null;
    }
    data.playing = false;
    return message.reply("⏹️ Stopped and cleared the queue.");
  }

  if (cmd === "leave") {
    if (data.connection) {
      data.connection.destroy();
      data.connection = null;
    }
    data.queue = [];
    data.playing = false;
    return message.reply("👋 Left the voice channel.");
  }

  if (cmd === "queue") {
    if (!data.queue.length) {
      return message.reply("Queue is empty.");
    }
    const list = data.queue
      .map((track, i) => `${i === 0 ? "▶️" : `${i}.`} ${track.title}`)
      .join("\n");
    return message.reply(`📜 **Queue:**\n${list}`);
  }
}
