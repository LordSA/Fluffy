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
                name: "Lavalink-Host",
                url: "v4.lavalink.host:443",
                auth: "youshallnotpass",
                secure: true
            },
            {
                name: "Helia-Host",
                url: "lava.heliahost.com:443",
                auth: "free",
                secure: true
            },
            {
                name: "Komet-SSL",
                url: "lavalink.komet.space:443",
                auth: "komet",
                secure: true
            },
            {
                name: "Trinium-v4",
                url: "lavalink-v4.triniumhost.com:443",
                auth: "free",
                secure: true
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