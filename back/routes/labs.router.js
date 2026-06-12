const express = require("express");
const router = express.Router();
const ChatSession = require("../models/ChatSession");
const { authMiddleware } = require("../middleware/auth");
const { callLLM } = require("../utils/llmClients");

// GET all sessions for current user
router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user.id })
      .select("title mode updatedAt createdAt")
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE session
router.delete("/sessions/:id", authMiddleware, async (req, res) => {
  try {
    await ChatSession.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true, message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SEND message in session
router.post("/sessions/:id/message", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    session.messages.push({ role: "user", text });

    const systemContext = session.mode === 'tutor'
      ? "You are a patient AI tutor. Explain concepts step by step with examples."
      : "You are a friendly study buddy. Be conversational and encouraging.";

    const conversationText = session.messages.map(m => `${m.role}: ${m.text}`).join("\n");
    const prompt = `${systemContext}\n\nConversation so far:\n${conversationText}\n\nRespond as the assistant. Return ONLY plain text, no JSON, no markdown formatting.`;

    const reply = await callLLM(prompt, "ollama");
    session.messages.push({ role: "ai", text: reply });

    if (session.messages.length === 2) {
      try {
        const titlePrompt = `Based on this conversation, generate a short 3-6 word title summarizing the topic. Return ONLY the title text, no quotes, no punctuation at the end, nothing else.\n\nUser: ${text}\nAssistant: ${reply}`;
        const title = await callLLM(titlePrompt, "ollama");
        session.title = title.trim().replace(/^["']|["']$/g, '').slice(0, 50);
      } catch {
        session.title = text.slice(0, 40);
      }
    }

    await session.save();

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;