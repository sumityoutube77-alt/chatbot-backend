const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// Gemini API Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    
    // Updated Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(message);
    const botResponse = result.response.text();

    const newChat = new Chat({ userMessage: message, botResponse: botResponse });
    await newChat.save();

    res.json({ reply: botResponse });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: 'Backend processing mein error aaya.' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
