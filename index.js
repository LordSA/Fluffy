import "dotenv/config";
import { createClient } from "./core/client.js";
import { registerPlugins } from "./core/loader.js";
import { chatPlugin } from "./plugins/chatbot.js";
import { config } from "./config.js";

const client = createClient();

registerPlugins(client, [
  chatPlugin
  // future plugins
]);

client.login(config.discordToken);
