import "dotenv/config";

export const config = {
  botName: process.env.BOT_NAME || "Fluffy",
  discordToken: process.env.DISCORD_TOKEN,
  geminiApiKey: process.env.GEMINI_API_KEY,
  defaultMood: "playful",
  commandPrefix: "!",
};
