const queues = new Map();

module.exports = {
    getQueue: (guildId) => {
        if (!queues.has(guildId)) {
            queues.set(guildId, {
                songs: [],
                current: null,
                loop: "off" // off, track, queue
            });
        }
        return queues.get(guildId);
    },
    
    deleteQueue: (guildId) => queues.delete(guildId),
    
    addSong: (guildId, song) => {
        const q = module.exports.getQueue(guildId);
        q.songs.push(song);
        return q;
    }
};