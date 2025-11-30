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
  console.log(`✅ Using API: ${process.env.RYZNN_API_URL}`);
});

async function callRyznnAPI(userMessage, userId) {
  try {
    console.log('🔹 Sending to API:', {
      url: process.env.RYZNN_API_URL,
      message: userMessage,
      userId
    });

    const response = await axios.post(
      process.env.RYZNN_API_URL,
      {
        message: userMessage,
        userId: userId
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ API Status:', response.status);
    console.log('✅ API Response:', response.data);

    const data = response.data;
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

    // Different messages based on type of failure
    if (error.response) {
      // API responded with 4xx / 5xx
      return `⚠️ My brain server responded with an error (${error.response.status}). Try again later.`;
    } else if (error.request) {
      // No response at all (API down / DNS / network)
      return '🚫 I can’t reach my brain server right now. API seems offline.';
    } else {
      // Some other error setting up the request
      return '💥 Something went wrong while preparing the API request.';
    }
  }
}
function fallbackReply(userMessage) {
  const lower = userMessage.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Heyyy 👋 API is sleeping rn but I\'m still here.';
  }

  if (lower.includes('who are you')) {
    return 'I\'m Fluffy, a Discord bot that will use the Ryznn API once it\'s online 🧠';
  }

  return 'My main brain (API) is offline right now, so I’m in low-power mode 😴';
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const userMessage = message.content.slice(PREFIX.length).trim();
  if (!userMessage) {
    return message.reply('Type something after `!ai` 😼');
  }

  const thinking = await message.reply('🧠 Thinking...');

  let reply = await callRyznnAPI(userMessage, message.author.id);
if (
  reply.includes('can’t reach my brain server') ||
  reply.includes('responded with an error') ||
  reply.includes('went wrong while preparing the API request')
) {
  reply = fallbackReply(userMessage);
}

await thinking.edit(reply);

});

client.login(process.env.DISCORD_TOKEN);
