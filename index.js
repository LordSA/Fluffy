import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import axios from 'axios';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

const DEFAULT_PERSONA =
  "You are Fluffy, an emotionally expressive, caring, slightly chaotic AI friend on Discord. " +
  "You talk in a casual Gen Z style (but no cringe, no swearing at users), and you keep replies helpful and concise.";

const DEFAULT_MOOD = 'playful';

const channelState = new Map();

function getChannelState(channelId) {
  if (!channelState.has(channelId)) {
    channelState.set(channelId, {
      active: false,
      mood: DEFAULT_MOOD,
      persona: DEFAULT_PERSONA
    });
  }
  return channelState.get(channelId);
}

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGeminiAPI({ userMessage, persona, mood }) {
  const prompt = `
Persona:
${persona}

Current emotional mood: ${mood}.
Reflect this mood in your tone (but stay respectful and helpful).

User message:
${userMessage}
`.trim();

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      return '⚠️ Gemini responded but gave me an empty answer.';
    }

    return reply;
  } catch (error) {
    console.error('❌ Gemini API Error:');
    console.error(error.response?.data || error.message);

    const errMsg =
      error.response?.data?.error?.message ||
      error.message ||
      'Unknown Gemini API error';

    return `❌ Gemini API Error:\n\`\`\`${errMsg}\`\`\``;
  }
}

const COMMAND_PREFIX = '!';

async function handleCommand(message) {
  const [rawCmd, ...args] = message.content
    .slice(COMMAND_PREFIX.length)
    .trim()
    .split(/\s+/);

  const cmd = rawCmd.toLowerCase();
  const channelId = message.channel.id;
  const state = getChannelState(channelId);

  if (cmd === 'start') {
    state.active = true;
    return message.reply(
      `✨ Chat mode **ON** in this channel.\n` +
      `I’ll reply to messages here until you type \`!stop\`.`
    );
  }

  if (cmd === 'stop') {
    state.active = false;
    return message.reply('🛑 Chat mode **OFF** in this channel.');
  }

  if (cmd === 'mood') {
    const newMood = args.join(' ').trim();
    if (!newMood) {
      return message.reply(
        `Current mood: **${state.mood}**.\n` +
        `Set a new mood like: \`!mood cozy\` or \`!mood chaotic gremlin\`.`
      );
    }
    state.mood = newMood;
    return message.reply(`💖 Mood updated! I now feel **${state.mood}**.`);
  }

  if (cmd === 'persona') {
    const newPersona = args.join(' ').trim();
    if (!newPersona) {
      return message.reply(
        'Give me a new personality description.\n' +
        'Example:\n' +
        '`!persona You are a chill anime-obsessed senpai who gives coding advice.`'
      );
    }
    state.persona = newPersona;
    return message.reply('🧠 Personality updated for this channel!');
  }

  if (cmd === 'status') {
    return message.reply(
      `📊 **Channel Chat Status**\n` +
      `Active: **${state.active ? 'YES' : 'NO'}**\n` +
      `Mood: **${state.mood}**\n` +
      `Persona: ${state.persona}`
    );
  }

  return message.reply(
    'I don’t recognize that command.\nTry: `!start`, `!stop`, `!mood`, `!persona`, `!status`.'
  );
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(COMMAND_PREFIX)) {
    return handleCommand(message);
  }

  const channelId = message.channel.id;
  const state = getChannelState(channelId);

  if (!state.active) return;

  const userMessage = message.content.trim();
  if (!userMessage) return;

  const thinking = await message.reply('💭 feeling things & thinking...');

  const reply = await callGeminiAPI({
    userMessage,
    persona: state.persona,
    mood: state.mood
  });

  await thinking.edit(reply);
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log('✅ Using direct Gemini API with feelings + per-channel persona');
  console.log('Commands: !start, !stop, !mood, !persona, !status');
});

client.login(process.env.DISCORD_TOKEN);
