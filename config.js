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
                name: "Local-Node",
                url: "localhost:6777",   
                auth: "passedaway", 
                secure: false
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