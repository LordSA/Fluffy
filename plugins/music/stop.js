const { deleteQueue } = require('../../utils/queue');

module.exports = {
    name: 'stop',
    description: 'Stops music and clears queue',
    async execute(message, args, client) {
        if (client.config.Music.Engine === 'lavalink') {
            const player = client.shoukaku.players.get(message.guild.id);
            if (!player) return message.reply("❌ Nothing playing.");
            player.destroy();
            deleteQueue(message.guild.id);
            message.reply('🛑 Stopped.');
        }
    }
};