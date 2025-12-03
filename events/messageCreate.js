const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (client, message) => {
    if (message.author.bot) return;

    if (message.guild) {
        let guildDB = await client.database.guild.get(message.guild.id);
        if (!guildDB) {
            await client.database.guild.set(message.guild.id, {
                prefix: client.config.Prefix,
                DJ: null
            });
        }
    }

    if (message.content.startsWith(client.config.Prefix)) {
        const args = message.content.slice(client.config.Prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (command) {
            if (commandName !== 'chat' && client.aiChannels.has(message.channel.id)) {
                client.aiChannels.delete(message.channel.id);
                message.reply('🤖 **AI Chat Mode Paused** because you used a command.');
            }
            try {
                await command.execute(message, args, client);
            } catch (error) {
                client.logger.error(`Error in ${commandName}: ${error.message}`);
                message.reply('❌ An error occurred executing that command.');
            }
        }
        return;
    }

    if (client.aiChannels.has(message.channel.id)) {
        try {
            message.channel.sendTyping();
            const genAI = new GoogleGenerativeAI(client.config.AI.GeminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(message.content);
            const response = await result.response;
            const text = response.text();

            if (text.length > 2000) {
                message.reply(text.substring(0, 2000));
                message.channel.send(text.substring(2000, 4000));
            } else {
                message.reply(text);
            }
        } catch (error) {
            client.logger.error(`AI Error: ${error.message}`);
            message.channel.send('❌ AI had a hiccup. Try again.');
        }
    }
};