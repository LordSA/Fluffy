const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const fs = require('fs');
const config = require('./config');
const logger = require('./utils/logger');

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

// --- DUAL ENGINE INITIALIZATION ---
if (config.MUSIC.ENGINE === 'distube') {
    client.distube = new DisTube(client, {
        leaveOnStop: false,
        emitNewSongOnly: true,
        plugins: [
            new SpotifyPlugin({
                api: {
                    clientId: config.MUSIC.SPOTIFY_ID,
                    clientSecret: config.MUSIC.SPOTIFY_SECRET
                }
            }),
            new YtDlpPlugin()
        ]
    });
    logger.info('System: DisTube Engine Initialized');
} else {
    client.player = new Player(client);
    client.player.extractors.loadMulti(DefaultExtractors);
    logger.info('System: Discord-Player Engine Initialized');
}

// --- COMMAND HANDLER ---
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

// --- EVENTS ---
client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
    logger.info(`Active Music Engine: ${config.MUSIC.ENGINE.toUpperCase()}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(config.PREFIX)) return;

    const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (command) {
        try {
            logger.info(`Cmd: ${commandName} | User: ${message.author.tag} | Guild: ${message.guild.name}`);
            await command.execute(message, args, client);
        } catch (error) {
            logger.error(`Error in ${commandName}: ${error.message}`);
            message.reply('❌ An error occurred executing that command.');
        }
    }
});

// --- MUSIC EVENT LISTENERS ---

if (config.MUSIC.ENGINE === 'distube') {
    client.distube
        .on('playSong', (queue, song) => {
            const msg = `🎶 Playing: **${song.name}** \`[${song.formattedDuration}]\``;
            queue.textChannel.send(msg);
            client.logger.info(`DisTube Play: ${song.name} in ${queue.voiceChannel.guild.name}`);
        })
        .on('error', (channel, e) => {
            if (channel) channel.send(`❌ An error encountered: ${e.toString().slice(0, 1979)}`);
            client.logger.error(`DisTube Error: ${e}`);
        });
} else {
    // Discord Player Events
    client.player.events.on('playerStart', (queue, track) => {
        const msg = `🎶 Playing: **${track.title}** \`[${track.duration}]\``;
        queue.metadata.channel.send(msg);
        client.logger.info(`Player Play: ${track.title} in ${queue.guild.name}`);
    });
    
    client.player.events.on('error', (queue, error) => {
        client.logger.error(`Player Error: ${error.message}`);
    });
}

client.login(config.TOKEN);