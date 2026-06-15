const express = require("express");
const router = express.Router();
const ResearchPaper = require("../models/ResearchPaper");
const { authMiddleware } = require("../middleware/auth");
const { generateWeeklyResearchPaper } = require("../services/researchService");

// GET current week's research paper
router.get("/current", authMiddleware, async (req, res) => {
  try {
    let paper = await ResearchPaper.findOne().sort({ weekOf: -1 });

    if (!paper) {
      paper = await generateWeeklyResearchPaper();
    }

    res.json({ success: true, data: paper });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;