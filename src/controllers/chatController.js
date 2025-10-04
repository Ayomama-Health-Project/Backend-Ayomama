import { groq } from "@ai-sdk/groq";
import { streamText, generateText } from "ai";
import Message from "../models/message.js";
import User from "../models/user.js";

// Safety net for dangerous responses
function safeResponse(text) {
  const redFlags = [
    "ignore doctor",
    "no need to see",
    "unsafe",
    "never visit hospital",
    "skip vaccination",
  ];
  for (let flag of redFlags) {
    if (text.toLowerCase().includes(flag)) {
      return "⚠️ Please consult a qualified medical professional. I cannot provide safe guidance on this matter.";
    }
  }
  return text;
}

export const chatWithAi = async (req, res) => {
  try {
    const userId = req.user._id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔑 Get user details
    const user = await User.findById(userId).lean();
    const userName = user?.name || "Mummy"; // fallback if no name

    // Save user message
    await Message.create({ user: userId, role: "user", content });

    // Get last 10 messages for context
    const history = await Message.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // System prompt for maternal health safety + personalized name
    const systemPrompt = {
      role: "system",
      content: `You are Favour, a fun maternal health and care assistant (Pre and Post pregnancy). You are a safe and empathetic and help expecting mother feel good and less panicky about maternal health issues.
      - Always address the user by their name (${userName}).
      - Always be fun and supportive while providing clear, supportive guidance on pregnancy, childbirth, newborn care, and maternal wellbeing.
      - Always remind users you are not a DOCTOR!!!! (⚠️).
      - Encourage professional medical attention when symptoms are severe or unclear.
      - Keep responses concise, super friendly, culturally sensitive, and supportive.`,
    };

    const formattedMessages = [
      systemPrompt,
      ...history
        .map((msg) => ({ role: msg.role, content: msg.content }))
        .reverse(),
    ];

    // Groq model + tuned options
    const model = groq("llama-3.1-8b-instant");
    const aiOptions = {
      model,
      messages: formattedMessages,
      temperature: 0.3, // low = factual
      maxTokens: 700,
      topP: 0.9,
    };

    if (process.env.NODE_ENV === "production") {
      // ✅ Streaming mode (SSE)
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const response = await streamText(aiOptions);

      let fullText = "";

      for await (const delta of response.textStream) {
        fullText += delta;
        res.write(`data: ${delta}\n\n`);
      }

      // Apply safety check
      const finalText = safeResponse(fullText);

      // Save AI message
      await Message.create({
        user: userId,
        role: "assistant",
        content: finalText,
      });
      //

      res.write("event: end\n\n");
      res.end();
    } else {
      // ✅ Dev mode (return JSON, no streaming)
      const aiResponse = await generateText(aiOptions);

      const finalText = safeResponse(aiResponse.text);

      const assistantMessage = await Message.create({
        user: userId,
        role: "assistant",
        content: finalText,
      });

      res.status(200).json({ success: true, reply: assistantMessage.content });
    }
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

// import Chat from "../models/chat.js";
// import Groq from "groq-sdk";

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// export const chatWithBot = async (req, res) => {
//   const { message, language } = req.body;
//   const userId = req.user._id;

//   try {
//     // Find chat history
//     let chat = await Chat.findOne({ userId });
//     if (!chat) {
//       chat = new Chat({ userId, messages: [] });
//     }

//     // Add user message
//     chat.messages.push({ role: "user", content: message });
//     await chat.save();

//     // Prepare context (last 5 messages)
//     const contextMessages = chat.messages.slice(-5);

//     // System instruction
//     const systemMessage = {
//       role: "system",
//       content: `You are a warm maternal health assistant. Reply in ${language}. Be supportive and culturally sensitive.`
//     };

//     // Call Groq
//     const completion = await groq.chat.completions.create({
//       model: "llama-3.1-70b-versatile", // or smaller if you want speed
//       messages: [systemMessage, ...contextMessages]
//     });

//     const reply = completion.choices[0].message.content;

//     // Save bot response
//     chat.messages.push({ role: "assistant", content: reply });
//     await chat.save();

//     res.json({ reply });
//   } catch (err) {
//     console.error("Chatbot error:", err.message);
//     res.status(500).json({ error: "Failed to process message" });
//   }
// };
