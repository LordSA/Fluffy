import axios from "axios";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function askGemini(prompt) {
  const res = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    },
    { timeout: 15000 }
  );

  return res.data.candidates[0].content.parts[0].text;
}
