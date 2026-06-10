const express = require("express");
const multer = require("multer")
const pdfService = require("../services/pdfService")
const aiService = require("../services/aiService")
const router = express.Router();

// configure multer
const upload = multer({ dest: "uploads/" });

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

router.post("/upload", upload.single("pdf"), async (req, res) => {
    try {
      console.log("The back end got it")
      const text = await pdfService.extractPdfText(req.file.path);
      const result = await aiService.generateCourse(text, "coursework", "gemini");
      res.json({ success: true, data: result });
    } catch (err) {
      console.log("The back end did not get it")
      res.status(500).json({ success: false, error: err.message });
    }
  });

module.exports = router;
