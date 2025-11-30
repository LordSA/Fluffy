import { Client, GatewayIntentBits } from "discord.js";
import { handleMessage } from "./plugins/chatbot.js";
import { config } from "./config.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  await handleMessage(msg);
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log("✅ Fluffy Discord MD ready in production style.");
});

client.login(config.discordToken);
