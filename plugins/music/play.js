const { handleNowPlaying } = require('../../utils/playerUtils');

if (client.config.Music.Engine === 'lavalink') {
    const node = client.shoukaku.getIdealNode();

    const player = await node.joinVoiceChannel({
        guildId: message.guild.id,
        channelId: channel.id,
        shardId: 0
    });

    player.on('start', (data) => {
         handleNowPlaying(client, player, track, message.channel.id);
    });

    player.on('end', () => {
    });

    player.playTrack({ track: track.track });
}