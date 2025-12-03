const { EmbedBuilder } = require("discord.js");
const prettyMilliseconds = require("pretty-ms");

const nowPlayingMap = new Map();

module.exports = {
    handleNowPlaying: async (client, player, track, channelId) => {
        const channel = client.channels.cache.get(channelId);
        if (!channel) return;

        const lastMsgId = nowPlayingMap.get(player.guildId);
        if (lastMsgId) {
            try {
                const oldMsg = await channel.messages.fetch(lastMsgId).catch(() => null);
                if (oldMsg) await oldMsg.delete();
            } catch (e) {}
        }

        let durationText = track.info.isStream ? "Live" : prettyMilliseconds(track.info.length, { colonNotation: true });

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Now playing ♪`, iconURL: client.config.IconURL })
            .setDescription(`[${track.info.title}](${track.info.uri})`)
            .setThumbnail(`https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`)
            .addFields(
                { name: "Requested by", value: `<@${client.user.id}>`, inline: true },
                { name: "Duration", value: `\`${durationText}\``, inline: true }
            )
            .setColor(client.config.EmbedColor === "RANDOM" ? "Random" : client.config.EmbedColor);

        const newMsg = await channel.send({ embeds: [embed] });
        nowPlayingMap.set(player.guildId, newMsg.id);

        if (client.io) {
            client.io.emit("trackStart", { guildId: player.guildId, track: track.info });
        }
    },

    handleQueueEnd: (client, player, channelId) => {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: "The queue has ended", iconURL: client.config.IconURL })
                .setColor(client.config.EmbedColor === "RANDOM" ? "Random" : client.config.EmbedColor)
                .setTimestamp();
            channel.send({ embeds: [embed] });
        }
        nowPlayingMap.delete(player.guildId);
    }
};