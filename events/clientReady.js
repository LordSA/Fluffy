const { ActivityType } = require('discord.js');
const registerSlashCommands = require('../utils/RegisterSlashCommands');

module.exports = async (client) => {
    client.logger.info(`Logged in as ${client.user.tag}`);
    client.logger.info(`Active Music Engine: ${client.config.Music.Engine.toUpperCase()}`);

    if (client.config.Presence) {
        client.user.setPresence({
            activities: [{ 
                name: client.config.Presence.name, 
                type: ActivityType[client.config.Presence.type] 
            }],
            status: client.config.Presence.status
        });
    }

    client.guilds.cache.forEach(guild => {
        registerSlashCommands(client, guild.id);
    });
};