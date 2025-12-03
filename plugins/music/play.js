const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Play music using the selected engine',
    async execute(message, args, client) {
        const { channel } = message.member.voice;
        
        if (!channel) return message.reply('❌ You must be in a voice channel.');

        const permissions = channel.permissionsFor(client.user);
        if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
            return message.reply('❌ I do not have permission to join or speak in your voice channel!');
        }
        
        const query = args.join(' ');
        if (!query) return message.reply('❌ Please provide a song name or link.');

        try {
            const searchMsg = await message.reply(`🔍 **${client.config.MUSIC.ENGINE === 'distube' ? 'DisTube' : 'Discord-Player'}**: Searching for \`${query}\`...`);

            if (client.config.MUSIC.ENGINE === 'distube') {
                await client.distube.play(channel, query, {
                    member: message.member,
                    textChannel: message.channel,
                    message
                });
            } 
            else {
                await client.player.play(channel, query, {
                    nodeOptions: {
                        metadata: { channel: message.channel }
                    }
                });
            }
        } catch (error) {
            client.logger.error(`Play Error: ${error.message}`);
            message.channel.send(`❌ Failed to play music: \`${error.message}\``);
        }
    }
};