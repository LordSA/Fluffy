const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
    name: 'chat',
    description: 'Talk to Fluffy AI',
    async execute(client, message, args) {
        if (!client.config.GEMINI_KEY) return message.reply("No AI Key configured.");
        
        const genAI = new GoogleGenerativeAI(client.config.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = args.join(" ");
        const result = await model.generateContent(prompt);
        
        message.reply(result.response.text().substring(0, 2000));
    }
};