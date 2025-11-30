import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Simple test API: POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    console.log('📩 Incoming from Discord bot:', { message, userId });

    // TODO: here you would call your real AI (OpenAI, your own model, etc.)
    // For now we'll just send a dummy reply:
    const replyText = `You said: "${message}" (user: ${userId})`;

    return res.json({ reply: replyText });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API server running at http://localhost:${PORT}`);
});
