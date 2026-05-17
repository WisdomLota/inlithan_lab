const express = require("express");
const router = express.Router();

// GET all activities
router.get("/", (req, res) => {
  res.json([{ id: 1, type: "quiz", title: "Math Basics" }]);
});

// CREATE new activity
router.post("/", (req, res) => {
  const { type, title, content } = req.body;
  // Save to DB here
  res.json({ success: true, message: "Activity created", data: { type, title, content } });
});

module.exports = router;
