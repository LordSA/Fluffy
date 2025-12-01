import "dotenv/config";
import { createClient } from "./core/client.js";
import { loadPlugins } from "./core/loader.js";
import { logger } from "./core/logger.js";
import { chatPlugin } from "./plugins/chatbot.js";
import { musicPlugin } from "./plugins/music.js";
import { config } from "./config.js";

const client = createClient();

loadPlugins(client, [chatPlugin, musicPlugin]);

client.once("ready", () => {
  logger.info(`Logged in as ${client.user.tag}`);
  logger.info("Fluffy Discord MD ready with chat and music.");
});

client.login(config.discordToken);
