import { askGemini } from "../services/gemini.js";
import { getState } from "../state/channelState.js";
import { config } from "../config.js";

export const chatPlugin = {
  name: "chat",

  onReady(client) {
    console.log(`✅ chatPlugin ready for ${client.user.tag}`);
  },

  async onMessage(client, message) {
    const state = getState(message.channel.id);

    // Commands
    if (message.content.startsWith(config.commandPrefix)) {
      const [cmdRaw, ...args] = message.content
        .slice(config.commandPrefix.length)
        .trim()
        .split(/\s+/);

      const cmd = cmdRaw.toLowerCase();
      const text = args.join(" ").trim();

      if (cmd === "start") {
        state.active = true;
        return message.reply("✅ Chat mode ON in this channel.");
      }

      if (cmd === "stop") {
        state.active = false;
        return message.reply("🛑 Chat mode OFF in this channel.");
      }

      if (cmd === "mood") {
        if (!text) {
          return message.reply(`Current mood: **${state.mood}**`);
        }
        state.mood = text;
        return message.reply(`💖 Mood set to **${state.mood}**`);
      }

      if (cmd === "persona") {
        if (!text) {
          return message.reply("Give me a personality description.");
        }
        state.persona = text;
        return message.reply("🧠 Persona updated for this channel!");
      }

      if (cmd === "status") {
        return message.reply(
          `Active: ${state.active}\nMood: ${state.mood}\nPersona: ${state.persona}`
        );
      }

      return;
    }
    if (!state.active) return;

    const prompt = `
Persona: ${state.persona}
Mood: ${state.mood}
User: ${message.content}
`.trim();

    const thinking = await message.reply("💭 feeling things & thinking...");

    try {
      const reply = await askGemini(prompt);
      await thinking.edit(reply);
    } catch (e) {
      console.error(e);
      await thinking.edit("❌ Gemini API error.");
    }
  }
};
