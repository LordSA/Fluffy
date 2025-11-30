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

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`✅ API base: ${process.env.RYZNN_API_BASE}`);
  console.log(`✅ Model: ${process.env.RYZNN_MODEL}`);
});

function getChatCompletionsUrl() {
  const base = (process.env.RYZNN_API_BASE || 'https://ai.ryznn.xyz').replace(/\/+$/, '');
  return `${base}/v1/chat/completions`;
}

async function callRyznnAPI(userMessage, userId) {
  const url = getChatCompletionsUrl();

  try {
    console.log('🔹 Sending to API:', {
      url,
      model: process.env.RYZNN_MODEL,
      message: userMessage,
      userId
    });

    const headers = {
      'Content-Type': 'application/json'
    };

    if (process.env.RYZNN_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.RYZNN_API_KEY}`;
    }

    const response = await axios.post(
      url,
      {
        model: process.env.RYZNN_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are Fluffy, a friendly Discord chatbot.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        // optional: for OpenAI-compatible APIs
        user: userId
      },
      {
        headers,
        timeout: 20000
      }
    );

    console.log('✅ API Status:', response.status);
    console.log('✅ API Response:', JSON.stringify(response.data, null, 2));

    const choice = response.data?.choices?.[0];
    const reply = choice?.message?.content?.trim();

    if (!reply) {
      return '⚠️ API responded but I couldn’t find any message content.';
    }

    return reply;
  } catch (error) {
    console.error('❌ Error calling Ryznn API:');
    console.error('URL:', url);
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Message:', error.message);

    const status = error.response?.status ?? 'no response';
    const body =
      typeof error.response?.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response?.data || {}, null, 2);

    return `API error (${status}):\n\`\`\`\n${body}\n\`\`\``;
  }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const userMessage = message.content.slice(PREFIX.length).trim();
  if (!userMessage) {
    return message.reply('Type something after `!ai`, bro 😼');
  }

  const thinking = await message.reply('🧠 Talking to the AI…');

  const reply = await callRyznnAPI(userMessage, message.author.id);

  await thinking.edit(reply);
});

client.login(process.env.DISCORD_TOKEN);
