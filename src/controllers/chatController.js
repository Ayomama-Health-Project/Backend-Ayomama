import Chat from "../models/chat.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const chatWithBot = async (req, res) => {
  const { message, language } = req.body;
  const userId = req.user._id;

  try {
    // Find chat history
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    // Add user message
    chat.messages.push({ role: "user", content: message });
    await chat.save();

    // Prepare context (last 5 messages)
    const contextMessages = chat.messages.slice(-5);

    // System instruction
    const systemMessage = {
      role: "system",
      content: `You are a warm maternal health assistant. Reply in ${language}. Be supportive and culturally sensitive.`
    };

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile", // or smaller if you want speed
      messages: [systemMessage, ...contextMessages]
    });

    const reply = completion.choices[0].message.content;

    // Save bot response
    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();

    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ error: "Failed to process message" });
  }
};
