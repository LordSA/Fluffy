module.exports = {
    name: 'pause',
    description: 'Pauses or Resumes the music',
    async execute(message, args, client) {
        // Lavalink
        if (client.config.Music.Engine === 'lavalink') {
            const player = client.shoukaku.players.get(message.guild.id);
            if (!player) return message.reply("❌ Nothing is playing.");
            
            const isPaused = !player.paused;
            player.setPaused(isPaused);
            message.reply(isPaused ? "⏸️ **Paused**" : "▶️ **Resumed**");
        }
        // DisTube
        else if (client.config.Music.Engine === 'distube') {
            const queue = client.distube.getQueue(message);
            if (!queue) return message.reply("❌ Nothing is playing.");
            
            if (queue.paused) {
                queue.resume();
                message.reply("▶️ **Resumed**");
            } else {
                queue.pause();
                message.reply("⏸️ **Paused**");
            }
        }
    }
};