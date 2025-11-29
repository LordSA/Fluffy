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

// If you want a prefix like !ai, set this:
const PREFIX = '!ai'; // user types: !ai hello

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Function to call your API
async function callRyznnAPI(userMessage, userId) {
  try {
    // This is a generic example; you may need to change
    // body / headers according to your API spec
    const response = await axios.post(
      process.env.RYZNN_API_URL,
      {
        message: userMessage,
        userId: userId
      },
      {
        headers: {
          'Content-Type': 'application/json'
          // Add Authorization or API key here if your API needs it
          // 'Authorization': `Bearer ${process.env.RYZNN_API_KEY}`
        }
      }
    );

    // Adjust this depending on how your API responds.
    // For example: { reply: "Hello" } or { content: "Hello" }
    const data = response.data;
    const replyText =
      data.reply ||
      data.message ||
      data.content ||
      JSON.stringify(data);

    return replyText;
  } catch (error) {
    console.error('❌ Error calling Ryznn API:');
    console.error(error.response?.data || error.message);
    return 'Uh oh, my brain API glitched for a sec 😵‍💫';
  }
}

client.on('messageCreate', async (message) => {
  // ignore other bots
  if (message.author.bot) return;

  // 1️⃣ If you want prefix-based bot: use this
  if (!message.content.startsWith(PREFIX)) return;

  const userMessage = message.content.slice(PREFIX.length).trim();
  if (!userMessage) {
    return message.reply('Say something after the command, like `!ai hello` 🫶');
  }

  // Optionally show a "thinking" message
  const thinkingMessage = await message.reply('Thinking… 🧠');

  const reply = await callRyznnAPI(userMessage, message.author.id);

  // Edit the thinking message with final reply
  await thinkingMessage.edit(reply);
});

// Log in the bot
client.login(process.env.DISCORD_TOKEN);
