const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'queue',
    description: 'Show upcoming songs',
    async execute(client, message, args) {
        const player = useMainPlayer();
        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying()) {
            return message.reply("No music is playing!");
        }

        const currentTrack = queue.currentTrack;
        const tracks = queue.tracks.toArray();

        if (tracks.length === 0) {
            return message.reply(`**Now Playing:** ${currentTrack.title}\n\nNo other songs in queue.`);
        }

        const nextSongs = tracks.slice(0, 10).map((track, i) => {
            return `${i + 1}. **${track.title}**`;
        }).join('\n');

        message.reply(`**Now Playing:** ${currentTrack.title}\n\n**Up Next:**\n${nextSongs}`);
    }
};