const { useQueue } = require("discord-player");

module.exports = {
    name: 'stop',
    description: 'Stops music and clears queue',
    async execute(message, args, client) {
        const { channel } = message.member.voice;
        if (!channel) return message.reply('❌ You must be in the voice channel.');

        try {
            if (client.config.MUSIC.ENGINE === 'distube') {
                client.distube.stop(message);
                message.reply('mj🛑 **DisTube**: Stopped music.');
            } else {
                const queue = useQueue(message.guild.id);
                if (queue) queue.delete();
                message.reply('🛑 **Discord-Player**: Stopped music.');
            }
            client.logger.info(`Music Stopped by ${message.author.tag}`);
        } catch (e) {
            message.reply('❌ No music is playing.');
        }
    }
};