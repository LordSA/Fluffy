const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
    name: 'ask',
    description: 'Chat with Gemini AI',
    async execute(message, args, client) {
        if (!args.length) return message.reply('❌ Ask me something! Example: `.ask Write a poem`');

        const query = args.join(' ');
        const genAI = new GoogleGenerativeAI(client.config.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        try {
            message.channel.sendTyping();
            const result = await model.generateContent(query);
            const response = await result.response;
            const text = response.text();
            if (text.length > 2000) {
                message.reply(text.substring(0, 2000));
                message.channel.send(text.substring(2000));
            } else {
                message.reply(text);
            }
            
            client.logger.info(`AI Req: ${message.author.tag} asked "${query}"`);

        } catch (error) {
            client.logger.error(`AI Error: ${error.message}`);
            message.reply('❌ AI is currently overloaded. Try again later.');
        }
    }
};