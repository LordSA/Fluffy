import axios from "axios";
import { config } from "../config.js";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function askGemini(prompt) {
  const response = await axios.post(
    `${GEMINI_URL}?key=${config.geminiApiKey}`,
    {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 20000
    }
  );

  const text =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  return (
    text || "⚠️ Gemini responded but did not return any text content."
  );
}
