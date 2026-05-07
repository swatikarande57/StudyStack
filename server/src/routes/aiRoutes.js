import express from 'express';
import { getStudentProgress, getTeacherInsights } from '../services/progressService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

router.post('/mentor', async (req, res) => {
  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    if (!apiKey) {
      console.warn('[Gemini] GEMINI_API_KEY is missing from process.env during request');
      return res.json({
        message: {
          role: 'assistant',
          content: 'AI key is not configured yet. Add GEMINI_API_KEY in server/.env to enable full mentor responses.',
        },
      });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: "You are a supportive and intelligent AI Study Mentor. Your goal is to help students stay productive, provide study tips, and encourage them. Keep your advice concise, actionable, and encouraging."
    });

    // Transform messages to Gemini format and ensure strictly alternating roles [user, model, user, model...]
    let history = [];
    let lastRole = null;

    // Filter and transform messages
    for (const m of messages.slice(0, -1)) {
        const currentRole = m.role === 'assistant' ? 'model' : 'user';
        
        // Gemini strictly requires the first message to be 'user'
        if (history.length === 0 && currentRole === 'model') continue;
        
        // Gemini strictly forbids consecutive messages with the same role
        if (currentRole === lastRole) {
            // Append content to existing message parts instead of creating a new one
            history[history.length - 1].parts[0].text += `\n${m.content}`;
            continue;
        }

        history.push({
            role: currentRole,
            parts: [{ text: m.content }]
        });
        lastRole = currentRole;
    }

    const latestMessage = messages[messages.length - 1].content;
    console.log(`[Gemini] Starting chat with history length: ${history.length}`);

    const chat = model.startChat({ history });
    const response = await chat.sendMessage(latestMessage);

    res.json({ message: { role: 'assistant', content: response.response.text() } });
  } catch (error) {
    console.error('--- GEMINI CRITICAL ERROR ---');
    console.error('Message:', error.message);
    if (error.message.includes('429')) {
      console.error('ACTION REQUIRED: Your Gemini API Key is hitting rate limits or your quota is exhausted.');
    } else if (error.message.includes('404')) {
      console.error('ACTION REQUIRED: The model path was not found. Using fallback logic next.');
    }
    console.error('-----------------------------');
    res.status(500).json({ error: error.message });
  }
});

router.post('/weakness-detection', async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;
    const [studentProgress, teacherInsights] = await Promise.all([
      getStudentProgress(studentId),
      getTeacherInsights(teacherId),
    ]);

    const weakSubjects = studentProgress.weakSubjects.length > 0
      ? studentProgress.weakSubjects
      : [teacherInsights.mostIgnoredSubject];

    const suggestions = weakSubjects.map((subject) => (
      `You struggle with ${subject} consistency. Try 30 minutes of daily focused revision.`
    ));

    res.json({
      weakSubjects,
      suggestions,
      atRiskStudents: teacherInsights.atRiskStudents,
      teacherInsights: {
        topPerformer: teacherInsights.topPerformer,
        mostIgnoredSubject: teacherInsights.mostIgnoredSubject,
        needsAttention: teacherInsights.needsAttention,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
