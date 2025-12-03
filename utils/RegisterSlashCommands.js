const { REST, Routes } = require('discord.js');
const config = require('../config');
const logger = require('./logger');

module.exports = async (client, guildId) => {
    const rest = new REST({ version: '10' }).setToken(config.Token);
    const commands = client.commands.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        options: cmd.options || [] 
    }));

    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, guildId),
            { body: commands }
        );
    } catch (error) {
        logger.error(`Failed to register slash commands for Guild ${guildId}: ${error.message}`);
    }
};