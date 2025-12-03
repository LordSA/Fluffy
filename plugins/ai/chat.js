module.exports = {
    name: 'chat',
    description: 'Toggle continuous AI Chat Mode for this channel',
    async execute(message, args, client) {
        const channelId = message.channel.id;

        if (client.aiChannels.has(channelId)) {
            client.aiChannels.delete(channelId);
            message.reply('🛑 **AI Chat Mode Disabled.** I will stop reading messages here.');
            client.logger.info(`AI Mode toggled OFF for ${message.channel.name}`);
        } else {
            client.aiChannels.add(channelId);
            message.reply('🟢 **AI Chat Mode Enabled!** Talk to me normally.\n*(Use any other command like `.play` to stop)*');
            client.logger.info(`AI Mode toggled ON for ${message.channel.name}`);
        }
    }
};