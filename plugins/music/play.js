const { useMainPlayer, QueryType } = require('discord-player');

module.exports = {
    name: 'play',
    description: 'Play music in VC',
    async execute(client, message, args) {
        const player = useMainPlayer();
        const channel = message.member.voice.channel;

        if (!channel) return message.reply("Join a Voice Channel first!");
        if (!args.length) return message.reply("Please provide a song name!");

        try {
            const { track } = await player.play(channel, args.join(" "), {
                nodeOptions: { metadata: message },
                searchEngine: QueryType.YOUTUBE_SEARCH
            });
            return message.reply(`Now Playing: ${track.title}`);
        } catch (e) {
            return message.reply(`Error: ${e.message}`);
        }
    }
};