require('dotenv').config();

module.exports = {
    Token: process.env.TOKEN || "",
    Prefix: process.env.PREFIX || ".",
    OwnerID: process.env.OWNER_ID || "",
    EmbedColor: "Random",
    
    Presence: {
        status: "online", 
        name: "Music & AI", 
        type: "LISTENING"
    },

    Music: {
        Engine: process.env.MUSIC_ENGINE || 'lavalink', 
        Lavalink: [
            {
                id: "AjieBlogs-v4",
                host: "lava-v4.ajieblogs.eu.org",
                port: 443,
                pass: "https://dsc.gg/ajidevserver",
                secure: true,
                retryAmount: 50,
                retryDelay: 10000
            },
            {
                id: "Trinium-v4",
                host: "lavalink-v4.triniumhost.com",
                port: 443,
                pass: "free",
                secure: true,
                retryAmount: 50,
                retryDelay: 10000
            }
        ]
    },

    Spotify: {
        ClientID: process.env.SPOTIFY_CLIENT_ID || "",
        ClientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
    },
    AI: {
        GeminiKey: process.env.GEMINI_KEY || ""
    },

    Dashboard: {
        Enabled: true,
        Port: 3000
    }
};