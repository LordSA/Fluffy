const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'pause',
    description: 'Pause or Resume music',
    async execute(client, message, args) {
        const player = useMainPlayer();
        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying()) {
            return message.reply("No music is playing!");
        }

        const isPaused = queue.node.isPaused();
        queue.node.setPaused(!isPaused);

        return message.reply(isPaused ? "▶️ Resumed!" : "f⏸️ Paused!");
    }
};