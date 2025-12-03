const { useQueue } = require("discord-player");

module.exports = {
    name: 'skip',
    description: 'Skips the current song',
    async execute(message, args, client) {
        const { channel } = message.member.voice;
        if (!channel) return message.reply('❌ You must be in the voice channel.');

        try {
            if (client.config.MUSIC.ENGINE === 'distube') {
                client.distube.skip(message);
                message.reply('⏭️ **DisTube**: Skipped song.');
            } else {
                const queue = useQueue(message.guild.id);
                if (queue) queue.node.skip();
                message.reply('⏭️ **Discord-Player**: Skipped song.');
            }
            client.logger.info(`Music Skipped by ${message.author.tag}`);
        } catch (e) {
            message.reply('❌ No more songs in queue.');
        }
    }
};