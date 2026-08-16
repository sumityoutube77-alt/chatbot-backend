const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Chat Schema
const chatSchema = new mongoose.Schema({
  userMessage: String,
  botResponse: String,
  timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// New Gemini SDK Initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// History Route
app.get('/api/history', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ error: 'History fetch nahi ho saki.' });
  }
});

// Chat Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Naye SDK ka call method
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });

    const botResponse = response.text;

    const newChat = new Chat({ userMessage: message, botResponse: botResponse });
    await newChat.save();

    res.json({ reply: botResponse });
  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    res.status(500).json({ error: 'Gemini API call failed.' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
