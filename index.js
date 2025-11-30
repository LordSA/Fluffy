import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { handleMessage } from "./plugins/chatCore.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", async msg => {
  if (msg.author.bot) return;
  handleMessage(msg);
});

client.once("ready", () => console.log("✅ Fluffy Online"));
client.login(process.env.DISCORD_TOKEN);
