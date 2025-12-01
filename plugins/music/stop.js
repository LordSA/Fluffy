const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'stop',
    description: 'Stop music and leave',
    async execute(client, message, args) {
        const player = useMainPlayer();
        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply("No music is playing!");
        }

        queue.delete();
        return message.reply("Stopped the music and cleared the queue.");
    }
};