const { PermissionsBitField } = require('discord.js');
const { getQueue, addSong, deleteQueue } = require('../../utils/queue');
const { handleNowPlaying, handleQueueEnd } = require('../../utils/playerUtils');

module.exports = {
    name: 'play',
    description: 'Play music using the selected engine',
    async execute(message, args, client) {
        const { channel } = message.member.voice;
        if (!channel) return message.reply('❌ Join a voice channel first!');

        const permissions = channel.permissionsFor(client.user);
        if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
            return message.reply('❌ I do not have permission to join or speak in your voice channel!');
        }

        const query = args.join(' ');
        if (!query) return message.reply('❌ Please provide a song name or link.');

        try {
            await message.reply(`🔍 **${client.config.Music.Engine.toUpperCase()}**: Searching for \`${query}\`...`);

            if (client.config.Music.Engine === 'lavalink') {
                const node = client.shoukaku.getIdealNode();
                if (!node) return message.channel.send('❌ Lavalink not ready.');

                const result = await node.rest.resolve(query.startsWith('http') ? query : `ytsearch:${query}`);
                if (!result || result.loadType === 'empty') return message.channel.send('❌ No results found.');

                const track = result.tracks.shift();
                const q = getQueue(message.guild.id);
                const isPlaying = q.current !== null;

                addSong(message.guild.id, track);

                if (isPlaying) {
                    return message.channel.send(`✅ Added to queue: **${track.info.title}**`);
                }

                const player = await node.joinVoiceChannel({
                    guildId: message.guild.id,
                    channelId: channel.id,
                    shardId: 0
                });

                const playNext = async () => {
                    const queue = getQueue(message.guild.id);
                    if (queue.songs.length === 0) {
                        player.destroy();
                        deleteQueue(message.guild.id);
                        handleQueueEnd(client, player, message.channel.id);
                        return;
                    }
                    
                    queue.current = queue.songs.shift(); 
                    await player.playTrack({ track: queue.current.track });
                    handleNowPlaying(client, player, queue.current, message.channel.id);
                };

                player.on('start', () => {}); 
                player.on('end', () => playNext());
                player.on('exception', () => playNext());

                playNext();
            } 
            else if (client.config.Music.Engine === 'distube') {
                client.distube.play(channel, query, {
                    member: message.member,
                    textChannel: message.channel,
                    message
                });
            }
            else {
                await client.player.play(channel, query, {
                    nodeOptions: { metadata: { channel: message.channel } }
                });
            }
        } catch (error) {
            client.logger.error(`Play Error: ${error.message}`);
            message.channel.send(`❌ Failed to play: \`${error.message}\``);
        }
    }
};