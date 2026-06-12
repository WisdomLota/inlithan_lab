const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const Course = require("../models/Course");
const aiService = require("../services/aiService");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET all activities for current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    let activities;
    if (req.user.role === "teacher") {
      const courses = await Course.find({ teacher: req.user.id }).select("_id");
      const courseIds = courses.map(c => c._id);
      activities = await Activity.find({ courseId: { $in: courseIds } });
    } else {
      const courses = await Course.find({ students: req.user.id }).select("_id");
      const courseIds = courses.map(c => c._id);
      activities = await Activity.find({ courseId: { $in: courseIds } });
    }
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single activity
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, error: "Activity not found" });
    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE activity (teacher only) - generates questions via AI
router.post("/", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const { courseId, title, type, questionCount, timeBased, minutes, questionType, topicPrompt } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }

    let questions = [];
    if (type === "Quiz" && topicPrompt) {
      console.log("Generating quiz for prompt:", topicPrompt);
      try {
        const generated = await aiService.generateActivity(topicPrompt, "quiz", "ollama");
        console.log("AI generated result:", JSON.stringify(generated));
        questions = generated.questions || [];
      } catch (err) {
        console.error("AI generation failed:", err.message);
      }
    }

    const activity = await Activity.create({
      courseId,
      title,
      type,
      questions,
      questionCount: questionCount || questions.length,
      timeBased: timeBased === "Yes" || timeBased === true,
      minutes,
      questionType,
    });

    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE activity (teacher only)
router.put("/:id", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, error: "Activity not found" });
    Object.assign(activity, req.body);
    await activity.save();
    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE activity (teacher only)
router.delete("/:id", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, error: "Activity not found" });
    await activity.deleteOne();
    res.json({ success: true, message: "Activity deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SUBMIT activity (student)
router.post("/:id/submit", authMiddleware, requireRole("student"), async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, error: "Activity not found" });

    const { answers, score } = req.body;
    activity.submissions.push({ student: req.user.id, answers, score });
    await activity.save();

    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;