import fs from "fs";
import path from "path";
import { logger } from "./logger.js";

export async function loadPlugins(client) {
  const pluginsPath = path.join(process.cwd(), "plugins");
  const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const pluginPath = path.join(pluginsPath, file);

    try {
      const plugin = await import(`../plugins/${file}`);

      if (typeof plugin.default === "function") {
        plugin.default(client);
        logger.info(`Loaded plugin: ${file}`);
      } else {
        logger.warn(`Plugin ${file} has no default export`);
      }

    } catch (err) {
      logger.error(`Failed to load plugin ${file}`);
      logger.error(err.stack || err.message);
    }
  }
}
