/*const discordTTS = require('discord-tts');
const { createAudioResource, createAudioPlayer, joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    name: 'tts',
    description: 'Speak text in VC',
    async execute(client, message, args) {
        const channel = message.member.voice.channel;
        if (!channel) return message.reply("Join a VC!");

        const stream = discordTTS.getVoiceStream(args.join(" "));
        const resource = createAudioResource(stream, { inlineVolume: true, inputType: 'arbitrary' });
        const player = createAudioPlayer();

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        player.play(resource);
        connection.subscribe(player);
        message.react('🗣️');
    }
};*/