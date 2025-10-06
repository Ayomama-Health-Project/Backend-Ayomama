import Antenatal from "../models/antenatal.js";
import User from "../models/user.js";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { getLang } from "./chatController.js";

export const createAntenatalUpdate = async (req, res) => {
  try {
    const { bloodPressure, temperature, weight, bloodLevel, date } = req.body;
    const userId = req.user._id;

    if (!bloodPressure || !temperature || !weight || !bloodLevel) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save the vitals
    const update = await Antenatal.create({
      userId,
      bloodPressure,
      temperature,
      weight,
      bloodLevel,
      date: date || new Date(),
    });

    // Get user info
    const user = await User.findById(userId).lean();
    const userName = user?.name || "Mummy";
    const lang = user?.preferredLanguages || "en";

    const userLang = getLang(lang);

    console.log(userName + " is speaking", userLang);

    // Ask AI to analyze the vitals
    const prompt = `
    You are Favour, the friendly Ayomama assistant 🤰🏽💛.
    Analyze the following antenatal vitals and provide a short, supportive feedback message.
    Be gentle, simple, and clear — no medical jargon.

    - Blood Pressure: ${bloodPressure}
    - Temperature: ${temperature}°C
    - Weight: ${weight} kg
    - Blood Level: ${bloodLevel} g/dL

    Format:
    - Relate to the user with their preferred language: ${userLang}
    - Refer to them with their name: ${userName}
    - One short paragraph
    - Friendly tone
    - Add 1–2 emojis
    - If any value seems abnormal, gently suggest seeing a doctor.
    - Otherwise, reassure that everything looks good.
    `;

    const model = groq("openai/gpt-oss-120b");
    const aiResponse = await generateText({
      model,
      prompt,
      temperature: 0.3,
      maxTokens: 200,
    });

    const feedback = aiResponse.text;

    // Save the AI feedback into the record
    update.aiFeedback = feedback;
    await update.save();

    // Store the AI message in user messages (optional)
    // await Message.create({
    //   user: userId,
    //   role: "assistant",
    //   content: feedback,
    // });

    // Return to frontend
    res.status(201).json({
      message: "Antenatal update saved successfully",
      data: update,
    });
  } catch (error) {
    console.error("Antenatal update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
