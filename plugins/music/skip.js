const { getQueue } = require('../../utils/queue'); // Our custom queue

module.exports = {
    name: 'skip',
    description: 'Skips the current song',
    async execute(message, args, client) {
        // Lavalink
        if (client.config.Music.Engine === 'lavalink') {
            const player = client.shoukaku.players.get(message.guild.id);
            if (!player) return message.reply("❌ Nothing is playing.");
            
            player.stopTrack(); // This triggers 'end' event, which calls playNext()
            message.reply("⏭️ **Skipped!**");
        }
        // DisTube
        else if (client.config.Music.Engine === 'distube') {
            client.distube.skip(message);
            message.reply("⏭️ **Skipped!**");
        }
    }
};