const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client, GatewayIntentBits, Collection, ActivityType, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { Shoukaku, Connectors } = require('shoukaku');
const fs = require('fs');
const http = require("http");
const Express = require("express");
const Jsoning = require("jsoning");
const config = require('./config');
const logger = require('./utils/logger');
const { handleNowPlaying, handleQueueEnd } = require('./utils/playerUtils');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.config = config;
client.logger = logger;
client.commands = new Collection();
client.aiChannels = new Set();
client.database = {guild: new Jsoning("guild.json")};

// --- WEB SERVER (EXPRESS) ---
if (config.Dashboard && config.Dashboard.Enabled) {
    client.server = Express();
    client.http = http.createServer(client.server);

    client.server.set('view engine', 'ejs');
    client.server.set('views', path.join(__dirname, 'views'));
    
    client.server.use(Express.static(path.join(__dirname, 'public')));
    client.server.get('/', (req, res) => {
        res.render('index', { 
            bot: client, 
            user: client.user 
        });
    });

    client.server.get('/dashboard', (req, res) => {
        res.render('dashboard', { 
            bot: client, 
            guilds: client.guilds.cache.size,
            users: client.users.cache.size
        });
    });

    client.http.listen(config.Dashboard.Port || 3000, () => {
        logger.log(`Web Server started on port ${config.Dashboard.Port || 3000}`);
    });
}

if (config.Music.Engine === 'distube') {
    client.distube = new DisTube(client, {
        emitNewSongOnly: true,
        ffmpeg: { path: ffmpegPath },
        plugins: [
            new SpotifyPlugin({ api: { clientId: config.Spotify.ClientID, clientSecret: config.Spotify.ClientSecret } }),
            new YtDlpPlugin()
        ]
    });
    logger.info('System: DisTube Engine Initialized');
} else if (config.Music.Engine === 'lavalink') {
    client.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), config.Music.Lavalink, {
        moveOnDisconnect: false,
        resume: false,
        reconnectTries: 5,
        restTimeout: 10000
    });
    
    client.shoukaku.on('error', (_, error) => logger.error(`Lavalink Error: ${error}`));
    client.shoukaku.on('ready', (name) => logger.info(`✅ Lavalink Node [${name}] connected`));
    
    logger.info('System: Lavalink Engine Initialized');
} else {
    client.player = new Player(client);
    client.player.extractors.loadMulti(DefaultExtractors);
    logger.info('System: Discord-Player Engine Initialized');
}

const loadPlugins = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            loadPlugins(`${dir}/${file.name}`);
        } else if (file.name.endsWith('.js')) {
            const command = require(`${dir}/${file.name}`);
            client.commands.set(command.name, command);
            logger.info(`Plugin Loaded: ${command.name}`);
        }
    }
};

loadPlugins('./plugins');

client.once('clientReady', (c) => {
    logger.info(`Logged in as ${c.user.tag}`);
    logger.info(`Active Music Engine: ${config.Music.Engine.toUpperCase()}`);

    if (config.Presence) {
        client.user.setPresence({
            activities: [{ name: config.Presence.name, type: ActivityType[config.Presence.type] }],
            status: config.Presence.status
        });
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.guild) {
        let guildDB = await client.database.guild.get(message.guild.id);
        if (!guildDB) {
            await client.database.guild.set(message.guild.id, {
                prefix: config.Prefix,
                DJ: null
            });
        }
    }

    if (message.content.startsWith(config.Prefix)) {
        const args = message.content.slice(config.Prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (command) {
            if (commandName !== 'chat' && client.aiChannels.has(message.channel.id)) {
                client.aiChannels.delete(message.channel.id);
                message.reply('🤖 **AI Chat Mode Paused** because you used a command.');
            }
            try {
                await command.execute(message, args, client);
            } catch (error) {
                logger.error(`Error in ${commandName}: ${error.message}`);
                message.reply('❌ An error occurred executing that command.');
            }
        }
        return;
    }

    if (client.aiChannels.has(message.channel.id)) {
        try {
            message.channel.sendTyping();
            const genAI = new GoogleGenerativeAI(config.AI.GeminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(message.content);
            const response = await result.response;
            const text = response.text();

            if (text.length > 2000) {
                message.reply(text.substring(0, 2000));
                message.channel.send(text.substring(2000, 4000));
            } else {
                message.reply(text);
            }
        } catch (error) {
            logger.error(`AI Auto-Chat Error: ${error.message}`);
            message.channel.send('❌ AI had a hiccup. Try again.');
        }
    }
});

client.login(config.Token);