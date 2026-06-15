const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const Course = require("../models/Course");
const aiService = require("../services/aiService");
const { authMiddleware, requireRole } = require("../middleware/auth");

const pdfService = require("../services/pdfService");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
    const activity = await Activity.findById(req.params.id).populate("submissions.student", "name email avatar");
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

    const teacherCourseCount = await Course.countDocuments({ teacher: req.user.id });
    if (teacherCourseCount === 0) {
      return res.status(400).json({ success: false, error: "You must create a course before creating an activity" });
    }

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

    const { answers } = req.body; // array of selected option strings, same order as activity.questions

    let score = 0;
    if (activity.type === "Quiz" && Array.isArray(activity.questions)) {
      activity.questions.forEach((q, i) => {
        if (answers[i] && q.answer && answers[i].trim() === q.answer.trim()) {
          score++;
        }
      });
      const total = activity.questions.length || 1;
      score = Math.round((score / total) * 100); // percentage
    }

    // remove any previous submission by this student
    activity.submissions = activity.submissions.filter(
      s => s.student.toString() !== req.user.id
    );

    activity.submissions.push({ student: req.user.id, answers, score });
    await activity.save();

    res.json({ success: true, data: { score, total: activity.questions?.length || 0 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GENERATE activity via AI (teacher only) - used by AI Labs flow
router.post("/generate", authMiddleware, requireRole("teacher"), upload.single("pdf"), async (req, res) => {
  try {
    const { courseId, activityType, questionCount, timeBased, minutes, questionType } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }

    // Build context text from course content
    let contextText = `Course: ${course.title}\nAbout: ${course.about}\n`;
    course.weeks.forEach(week => {
      contextText += `\nWeek ${week.number}: ${week.title}\n${week.description}\n`;
      contextText += JSON.stringify(week.lessonNotes || []).slice(0, 1500) + "\n";
    });

    // Append PDF text if provided
    if (req.file) {
      const pdfText = await pdfService.extractPdfText(req.file.path);
      contextText += `\n\nAdditional reference material:\n${pdfText}`;
    }

    contextText = contextText.slice(0, 8000);

    const aiType = activityType === "Quiz" ? "quiz" : "explanation";
    let questions = [];

    if (activityType === "Quiz") {
      const generated = await aiService.generateActivity(contextText, "quiz", "ollama", 180000, questionCount);
      questions = (generated.questions || []).slice(0, Number(questionCount) || 5);
    } else {
      // Assignment: generate theory-based questions via quiz-style structure for consistency
      const generated = await aiService.generateActivity(contextText, "quiz", "ollama", 180000, questionCount);
      questions = (generated.questions || []).slice(0, Number(questionCount) || 5);
    }

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const title = `${course.title} - ${activityType}`;

    const activity = await Activity.create({
      courseId,
      title,
      type: activityType,
      questions,
      questionCount: questionCount || questions.length,
      timeBased: timeBased === "true" || timeBased === true,
      minutes: minutes || undefined,
      questionType,
      dueDate,
    });

    res.json({ success: true, data: activity });
  } catch (err) {
    console.error("Activity generation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;