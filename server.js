import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';

// Set up the Express application
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// --- ⚠️ Warning: Do NOT hardcode API keys in production ---
const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Function to call OpenAI with a given prompt
async function queryOpenAI(prompt) {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    return 'Error: Failed to fetch response from OpenAI';
  }
}

// Endpoint to handle prompt requests
app.post('/ask', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  const simplifiedPrompt = `${prompt} make it more simpler and in a brief way`;

  const checkPrompt = (
    `Is the following user prompt related to an automation agent, API & HTTP Errors agent, `
    + `basic coding logics (no coding examples), Logic & Flow Design Issues, router logic and flow design issues, `
    + `Trigger & Webhook Errors, Data Handling Issues, App Integration Errors, Testing & Debugging Questions, `
    + `Scheduling & Execution Issues, Storage/File/Media Issues, Communication Module Failures? `
    + `Reply only with yes or no:\n\n${simplifiedPrompt}`
  );

  try {
    const classification = await queryOpenAI(checkPrompt);

    if (classification.toLowerCase().includes('yes')) {
      const finalResponse = await queryOpenAI(simplifiedPrompt);
      return res.json({ result: finalResponse });
    } else {
      return res.json({ result: '404 - Not related' });
    }
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.send('Zenxai AI Chat Assistant Backend is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
