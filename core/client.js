import { Client, GatewayIntentBits, Partials } from "discord.js";
import { logger } from "./logger.js";

export function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
  });

  client.once("ready", () => {
    logger.info(`Logged in as ${client.user.tag}`);
  });

  return client;
}
