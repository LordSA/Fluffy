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
                name: "Public Node",
                url: "lavalink.darrennathanael.com:8888", // Free node (use your own if possible)
                auth: "password",
                secure: false
            }
        ]
    }
};