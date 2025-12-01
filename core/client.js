const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

class ErenClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.commands = new Collection();
        this.config = require('../config');
        this.player = new Player(this);
        this.player.extractors.loadDefault();
        this.player.events.on('error', (queue, error) => {
            Logger.log(`[Music] Error: ${error.message}`, 'error');
        });
    }
    loadPlugins() {
        const pluginsPath = path.join(__dirname, '../plugins');
        const folders = fs.readdirSync(pluginsPath);

        for (const folder of folders) {
            const folderPath = path.join(pluginsPath, folder);
            if (folderPath.endsWith('.js')) {
                this.loadPluginFile(folderPath);
                continue;
            }
            if (fs.lstatSync(folderPath).isDirectory()) {
                const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                for (const file of files) {
                    this.loadPluginFile(path.join(folderPath, file));
                }
            }
        }
    }

    loadPluginFile(filePath) {
        try {
            const plugin = require(filePath);
            if (plugin.commands) {
                plugin.commands.forEach(cmd => {
                    this.commands.set(cmd.name, cmd);
                    Logger.log(`Loaded Command: ${cmd.name}`, 'cmd');
                });
            }
            if (plugin.onMessage) {
                this.on('messageCreate', (msg) => plugin.onMessage(this, msg));
            }
            if (plugin.onReady) {
                this.on('ready', () => plugin.onReady(this));
            }

        } catch (e) {
            Logger.log(`Failed to load ${filePath}: ${e.message}`, 'error');
        }
    }

    async start() {
        this.loadPlugins();
        await this.login(this.config.TOKEN);
        Logger.log(`Logged in as ${this.user.tag}`, 'ready');
    }
}

module.exports = ErenClient;