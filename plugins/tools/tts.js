const { createAudioResource, createAudioPlayer, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const axios = require('axios');

const VOICES = [
    "nova", "alloy", "ash", "coral", "echo",
    "fable", "onyx", "sage", "shimmer"
];

const INDIAN_LANGUAGES = {
    "malayalam": "Malayalam",
    "hindi": "Hindi",
    "tamil": "Tamil",
    "bengali": "Bengali",
    "telugu": "Telugu",
    "marathi": "Marathi",
    "gujarati": "Gujarati",
    "kannada": "Kannada",
    "punjabi": "Punjabi",
    "urdu": "Urdu",
    "english": "coral"
};

const GOOGLE_CODES = {
    "malayalam": "ml", "hindi": "hi", "tamil": "ta", "bengali": "bn",
    "telugu": "te", "marathi": "mr", "gujarati": "gu", "kannada": "kn",
    "punjabi": "pa", "urdu": "ur", "english": "en"
};

const LANGUAGE_PATTERNS = {
    "malayalam": /[\u0d00-\u0d7f]/,
    "hindi": /[\u0900-\u097f]/,
    "tamil": /[\u0b80-\u0bff]/,
    "bengali": /[\u0980-\u09ff]/,
    "telugu": /[\u0c00-\u0c7f]/,
    "gujarati": /[\u0a80-\u0aff]/,
    "kannada": /[\u0c80-\u0cff]/,
    "marathi": /[\u0900-\u097f]/,
    "punjabi": /[\u0a00-\u0a7f]/,
    "urdu": /[\u0600-\u06ff]/
};

function detectLanguage(text) {
    for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
        if (pattern.test(text)) return lang;
    }
    return "english";
}

function getVoiceConfig(input) {
    if (!input) return { name: "coral", type: "english" };
    
    const v = input.toLowerCase().trim();
    
    if (INDIAN_LANGUAGES[v]) {
        return { name: INDIAN_LANGUAGES[v], type: "indian", code: v };
    }
    
    if (VOICES.includes(v)) {
        return { name: v, type: "english", code: "english" };
    }
    
    return null;
}

async function getAudioUrl(text, voiceConfig) {
    const voiceName = voiceConfig.name;

    if (VOICES.includes(voiceName) || ["Hindi", "Tamil", "Bengali"].includes(voiceName)) {
        try {
            const formData = new URLSearchParams();
            formData.append('msg', text);
            formData.append('lang', voiceName);
            formData.append('source', 'ttsmp3');

            const response = await axios.post('https://ttsmp3.com/makemp3_ai.php', formData, {
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.data && response.data.URL) {
                return response.data.URL;
            }
        } catch (e) {
            console.error(e.message);
        }
    }

    let langCode = GOOGLE_CODES[voiceConfig.code] || "en";
    const encodedText = encodeURIComponent(text.slice(0, 200));
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;
}

module.exports = {
    name: 'tts',
    description: 'Speak text in VC with Indian Language Support',
    async execute(client, message, args) {
        const channel = message.member.voice.channel;
        if (!channel) return message.reply("❌ Join a Voice Channel first!");

        let textToSpeak = args.join(" ");
        let voiceConfig = { name: "coral", type: "english", code: "english" };

        if (args.length > 0) {
            const potentialVoice = getVoiceConfig(args[0]);
            if (potentialVoice) {
                voiceConfig = potentialVoice;
                textToSpeak = args.slice(1).join(" ");
            } else {
                const detectedLang = detectLanguage(textToSpeak);
                if (detectedLang !== "english") {
                    voiceConfig = { 
                        name: INDIAN_LANGUAGES[detectedLang], 
                        type: "indian", 
                        code: detectedLang 
                    };
                }
            }
        }

        if (!textToSpeak && message.reference) {
            const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
            textToSpeak = repliedMsg.content || repliedMsg.caption;
            
            if (!args.length) {
                const detectedLang = detectLanguage(textToSpeak);
                if (detectedLang !== "english") {
                    voiceConfig = { 
                        name: INDIAN_LANGUAGES[detectedLang], 
                        type: "indian", 
                        code: detectedLang 
                    };
                }
            }
        }

        if (!textToSpeak) return message.reply("❌ Please provide text or reply to a message!");

        const processingMsg = await message.reply(`🎙️ Generating audio (${voiceConfig.name})...`);

        try {
            const audioUrl = await getAudioUrl(textToSpeak, voiceConfig);
            
            if (!audioUrl) throw new Error("Failed to generate audio URL.");

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const resource = createAudioResource(audioUrl, { 
                inlineVolume: true 
            });
            
            const player = createAudioPlayer();
            
            connection.subscribe(player);
            player.play(resource);

            player.on(AudioPlayerStatus.Playing, () => {
                processingMsg.edit(`🗣️ Playing **${voiceConfig.name}**: "${textToSpeak.slice(0, 30)}..."`);
            });

            player.on('error', error => {
                console.error(error);
                processingMsg.edit("❌ Error playing audio.");
            });

        } catch (error) {
            console.error(error);
            processingMsg.edit("❌ Failed to process TTS request.");
        }
    }
};