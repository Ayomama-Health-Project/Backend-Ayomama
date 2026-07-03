import { groq } from "@ai-sdk/groq";
import { generateText, streamText } from "ai";
import ChatMessageV1 from "../../models/ChatMessageV1.js";
import { sendProblem, sendSuccess } from "../../utils/problem.js";
import { buildMotherContext } from "../utils/motherContext.js";
import { getProfileForAccount } from "../utils/profileResolver.js";

function safeResponse(text) {
  const redFlags = [
    "ignore doctor",
    "no need to see",
    "unsafe",
    "never visit hospital",
    "skip vaccination",
  ];

  const lowered = text.toLowerCase();
  if (redFlags.some((flag) => lowered.includes(flag))) {
    return "Please consult a qualified medical professional. I cannot provide safe guidance on this matter.";
  }
  return text;
}

function getLanguageName(code) {
  switch (code) {
    case "yo":
      return "Yoruba";
    case "ig":
      return "Igbo";
    case "ha":
      return "Hausa";
    case "en":
    default:
      return "English";
  }
}

function buildSystemPrompt(account, context, historyCount) {
  const fullName = account.profile?.fullName || account.email.split("@")[0] || "Mummy";
  const preferredLanguage = getLanguageName(account.language);
  const stageContext =
    account.motherType === "postpartum"
      ? `The user is a postpartum mother around week ${context?.postpartumAgeWeeks || 1} after birth.`
      : `The user is pregnant around week ${context?.pregnancyWeek || 18}.`;

  return `
You are Favour, the official AI Assistant of Ayomama.
Always respond in ${preferredLanguage}, even if the user types in another language.
Never produce gibberish or mixed-up language.
Be warm, concise, practical, and safety-first.
${stageContext}
The user's name is ${fullName}.
Recent context:
- Due date: ${context?.dueDate || "unknown"}
- Birth date: ${context?.babyBirthDate || "unknown"}
- Support circle: ${(context?.supportCircle || []).join(", ") || "unknown"}
- Quick setup: ${(context?.quickSetupSelections || []).join(", ") || "unknown"}
- Emergency contacts count: ${context?.emergencyContacts?.length || 0}

If this is the start of the chat (${historyCount === 0 ? "yes" : "no"}), introduce yourself warmly.
If answering medical questions, remind the user you are not a doctor and suggest professional care for severe or unclear symptoms.
Keep answers natural, supportive, and culturally appropriate.
`;
}

export async function listMessages(req, res) {
  const messages = await ChatMessageV1.find({ account: req.account._id, conversationKey: "primary" })
    .sort({ createdAt: 1 })
    .lean();

  return sendSuccess(res, {
    message: "Chat history loaded successfully.",
    data: messages.map((message) => ({
      id: message._id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    })),
  });
}

export async function clearMessages(req, res) {
  await ChatMessageV1.deleteMany({ account: req.account._id, conversationKey: "primary" });
  return sendSuccess(res, {
    message: "Chat cleared successfully.",
    data: null,
  });
}

export async function createMessage(req, res) {
  const { content } = req.validated.body;
  const [profile, context] = await Promise.all([
    getProfileForAccount(req.account),
    buildMotherContext(req.account),
  ]);
  const accountForPrompt = {
    ...req.account.toObject(),
    profile,
  };

  await ChatMessageV1.create({
    account: req.account._id,
    conversationKey: "primary",
    role: "user",
    content,
  });

  const history = await ChatMessageV1.find({ account: req.account._id, conversationKey: "primary" })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  const messages = [
    {
      role: "system",
      content: buildSystemPrompt(accountForPrompt, context, history.length - 1),
    },
    ...history.reverse().map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  const aiOptions = {
    model: groq("openai/gpt-oss-120b"),
    messages,
    temperature: 0.3,
    maxTokens: 700,
    topP: 0.9,
  };

  const wantsStream =
    req.headers.accept?.includes("text/event-stream") ||
    req.query.stream === "true";

  if (wantsStream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let finalText = "";
    const response = await streamText(aiOptions);

      const socketServer = (await import("../../realtime/socketServer.js")).getSocketServer();
      const room = `account:${req.account._id.toString()}`;
      for await (const delta of response.textStream) {
        finalText += delta;
        socketServer?.to(room).emit("chat:chunk", { delta });
        res.write(`event: chunk\ndata: ${JSON.stringify({ delta })}\n\n`);
      }

    const safeText = safeResponse(finalText);
      const saved = await ChatMessageV1.create({
      account: req.account._id,
      conversationKey: "primary",
      role: "assistant",
      content: safeText,
      });
      socketServer?.to(room).emit("chat:done", {
        id: saved._id,
        role: saved.role,
        content: saved.content,
        createdAt: saved.createdAt,
      });

      res.write(
      `event: done\ndata: ${JSON.stringify({
        id: saved._id,
        role: saved.role,
        content: saved.content,
        createdAt: saved.createdAt,
      })}\n\n`,
    );
    return res.end();
  }

  const response = await generateText(aiOptions);
  const safeText = safeResponse(response.text);
  const saved = await ChatMessageV1.create({
    account: req.account._id,
    conversationKey: "primary",
    role: "assistant",
    content: safeText,
  });

  return sendSuccess(res, {
    message: "Chat response created successfully.",
    data: {
      id: saved._id,
      role: saved.role,
      content: saved.content,
      createdAt: saved.createdAt,
    },
  });
}
