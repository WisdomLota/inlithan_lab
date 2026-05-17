const express = require("express");
const router = express.Router();

// Generate activity using AI
router.post("/generate", async (req, res) => {
  const { prompt, type } = req.body;
  // Call LLM API here (Gemini, Claude, etc.)
  res.json({
    success: true,
    message: "AI generated activity",
    data: { type, prompt, content: "Generated quiz or explanation..." }
  });
});

module.exports = router;