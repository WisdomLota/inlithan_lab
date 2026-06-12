const express = require("express");
const multer = require("multer");
const pdfService = require("../services/pdfService");
const aiService = require("../services/aiService");
const Course = require("../models/Course");
const { authMiddleware, requireRole } = require("../middleware/auth");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

// GET all courses for current user (student: enrolled, teacher: owned)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let courses;
    if (req.user.role === "teacher") {
      courses = await Course.find({ teacher: req.user.id });
    } else {
      courses = await Course.find({ students: req.user.id });
    }
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET explore courses (all courses not yet joined)
router.get("/explore", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ students: { $ne: req.user.id } });
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single course
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE new course (teacher only)
router.post("/", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const { title, about, aboutPoints, aboutClosing, code, icon } = req.body;
    const course = await Course.create({
      title,
      about,
      aboutPoints,
      aboutClosing,
      code,
      icon,
      teacher: req.user.id,
      weeks: [],
    });
    res.json({ success: true, message: "Course created", data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE course (teacher only, must own it)
router.put("/:id", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }
    Object.assign(course, req.body);
    await course.save();
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE course (teacher only, must own it)
router.delete("/:id", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }
    await course.deleteOne();
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// JOIN a course (student)
router.post("/:id/join", authMiddleware, requireRole("student"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (!course.students.includes(req.user.id)) {
      course.students.push(req.user.id);
      await course.save();
    }
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPLOAD PDF -> generate week content via AI (teacher only)
router.post("/:id/upload", authMiddleware, requireRole("teacher"), upload.single("pdf"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }

    const text = await pdfService.extractPdfText(req.file.path);
    const result = await aiService.generateCourseContent(text);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;