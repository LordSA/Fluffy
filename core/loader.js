import { logger } from "./logger.js";

export function loadPlugins(client, plugins = []) {
  const activePlugins = plugins.filter(Boolean);

  if (!activePlugins.length) {
    logger.warn("No plugins registered.");
    return;
  }

  logger.info(
    "Registering plugins:",
    activePlugins.map((p) => p.name).join(", ")
  );

  client.on("ready", () => {
    for (const plugin of activePlugins) {
      if (typeof plugin.onReady === "function") {
        try {
          plugin.onReady(client);
          logger.info(`Plugin [${plugin.name}] onReady executed.`);
        } catch (err) {
          logger.error(`Plugin [${plugin.name}] onReady error:`, err);
        }
      }
    }
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    for (const plugin of activePlugins) {
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
