const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
    name: 'chat',
    description: 'Talk to Fluffy AI',
    async execute(client, message, args) {
        if (!client.config.GEMINI_KEY) return message.reply("No AI Key configured.");
        
        const genAI = new GoogleGenerativeAI(client.config.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = args.join(" ");
        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            message.reply(response.substring(0, 2000));
        } catch (e) {
            console.error(e);
            message.reply("My brain is having trouble connecting to Google right now.");
        }
    }
};