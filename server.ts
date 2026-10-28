import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Google Gen AI
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

  // API endpoint for AI Quiz Generation
  app.post('/api/generate-quiz', async (req, res) => {
    try {
      const { documentText, documentTitle, numQuestions = 10 } = req.body;
      
      if (!documentText) {
        return res.status(400).json({ error: 'Document text is required.' });
      }

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Return mock questions if API key is not configured
        const mockQuestions = Array.from({ length: Math.min(numQuestions, 30) }, (_, i) => ({
          id: `q-${i + 1}`,
          question: `[Mock AI] Question ${i + 1} based on "${documentTitle || 'Training Document'}": What is the primary operational guideline highlighted in section ${i + 1}?`,
          options: [
            `Option A: Strict adherence to standard operating procedures and safety protocols.`,
            `Option B: Immediate escalation to department manager without review.`,
            `Option C: Bypassing documentation for faster execution time.`,
            `Option D: Archiving records in local unencrypted storage.`
          ],
          correctIndex: 0,
          explanation: `Correct because standard operating procedures emphasize safety and protocol adherence according to document guidelines.`
        }));
        return res.json({ questions: mockQuestions });
      }

      const prompt = `You are an expert instructional designer and corporate trainer.
Based on the following source document (Title: "${documentTitle || 'Training Document'}"), generate exactly ${numQuestions} professional multiple-choice quiz questions (maximum 30).
Each question must test comprehension of the document and have 4 distinct options (A, B, C, D), exactly one correct index (0 to 3), and a brief explanatory rationale.

Source Document:
"""
${documentText.slice(0, 15000)}
"""

You must respond with valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q-1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct."
    }
  ]
}
Ensure valid JSON only without markdown codeblocks or extra conversational text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No response generated from Gemini API.');
      }

      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      res.status(500).json({ error: error.message || 'Failed to generate quiz with AI.' });
    }
  });

  // AI Tutor Assistant endpoint
  app.post('/api/ai-tutor', async (req, res) => {
    try {
      const { question, documentContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json({ answer: `[Mock AI Tutor] Based on the training manuals, "${question}" relates to standard protocol compliance and safety adherence. Please consult your supervisor for further clarification.` });
      }

      const prompt = `You are a helpful AI Learning Assistant for corporate employees. Answer the following question based on the provided training context. Be concise, encouraging, and accurate.

Context:
"""
${documentContext ? documentContext.slice(0, 10000) : 'General company training materials.'}
"""

Employee Question: "${question}"
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({ answer: response.text || 'I am here to help you master your training materials.' });
    } catch (error: any) {
      console.error('AI Tutor error:', error);
      res.status(500).json({ error: error.message || 'Failed to get tutor response.' });
    }
  });

  // Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
