const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");

// Generate activity (quiz, explanation, etc.)
router.post("/generate", async (req, res) => {
  try {
    const { prompt, type, model } = req.body;
    const result = await aiService.generateActivity(prompt, type, model);
    res.json({ success: true, data: result });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;