const express = require("express");
const router = express.Router();
const ChatSession = require("../models/ChatSession");
const { authMiddleware } = require("../middleware/auth");
const { callLLM } = require("../utils/llmClients");

const multer = require("multer");
const pdfService = require("../services/pdfService");

const upload = multer({ dest: "uploads/" });

// GET all sessions for current user
router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user.id })
      .select("title mode updatedAt createdAt")
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error("Message route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single session with messages
router.get("/sessions/:id", authMiddleware, async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });
    res.json({ success: true, data: session });
  } catch (err) {
    console.error("Message route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE new session
router.post("/sessions", authMiddleware, async (req, res) => {
  try {
    const { mode } = req.body;
    const session = await ChatSession.create({
      userId: req.user.id,
      mode: mode || "buddy",
      title: "New Session",
      messages: [],
    });
    res.json({ success: true, data: session });
  } catch (err) {
    console.error("Message route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE session
router.delete("/sessions/:id", authMiddleware, async (req, res) => {
  try {
    await ChatSession.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true, message: "Session deleted" });
  } catch (err) {
    console.error("Message route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE session title
router.put("/sessions/:id", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    if (title !== undefined) session.title = title.slice(0, 50);
    await session.save();

    res.json({ success: true, data: session });
  } catch (err) {
    console.error("Message route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// SEND message in session (with optional PDF attachment)
router.post("/sessions/:id/message", authMiddleware, upload.single("pdf"), async (req, res) => {
  try {
    const { text } = req.body;
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    let userMessageText = text || "";
    let pdfText = "";
    let attachmentName = null;

    if (req.file) {
      attachmentName = req.file.originalname;
      pdfText = await pdfService.extractPdfText(req.file.path);
      pdfText = pdfText.slice(0, 8000); // keep prompt manageable
    }

    session.messages.push({
      role: "user",
      text: userMessageText || `(Attached: ${attachmentName})`,
      attachment: attachmentName || undefined,
    });

    const systemContext = session.mode === 'tutor'
      ? "You are a patient AI tutor. Explain concepts step by step with examples."
      : "You are a friendly study buddy. Be conversational and encouraging.";

    const conversationText = session.messages.map(m => `${m.role}: ${m.text}`).join("\n");

    let prompt = `${systemContext}\n\nConversation so far:\n${conversationText}`;
    if (pdfText) {
      prompt += `\n\nThe user attached a document with the following content:\n"""${pdfText}"""\n\nUse this document to answer the user's request.`;
    }
    prompt += `\n\nRespond as the assistant. Return ONLY plain text, no JSON, no markdown formatting.`;

    const reply = await callLLM(prompt, "ollama", pdfText ? 180000 : 60000);
    session.messages.push({ role: "ai", text: reply });

    if (session.messages.length === 2) {
      try {
        const titlePrompt = `Based on this conversation, generate a short 3-6 word title summarizing the topic. Return ONLY the title text, no quotes, no punctuation at the end, nothing else.\n\nUser: ${userMessageText}\nAssistant: ${reply}`;
        const title = await callLLM(titlePrompt, "ollama");
        session.title = title.trim().replace(/^["']|["']$/g, '').slice(0, 50);
      } catch {
        session.title = (userMessageText || attachmentName || "New Session").slice(0, 40);
      }
    }

    await session.save();

    res.json({ success: true, data: session });
  } catch (err) {
    console.error("Message route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;