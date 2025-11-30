import axios from "axios";
import { config } from "../config.js";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function askGemini(prompt) {
  const res = await axios.post(
    `${GEMINI_URL}?key=${config.geminiApiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15000
    }
  );

  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    "⚠️ Empty response from Gemini.";
}
