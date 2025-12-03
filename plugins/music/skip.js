module.exports = {
    name: 'skip',
    description: 'Skips the current song',
    async execute(message, args, client) {
        if (client.config.Music.Engine === 'lavalink') {
            const player = client.shoukaku.players.get(message.guild.id);
            if (!player) return message.reply("❌ Nothing playing.");
            player.stopTrack();
            message.reply("⏭️ Skipped!");
        }
    }
};