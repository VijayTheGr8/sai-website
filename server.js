process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

console.log('Server.js is running and loaded');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5173;

app.use(cors());
app.use(bodyParser.json());

// Use GoogleGenAI client with API key directly in constructor
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // <-- Replace with your real API key

app.post('/api/gemini', async (req, res) => {
  console.log('Received POST /api/gemini');
  const { prompt } = req.body;
  if (!prompt) {
    console.error('Missing prompt in request body');
    return res.status(400).json({ error: 'Missing prompt' });
  }
  try {
    console.log('Received prompt:', prompt);
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    if (response && response.text) {
      res.json({ response: response.text });
    } else {
      res.status(500).json({ error: 'No response from Gemini', raw: response });
    }
  } catch (err) {
    console.error('Gemini API error:', err);
    res.status(500).json({ error: 'Gemini API error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini proxy server running on port ${PORT}`);
}); 