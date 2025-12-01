import { config } from "../config.js";
import { askGemini } from "../services/gemini.js";
import { getChannelState } from "../state/channelState.js";

const PREFIX = config.commandPrefix;

async function callGeminiForChannel(state, userMessage) {
  const prompt = `
Persona:
${state.persona}

Current emotional mood: ${state.mood}.
Reflect this mood in your tone (but stay respectful and helpful).

User message:
${userMessage}
`.trim();

  return askGemini(prompt);
}

export const chatPlugin = {
  name: "chat",

  onReady(client) {
    console.log(`Chat plugin ready for ${client.user.tag}`);
  },

  async onMessage(client, message) {
    const content = message.content.trim();
    const channelId = message.channel.id;
    const state = getChannelState(channelId);

    if (!content.startsWith(PREFIX)) {
      if (!state.active) return;
      if (!content) return;

      const thinking = await message.reply("💭 feeling things & thinking...");
      const reply = await callGeminiForChannel(state, content);
      await thinking.edit(reply);
      return;
    }

    const [cmdRaw, ...rest] = content
      .slice(PREFIX.length)
      .trim()
      .split(/\s+/);

    const cmd = cmdRaw.toLowerCase();
    const argsText = rest.join(" ").trim();

    if (cmd === "music" || cmd === "m") {
      return;
    }

    if (cmd === "start") {
      state.active = true;
      await message.reply(
        "✨ Chat mode ON in this channel. I will reply to messages here until you type `!stop`."
      );
      return;
    }

    if (cmd === "stop") {
      state.active = false;
      await message.reply("🛑 Chat mode OFF in this channel.");
      return;
    }

    if (cmd === "mood") {
      if (!argsText) {
        await message.reply(
          `Current mood: ${state.mood}. Set a new mood like: \`!mood cozy\` or \`!mood chaotic gremlin\`.`
        );
        return;
      }
      state.mood = argsText;
      await message.reply(`💖 Mood updated, I now feel ${state.mood}.`);
      return;
    }

    if (cmd === "persona") {
      if (!argsText) {
        await message.reply(
          "Give me a new personality description. Example: `!persona You are a chill anime-obsessed senpai who gives coding advice.`"
        );
        return;
      }
      state.persona = argsText;
      await message.reply("🧠 Personality updated for this channel.");
      return;
    }

    if (cmd === "status") {
      await message.reply(
        `📊 Channel Chat Status\nActive: ${state.active ? "YES" : "NO"}\nMood: ${state.mood}\nPersona: ${state.persona}`
      );
      return;
    }
  }
};
