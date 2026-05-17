const express = require("express");
const router = express.Router();

// GET all courses
router.get("/", (req, res) => {
  res.json([{ id: 1, name: "Intro to Physics", teacher: "Jane Doe" }]);
});

// CREATE new course
router.post("/", (req, res) => {
  const { name, description, teacher } = req.body;
  // Save to DB here
  res.json({ success: true, message: "Course created", data: { name, description, teacher } });
});

module.exports = router;
