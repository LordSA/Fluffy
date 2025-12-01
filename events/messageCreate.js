module.exports = async (client, message) => {
    if (message.author.bot || !message.content.startsWith(client.config.PREFIX)) return;

    const args = message.content.slice(client.config.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply('Command failed!');
    }
};