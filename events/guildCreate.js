module.exports = async (client, guild) => {
    const channel = await client.channels.fetch(client.config.LOG_CHANNEL).catch(() => null);
    if (channel) {
        channel.send(`New Server: ${guild.name} | Members: ${guild.memberCount}`);
    }
};