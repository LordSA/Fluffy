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
            const searchMsg = await message.reply(`🔍 **${client.config.MUSIC.ENGINE.toUpperCase()}**: Searching for \`${query}\`...`);
            
            if (client.config.MUSIC.ENGINE === 'lavalink') { //lavalink
                const node = client.shoukaku.getIdealNode();
                if (!node) return message.reply('❌ Lavalink node is not ready yet!');

                const result = await node.rest.resolve(query.startsWith('http') ? query : `ytsearch:${query}`);
                if (!result || result.loadType === 'NO_MATCHES' || result.loadType === 'empty') {
                     return message.reply('❌ No results found.');
                }
                const track = result.tracks.shift();
                const player = await node.joinVoiceChannel({
                    guildId: message.guild.id,
                    channelId: channel.id,
                    shardId: 0
                });

                player.on('start', () => {
                    message.channel.send(`🎶 **Lavalink**: Playing **${track.info.title}**`);
                });
                player.on('end', () => {
                    player.destroy();
                });

                player.playTrack({ track: track.track });
            } else if (client.config.MUSIC.ENGINE === 'distube') { //distube
                await client.distube.play(channel, query, {
                    member: message.member,
                    textChannel: message.channel,
                    message
                });
            } else { //discord player
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