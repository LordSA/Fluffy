import { logger } from "./logger.js";
export function registerPlugins(client, plugins = []) {
  const list = plugins.filter(Boolean);

  if (!list.length) {
    logger.warn("No plugins registered.");
    return;
  }

  logger.info(
    "Registering plugins:",
    list.map((p) => p.name).join(", ")
  );

  client.on("ready", () => {
    for (const plugin of list) {
      if (typeof plugin.onReady === "function") {
        try {
          plugin.onReady(client);
        } catch (err) {
          logger.error(`Plugin [${plugin.name}] onReady error:`, err);
        }
      }
    }
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    for (const plugin of list) {
      if (typeof plugin.onMessage === "function") {
        try {
          await plugin.onMessage(client, message);
        } catch (err) {
          logger.error(`Plugin [${plugin.name}] onMessage error:`, err);
        }
      }
    }
  });
}
