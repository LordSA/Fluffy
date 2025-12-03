module.exports = {
    name: 'play',
    description: 'Play music using the selected engine',
    async execute(message, args, client) {
        const { channel } = message.member.voice;
        if (!channel) return message.reply('❌ You must be in a voice channel.');
        
        const query = args.join(' ');
        if (!query) return message.reply('❌ Please provide a song name or link.');

        try {
            if (client.config.MUSIC.ENGINE === 'distube') {
                await client.distube.play(channel, query, {
                    member: message.member,
                    textChannel: message.channel,
                    message
                });
                message.reply(`🎵 **DisTube**: Searching for \`${query}\`...`);
            } 
            else {
                await client.player.play(channel, query, {
                    nodeOptions: {
                        metadata: { channel: message.channel }
                    }
                });
                message.reply(`🎵 **Discord-Player**: Searching for \`${query}\`...`);
            }
        } catch (error) {
            client.logger.error(`Play Error: ${error.message}`);
            message.reply('❌ Failed to play music.');
        }
    }
};