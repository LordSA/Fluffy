const { getQueue } = require('../../utils/queue');

module.exports = {
    name: 'queue',
    description: 'Show current queue',
    async execute(message, args, client) {
        let queueList = [];

        // Lavalink
        if (client.config.Music.Engine === 'lavalink') {
            const q = getQueue(message.guild.id);
            if (!q || !q.current) return message.reply("❌ Queue is empty.");
            
            queueList.push(`**Now Playing:** ${q.current.info.title}`);
            q.songs.forEach((track, i) => {
                queueList.push(`${i + 1}. ${track.info.title}`);
            });
        }
        // DisTube
        else if (client.config.Music.Engine === 'distube') {
            const q = client.distube.getQueue(message);
            if (!q) return message.reply("❌ Queue is empty.");
            
            queueList = q.songs.map((song, i) => 
                `${i === 0 ? '**Now Playing:**' : `${i}.`} ${song.name}`
            );
        }

        const output = queueList.slice(0, 10).join('\n');
        message.channel.send(`📜 **Queue**\n\n${output}`);
    }
};