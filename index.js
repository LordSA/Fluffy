import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import axios from 'axios';

// ===== DISCORD CLIENT SETUP =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const PREFIX = '!ai'; // Command: !ai hello

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`✅ Using API: ${process.env.RYZNN_API_URL}`);
});

// ===== RYZNN API CALL FUNCTION =====
async function callRyznnAPI(userMessage, userId) {
  try {
    console.log('🔹 Sending to API:', {
      url: process.env.RYZNN_API_URL,
      message: userMessage,
      userId
    });

    const response = await axios.post(
      process.env.RYZNN_API_URL,   // MUST BE FULL ENDPOINT, NOT JUST DOMAIN
      {
        message: userMessage,
        userId: userId
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    console.log('✅ API Status:', response.status);
    console.log('✅ API Response:', response.data);

    const data = response.data;

    // Adjust this if your API uses a different key
    const reply =
      data.reply ||
      data.response ||
      data.message ||
      data.content ||
      '⚠️ API returned no readable reply';

    return reply;

  } catch (error) {
    console.error('❌ Error calling Ryznn API:');
    console.error('URL:', process.env.RYZNN_API_URL);
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Message:', error.message);

    return '❌ Ryznn API is not reachable right now.';
  }
}

// ===== DISCORD MESSAGE HANDLER =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const userMessage = message.content.slice(PREFIX.length).trim();

  if (!userMessage) {
    return message.reply('Type something after `!ai` 🤍');
  }

  const thinking = await message.reply('🧠 Thinking...');

  const reply = await callRyznnAPI(userMessage, message.author.id);

  await thinking.edit(reply);
});

// ===== LOGIN =====
client.login(process.env.DISCORD_TOKEN);
