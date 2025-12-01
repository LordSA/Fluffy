const config = require('../config');
const { askGemini } = require('../services/gemini');
const { getChannelState } = require('../state/channelState');

module.exports = {
    name: "chat",
    onReady: (client) => {
        console.log(`[Chat Plugin] Ready and listening as ${client.user.tag}`);
    },

    onMessage: async (client, message) => {
        if (message.author.bot) return;

        const content = message.content.trim();
        const channelId = message.channel.id;
        const state = getChannelState(channelId);

        const PREFIX = config.PREFIX;
        if (!content.startsWith(PREFIX)) {
            if (!state.active) return;
            if (!content) return;
            await message.channel.sendTyping();

            try {
                const prompt = `
Persona: ${state.persona}
Current Mood: ${state.mood}
User Message: ${content}
`.trim();

                const reply = await askGemini(prompt);
                await message.reply(reply);
            } catch (err) {
                console.error("Gemini Error:", err);
                await message.reply("⚠️ *I'm having trouble thinking right now...*");
            }
            return;
        }
        const args = content.slice(PREFIX.length).trim().split(/\s+/);
        const cmd = args.shift().toLowerCase();
        const argsText = args.join(" ").trim();

        if (['play', 'stop', 'skip', 'queue', 'music'].includes(cmd)) return;

        switch (cmd) {
            case "chat":
            case "c":
                if (args[0] === "start") {
                    state.active = true;
                    return message.reply("✨ **Chat Mode ON.** I am listening in this channel!");
                }
                if (args[0] === "stop") {
                    state.active = false;
                    return message.reply("🛑 **Chat Mode OFF.** I'll stop listening.");
                }
                break;

            case "mood":
                if (!argsText) return message.reply(`Current mood: **${state.mood}**`);
                state.mood = argsText;
                return message.reply(`💖 Mood set to: **${state.mood}**`);

            case "persona":
                if (!argsText) return message.reply(`Current persona: \`${state.persona}\``);
                state.persona = argsText;
                return message.reply("🧠 **Persona updated!**");

            case "status":
                return message.reply(`📊 **Status:**\nActive: ${state.active}\nMood: ${state.mood}`);
        }
    }
};