const { useMainPlayer } = require('discord-player');

module.exports = {
    commands: [
        {
            name: 'play',
            description: 'Play music',
            async execute(client, message, args) {
                const player = useMainPlayer();
                if (!message.member.voice.channel) return message.reply("Join a VC!");
                
                try {
                    const { track } = await player.play(message.member.voice.channel, args.join(" "), {
                        nodeOptions: { metadata: message }
                    });
                    return message.reply(`🎶 Playing **${track.title}**`);
                } catch (e) {
                    return message.reply(`Error: ${e.message}`);
                }
            }
        }
    ]
};