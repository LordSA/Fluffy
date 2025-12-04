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

                const isUrl = query.startsWith('http');
                let result;

                if (isUrl) {
                    result = await node.rest.resolve(query);
                } else {
                    result = await node.rest.resolve(`ytsearch:${query}`);

                    if (!result || result.loadType === 'empty' || result.loadType === 'error' || result.loadType === 'NO_MATCHES') {
                        result = await node.rest.resolve(`ytmsearch:${query}`);
                    }

                    if (!result || result.loadType === 'empty' || result.loadType === 'error' || result.loadType === 'NO_MATCHES') {
                        result = await node.rest.resolve(`scsearch:${query}`);
                    }
                }

                if (!result || result.loadType === 'empty' || result.loadType === 'error' || result.loadType === 'NO_MATCHES') {
                    return message.channel.send('❌ No results found on YouTube, YT Music, or SoundCloud.');
                }

                let rawTrack;
                
                switch (result.loadType) {
                    case 'track':
                    case 'TRACK_LOADED':
                        rawTrack = result.data || result.tracks[0];
                        break;
                    case 'search':
                    case 'SEARCH_RESULT':
                        rawTrack = Array.isArray(result.data) ? result.data[0] : result.tracks[0];
                        break;
                    case 'playlist':
                    case 'PLAYLIST_LOADED':
                        rawTrack = Array.isArray(result.data?.tracks) ? result.data.tracks[0] : result.tracks[0];
                        message.channel.send(`⚠️ Playlists are not fully supported yet. Playing first song.`);
                        break;
                    default:
                        return message.channel.send('❌ Unknown load type.');
                }

                if (!rawTrack) return message.channel.send('❌ Failed to load track data.');

                const encodedId = rawTrack.encoded || rawTrack.track;
                if (!encodedId) {
                    client.logger.error(`[Data Error] Track ID missing in: ${JSON.stringify(rawTrack)}`);
                    return message.channel.send("❌ Error: Lavalink returned incomplete data.");
                }

                const cleanTrack = {
                    encoded: encodedId,
                    info: {
                        title: rawTrack.info.title,
                        uri: rawTrack.info.uri,
                        length: rawTrack.info.length,
                        isStream: rawTrack.info.isStream,
                        identifier: rawTrack.info.identifier
                    }
                };

                const q = getQueue(message.guild.id);
                const isPlaying = q.current !== null;

                addSong(message.guild.id, cleanTrack);

                if (isPlaying) {
                    return message.channel.send(`✅ Added to queue: **${cleanTrack.info.title}**`);
                }

                const player = await client.shoukaku.joinVoiceChannel({
                    guildId: message.guild.id,
                    channelId: channel.id,
                    shardId: message.guild.shardId || 0
                });

                const playNext = async () => {
                    const queue = getQueue(message.guild.id);
                    if (queue.songs.length === 0) {
                        client.shoukaku.leaveVoiceChannel(message.guild.id);
                        deleteQueue(message.guild.id);
                        handleQueueEnd(client, player, message.channel.id);
                        return;
                    }
                    
                    queue.current = queue.songs.shift(); 
                    
                    const trackString = queue.current.encoded;
                    
                    if (!trackString) {
                        client.logger.error(`[Queue Error] Song object is missing 'encoded' string: ${JSON.stringify(queue.current)}`);
                        message.channel.send("❌ Error: Queue data corrupted (missing track ID). Skipping...");
                        return playNext();
                    }

                    try {
                        client.logger.info(`[Lavalink] Playing Track: ${queue.current.info.title}`);
                        
                        await player.playTrack(trackString);
                        
                        handleNowPlaying(client, player, queue.current, message.channel.id);
                    } catch (e) {
                        client.logger.error(`[Lavalink Play Error] ${e.message}`);
                        message.channel.send(`❌ Lavalink refused to play: ${e.message}`);
                        
                        playNext();
                    }
                };

                player.removeAllListeners();
                player.on('start', () => {}); 
                player.on('end', (data) => {
                    if (data.reason === 'FINISHED' || data.reason === 'STOPPED') playNext();
                });
                player.on('exception', (e) => {
                    client.logger.error(`Track Exception: ${JSON.stringify(e)}`);
                    playNext();
                });

                playNext();
            } 
            else if (client.config.Music.Engine === 'distube') {
                client.distube.play(channel, query, { member: message.member, textChannel: message.channel, message });
            }
            else {
                await client.player.play(channel, query, { nodeOptions: { metadata: { channel: message.channel } } });
            }
        } catch (error) {
            client.logger.error(`Play Error: ${error.message}`);
            message.channel.send(`❌ Failed to play: \`${error.message}\``);
        }
    }
};