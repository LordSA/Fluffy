const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'skip',
    description: 'Skip current song',
    async execute(client, message, args) {
        const player = useMainPlayer();
        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying()) {
            return message.reply("No music is playing!");
        }

        queue.node.skip();
        return message.reply("Skipped to the next track!");
    }
};