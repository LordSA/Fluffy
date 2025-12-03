const { PermissionsBitField } = require('discord.js');
const { getQueue, addSong, deleteQueue } = require('../../utils/queue');
const { handleNowPlaying } = require('../../utils/playerUtils');

module.exports = {
    name: 'play',
    description: 'Play music from Spotify, YouTube, or SoundCloud',
    async execute(message, args, client) {
        const { channel } = message.member.voice;
        if (!channel) return message.reply('❌ Join a voice channel first!');

        const query = args.join(' ');
        
        // --- LAVALINK ENGINE ---
        if (client.config.Music.Engine === 'lavalink') {
            const node = client.shoukaku.getIdealNode();
            if (!node) return message.reply('❌ Lavalink not ready.');

            const result = await node.rest.resolve(query.startsWith('http') ? query : `ytsearch:${query}`);
            if (!result || result.loadType === 'empty') return message.reply('❌ No results found.');

            const track = result.tracks.shift();
            const q = getQueue(message.guild.id);
            const isPlaying = q.current !== null;

            addSong(message.guild.id, track);

            if (isPlaying) {
                return message.reply(`✅ Added to queue: **${track.info.title}**`);
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
                    return;
                }
                
                queue.current = queue.songs.shift();
                await player.playTrack({ track: queue.current.track });
                handleNowPlaying(client, player, queue.current, message.channel.id);
            };

            // Events to cycle through queue
            player.on('start', () => {}); 
            player.on('end', () => playNext());
            player.on('exception', () => playNext());
            playNext();
        } 
        
        // --- DISTUBE ENGINE ---
        else if (client.config.Music.Engine === 'distube') {
            client.distube.play(channel, query, {
                member: message.member,
                textChannel: message.channel,
                message
            });
        }
        // --- DISCORD-PLAYER ---
        else {
            const player = client.player;
            await player.play(channel, query, {
                nodeOptions: { metadata: { channel: message.channel } }
            });
        }
    }
};