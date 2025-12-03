module.exports = {
    name: 'play',
    description: 'Play a song or playlist',
    async execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ You need to be in a Voice Channel!');

        const query = args.join(' ');
        if (!query) return message.reply('❌ Please enter a song name or link!');

        try {
            await client.distube.play(voiceChannel, query, {
                member: message.member,
                textChannel: message.channel,
                message
            });
            message.reply(`🔍 Searching for \`${query}\`...`);
        } catch (e) {
            message.reply(`❌ Error: ${e.message}`);
        }
    }
};