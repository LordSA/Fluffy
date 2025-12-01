const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require("discord-player-youtubei");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

class FluffyClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ]
        });

        this.commands = new Collection();
        this.config = require('../config');
        
        this.player = new Player(this);

        this.player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');
        this.player.extractors.register(YoutubeiExtractor, {});

        this.player.events.on('error', (queue, error) => {
            console.log(`[Player Error] ${error.message}`);
        });

        this.player.events.on('playerError', (queue, error) => {
            console.log(`[Connection Error] ${error.message}`);
        });

        if (this.config.MONGO_URL) {
            mongoose.connect(this.config.MONGO_URL)
                .then(() => console.log('Database Connected'))
                .catch(err => console.error(err));
        }
    }

    loadPlugins() {
        const readCommands = (dir) => {
            const files = fs.readdirSync(path.join(__dirname, dir));
            for (const file of files) {
                const stat = fs.lstatSync(path.join(__dirname, dir, file));
                if (stat.isDirectory()) {
                    readCommands(path.join(dir, file));
                } else if (file.endsWith('.js')) {
                    const cmd = require(path.join(__dirname, dir, file));
                    if (cmd.name) {
                        this.commands.set(cmd.name, cmd);
                        console.log(`Loaded: ${cmd.name}`);
                    }
                }
            }
        };
        readCommands('../plugins');
    }

    loadEvents() {
        const files = fs.readdirSync(path.join(__dirname, '../events')).filter(f => f.endsWith('.js'));
        for (const file of files) {
            const event = require(`../events/${file}`);
            const eventName = file.split('.')[0];
            this.on(eventName, event.bind(null, this));
        }
    }

    async start() {
        this.loadPlugins();
        this.loadEvents();
        await this.login(this.config.TOKEN);
    }
}

module.exports = FluffyClient;