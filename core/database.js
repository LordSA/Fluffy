const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "./data/database.sqlite" });
module.exports = {
    get: async (key) => await db.get(key),
    set: async (key, value) => await db.set(key, value),
    add: async (key, value) => await db.add(key, value),
    delete: async (key) => await db.delete(key),
    isPluginDisabled: async (guildId, pluginName) => {
        return await db.get(`guild_${guildId}.disabled_plugins.${pluginName}`);
    }
};