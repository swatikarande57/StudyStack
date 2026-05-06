import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn('WARNING: OPENAI_API_KEY is missing in .env file');
}

const openai = apiKey ? new OpenAI({ apiKey }) : null;

router.post('/mentor', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful and motivating Study Mentor AI. Your goal is to help students manage their tasks, explain concepts, and provide study advice based on productivity best practices." 
        },
        ...messages
      ],
    });

    res.json({ message: response.choices[0].message });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});

export default router;
