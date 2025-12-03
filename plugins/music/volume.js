module.exports = {
    name: 'volume',
    description: 'Change volume (1-100)',
    async execute(message, args, client) {
        const vol = parseInt(args[0]);
        if (!vol || vol < 1 || vol > 100) return message.reply("❌ Please provide a volume between 1 and 100.");

        if (client.config.Music.Engine === 'lavalink') {
            const player = client.shoukaku.players.get(message.guild.id);
            if (player) {
                player.setGlobalVolume(vol); // Shoukaku v4
                message.reply(`🔊 Volume set to **${vol}%**`);
            }
        }
        else if (client.config.Music.Engine === 'distube') {
            client.distube.setVolume(message, vol);
            message.reply(`🔊 Volume set to **${vol}%**`);
        }
    }
};