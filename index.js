const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
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

client.config = config;
client.logger = logger;
client.commands = new Collection();
client.aiChannels = new Set();
client.database = { guild: new Jsoning("guild.json") };

if (config.Dashboard && config.Dashboard.Enabled) {
    client.server = Express();
    client.http = http.createServer(client.server);
    client.server.set('view engine', 'ejs');
    client.server.set('views', path.join(__dirname, 'views'));
    client.server.use(Express.static(path.join(__dirname, 'public')));
    client.server.use("/", require("./api")(client));

    const io = require("socket.io")(client.http);
    client.io = io; 
    require("./api/socket")(io, client);

    client.http.listen(config.Dashboard.Port || 3000, () => 
        logger.log(`Web Server running on port ${config.Dashboard.Port || 3000}`)
    );
}

if (config.Music.Engine === 'distube') { //distube
    client.distube = new DisTube(client, {
        emitNewSongOnly: true,
        ffmpeg: { path: ffmpegPath },
        plugins: [ new SpotifyPlugin({ api: { clientId: config.Spotify.ClientID, clientSecret: config.Spotify.ClientSecret } }), new YtDlpPlugin() ]
    });
    logger.info('System: DisTube Initialized');
} 
else if (config.Music.Engine === 'lavalink') { //lavalink
    client.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), config.Music.Lavalink, { 
        moveOnDisconnect: false, 
        resume: false, 
        reconnectTries: 5,
        restTimeout: 10000 
    });
    client.shoukaku.on('error', (_, e) => logger.error(`Lavalink Error: ${e}`));
    client.shoukaku.on('ready', (name) => logger.info(`✅ Lavalink Node [${name}] Ready`));
    logger.info('System: Lavalink Initialized');
}
else { //discord player
    client.player = new Player(client);
    client.player.extractors.loadMulti(DefaultExtractors);
    logger.info('System: Discord-Player Initialized');
}

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