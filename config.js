require('dotenv').config();

module.exports = {
    TOKEN: process.env.TOKEN,
    PREFIX: process.env.PREFIX || ".",
    OWNER_ID: process.env.OWNER_ID,
    GEMINI_KEY: process.env.GEMINI_KEY,
    MONGO_URL: process.env.MONGO_URL,
    LOG_CHANNEL: process.env.LOG_CHANNEL,
    MUSIC: {
        ENGINE: process.env.MUSIC_ENGINE || 'lavalink', 
        SPOTIFY_ID: process.env.SPOTIFY_CLIENT_ID,
        SPOTIFY_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
        LAVALINK: [
            {
                name: "Lavalink-1",
                url: "lava-v4.ajieblogs.eu.org:443", // Free node (use your own if possible)
                auth: "https://ajieblogs.eu.org",
                secure: true
            },
            {
                name: "Lavalink-2",
                url: "lavalink.komet.space:443",
                auth: "komet",
                secure: true
            }
        ]
    }
};