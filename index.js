import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import axios from 'axios';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const PREFIX = '!ai';

const GEMINI_MODEL = 'gemini-2.5-flash';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log('✅ Using Direct Gemini API');
});

async function callGeminiAPI(userMessage) {
  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: userMessage }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return '⚠️ Gemini responded but returned empty text.';
    }

    return reply;

  } catch (error) {
    console.error('❌ Gemini API Error:');
    console.error(error.response?.data || error.message);

    const errMsg =
      error.response?.data?.error?.message ||
      'Unknown Gemini API error';

    return `❌ Gemini API Error:\n\`\`\`${errMsg}\`\`\``;
  }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const userMessage = message.content.slice(PREFIX.length).trim();
  if (!userMessage) {
    return message.reply('Type something after `!ai` 😼');
  }

  const thinking = await message.reply('✨ Asking Gemini...');

  const reply = await callGeminiAPI(userMessage);

  await thinking.edit(reply);
});

client.login(process.env.DISCORD_TOKEN);
