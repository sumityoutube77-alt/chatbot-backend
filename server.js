const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// CORS setup taki GitHub Pages access kar sake
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// MongoDB Schema
const chatSchema = new mongoose.Schema({
  userMessage: String,
  botResponse: String,
  timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// Gemini API Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. NAYA ROUTE: Purani chat history fetch karne ke liye
app.get('/api/history', async (req, res) => {
  try {
    // Database se sabhi chats nikalna aur purane se naye ke kram (timestamp) mein sort karna
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ error: 'History fetch karne mein problem aayi.' });
  }
});

// 2. PURANA ROUTE: Naye message bhejne aur save karne ke liye
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Gemini model call
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const botResponse = result.response.text();

    // MongoDB mein save karna
    const newChat = new Chat({ userMessage: message, botResponse: botResponse });
    await newChat.save();

    // Frontend ko reply bhejna
    res.json({ reply: botResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Backend mein kuch gadbad hai.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
