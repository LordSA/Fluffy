const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { Shoukaku, Connectors } = require('shoukaku');
const http = require("http");
const Express = require("express");
const Jsoning = require("jsoning");
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');
const loadEvents = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- GLOBALS ---
client.config = config;
client.logger = logger;
client.commands = new Collection();
client.aiChannels = new Set();
client.database = { guild: new Jsoning("guild.json") };

// --- WEB SERVER ---
if (config.Dashboard && config.Dashboard.Enabled) {
    client.server = Express();
    client.http = http.createServer(client.server);
    client.server.set('view engine', 'ejs');
    client.server.set('views', path.join(__dirname, 'views'));
    client.server.use(Express.static(path.join(__dirname, 'public')));

    client.server.get('/', (req, res) => res.render('index', { bot: client, user: client.user }));
    client.server.get('/dashboard', (req, res) => res.render('dashboard', { bot: client, guilds: client.guilds.cache.size, users: client.users.cache.size }));

    client.http.listen(config.Dashboard.Port || 3000, () => logger.log(`Web Server running on port ${config.Dashboard.Port || 3000}`));
}

// --- MUSIC ENGINES ---
if (config.Music.Engine === 'distube') {
    client.distube = new DisTube(client, {
        emitNewSongOnly: true,
        ffmpeg: { path: ffmpegPath },
        plugins: [ new SpotifyPlugin({ api: { clientId: config.Spotify.ClientID, clientSecret: config.Spotify.ClientSecret } }), new YtDlpPlugin() ]
    });
    client.distube.on('playSong', (q, s) => q.textChannel.send(`🎶 Playing: **${s.name}**`));
    logger.info('System: DisTube Initialized');
} 
else if (config.Music.Engine === 'lavalink') {
    client.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), config.Music.Lavalink, { moveOnDisconnect: false, resume: false, reconnectTries: 5 });
    client.shoukaku.on('error', (_, e) => logger.error(`Lavalink Error: ${e}`));
    client.shoukaku.on('ready', (name) => logger.info(`✅ Lavalink Node [${name}] Ready`));
    logger.info('System: Lavalink Initialized');
}
else {
    client.player = new Player(client);
    client.player.extractors.loadMulti(DefaultExtractors);
    client.player.events.on('playerStart', (q, t) => q.metadata.channel.send(`🎶 Playing: **${t.title}**`));
    logger.info('System: Discord-Player Initialized');
}

// --- LOADERS ---
// Load Commands
const loadPlugins = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) loadPlugins(path.join(dir, file.name));
        else if (file.name.endsWith('.js')) {
            const cmd = require(path.join(dir, file.name));
            client.commands.set(cmd.name, cmd);
            logger.info(`Command Loaded: ${cmd.name}`);
        }
    }
};
loadPlugins(path.join(__dirname, 'plugins'));
loadEvents(client);

client.login(config.Token);