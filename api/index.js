const express = require("express");
const router = express.Router();

module.exports = (client) => {
    // Home Page
    router.get("/", (req, res) => {
        res.render("index", { 
            bot: client, 
            user: client.user 
        });
    });

    // Dashboard Page
    router.get("/dashboard", (req, res) => {
        res.render("dashboard", { 
            bot: client,
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            queue: client.config.Music.Engine === 'lavalink' 
                ? "Active (Lavalink)" 
                : "Inactive"
        });
    });

    // API Endpoint: Get Current Song (For Frontend Fetching)
    router.get("/api/nowplaying/:guildId", (req, res) => {
        const queue = require("../utils/queue").getQueue(req.params.guildId);
        if (queue && queue.current) {
            res.json({ 
                playing: true, 
                track: queue.current.info 
            });
        } else {
            res.json({ playing: false });
        }
    });

    return router;
};