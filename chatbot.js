import { askGemini } from "../services/gemini.js";
import { getState } from "../state/channelState.js";

export async function handleMessage(message) {
  const state = getState(message.channel.id);

  // ----- COMMAND HANDLING -----
  if (message.content.startsWith("!")) {
    const [cmd, ...args] = message.content.slice(1).split(" ");
    const text = args.join(" ").trim();

    if (cmd === "start") {
      state.active = true;
      return message.reply("✅ Chat mode ON");
    }

    if (cmd === "stop") {
      state.active = false;
      return message.reply("🛑 Chat mode OFF");
    }

    if (cmd === "mood") {
      if (!text) return message.reply(`Current mood: **${state.mood}**`);
      state.mood = text;
      return message.reply(`💖 Mood set to **${state.mood}**`);
    }

    if (cmd === "persona") {
      if (!text) return message.reply("Give me a personality description.");
      state.persona = text;
      return message.reply("🧠 Persona updated!");
    }

    if (cmd === "status") {
      return message.reply(
        `Active: ${state.active}\nMood: ${state.mood}\nPersona: ${state.persona}`
      );
    }

    return message.reply("Unknown command.");
  }

  // ----- CHAT HANDLING -----
  if (!state.active) return;

  const prompt = `
Persona: ${state.persona}
Mood: ${state.mood}
User: ${message.content}
`;

  const typing = await message.reply("💭 thinking...");
  try {
    const reply = await askGemini(prompt);
    await typing.edit(reply);
  } catch {
    await typing.edit("❌ Gemini API is slow or down.");
  }
}
