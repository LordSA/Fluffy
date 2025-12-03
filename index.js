const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;
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
client.aiChannels = new Set();

if (config.MUSIC.ENGINE === 'distube') {
    client.distube = new DisTube(client, {
        emitNewSongOnly: true,
        ffmpeg: {
            path: ffmpegPath
        },
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
    logger.info(`Logged in as ${client.user.tag}`);
    logger.info(`Active Music Engine: ${config.MUSIC.ENGINE.toUpperCase()}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.startsWith(config.PREFIX)) {
        const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (command) {
            if (commandName !== 'chat' && client.aiChannels.has(message.channel.id)) {
                client.aiChannels.delete(message.channel.id);
                message.reply('🤖 **AI Chat Mode Paused** because you used a command.');
                logger.info(`AI Mode disabled in ${message.guild.name} (#${message.channel.name}) due to command: ${commandName}`);
            }

            try {
                logger.info(`Cmd: ${commandName} | User: ${message.author.tag} | Guild: ${message.guild.name}`);
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

            const genAI = new GoogleGenerativeAI(client.config.GEMINI_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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