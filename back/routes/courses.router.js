const express = require("express");
const multer = require("multer");
const pdfService = require("../services/pdfService");
const aiService = require("../services/aiService");
const Course = require("../models/Course");
const { authMiddleware, requireRole } = require("../middleware/auth");
const router = express.Router();
const cloudinary = require("../config/cloudinary");

const upload = multer({ dest: "uploads/" });

const { getDetailedGithubStats } = require("../services/githubService");
const Score = require("../models/Score");
const Activity = require("../models/Activity");

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

// Search students by name/email (teacher only)
router.get("/students/search", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const User = require("../models/User");
    const q = req.query.q || "";
    const students = await User.find({
      role: "student",
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("name email avatar githubUsername").limit(10);
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET pending join requests across teacher's courses
router.get("/requests/pending", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id })
      .populate("pendingStudents", "name email avatar");

    const requests = [];
    courses.forEach(course => {
      course.pendingStudents.forEach(student => {
        requests.push({
          id: `${course._id}_${student._id}`,
          courseId: course._id,
          courseTitle: course.title,
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
          studentAvatar: student.avatar,
        });
      });
    });

    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add a student directly to a course (teacher only)
router.post("/:id/students/:studentId", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }
    if (!course.students.includes(req.params.studentId)) {
      course.students.push(req.params.studentId);
      // also remove from pending if present
      course.pendingStudents = course.pendingStudents.filter(
        id => id.toString() !== req.params.studentId
      );
      await course.save();
    }
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPLOAD course icon to Cloudinary (teacher only)
router.post("/:id/icon", authMiddleware, requireRole("teacher"), upload.single("icon"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "inlithan/course-icons",
    });

    course.icon = result.secure_url;
    await course.save();

    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all students across teacher's courses
router.get("/students/all", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id }).populate("students", "name email avatar githubUsername");

    const studentsMap = new Map();
    courses.forEach(course => {
      course.students.forEach(student => {
        if (!studentsMap.has(student._id.toString())) {
          studentsMap.set(student._id.toString(), {
            id: student._id,
            name: student.name,
            email: student.email,
            avatar: student.avatar,
            githubUsername: student.githubUsername,
            courses: [],
          });
        }
        studentsMap.get(student._id.toString()).courses.push(course.title);
      });
    });

    res.json({ success: true, data: Array.from(studentsMap.values()) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET detailed student list with rank, activities, GitHub stats (teacher only)
router.get("/students/all/detailed", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id }).populate("students", "name email avatar githubUsername githubAccessToken");

    const studentsMap = new Map();
    courses.forEach(course => {
      course.students.forEach(student => {
        if (!studentsMap.has(student._id.toString())) {
          studentsMap.set(student._id.toString(), {
            id: student._id,
            name: student.name,
            email: student.email,
            avatar: student.avatar,
            githubUsername: student.githubUsername,
            githubAccessToken: student.githubAccessToken,
            courseDetails: [],
          });
        }
        studentsMap.get(student._id.toString()).courseDetails.push(course.title);
      });
    });

    const studentIds = Array.from(studentsMap.keys());

    // Get all scores for ranking
    const scores = await Score.find({ userId: { $in: studentIds } });
    const scoreMap = new Map(scores.map(s => [s.userId.toString(), s]));

    // Rank students by totalScore (descending)
    const ranked = studentIds
      .map(id => ({ id, totalScore: scoreMap.get(id)?.totalScore || 0 }))
      .sort((a, b) => b.totalScore - a.totalScore);
    const rankMap = new Map(ranked.map((r, i) => [r.id, i + 1]));

    // Get activity submission breakdown per student
    const allActivities = await Activity.find({ "submissions.student": { $in: studentIds } });

    const result = [];
    for (const id of studentIds) {
      const student = studentsMap.get(id);
      const score = scoreMap.get(id);

      let quiz = 0, assignments = 0, activitiesCount = 0;
      allActivities.forEach(activity => {
        activity.submissions.forEach(sub => {
          if (sub.student.toString() === id) {
            activitiesCount++;
            if (activity.type === "Quiz") quiz++;
            if (activity.type === "Assignment") assignments++;
          }
        });
      });

      let rankDetails = {
        commitsWeek: 0, commitsMonth: 0, commitsYear: 0, commitsAllTime: 0, topLanguages: "N/A"
      };

      if (student.githubAccessToken && student.githubUsername) {
        try {
          const detailed = await getDetailedGithubStats(student.githubAccessToken, student.githubUsername);
          rankDetails = {
            commitsWeek: detailed.commitsWeek,
            commitsMonth: detailed.commitsMonth,
            commitsYear: detailed.commitsYear,
            commitsAllTime: detailed.commitsAllTime,
            topLanguages: detailed.topLanguages,
          };
        } catch (err) {
          console.warn(`GitHub stats failed for ${student.githubUsername}:`, err.message);
        }
      }

      result.push({
        id,
        name: student.name,
        avatar: student.avatar,
        githubUsername: student.githubUsername,
        rank: rankMap.get(id),
        courses: student.courseDetails.length,
        activities: activitiesCount,
        activityDetails: {
          quiz,
          assignments,
          activities: activitiesCount,
          researchPapers: 0, // no research paper tracking exists yet
        },
        courseDetails: student.courseDetails,
        rankDetails,
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Detailed student list error:", err);
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
// REQUEST to join a course (student) - goes to pending
router.post("/:id/join", authMiddleware, requireRole("student"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (!course.students.includes(req.user.id) && !course.pendingStudents.includes(req.user.id)) {
      course.pendingStudents.push(req.user.id);
      await course.save();
    }
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ACCEPT a join request
router.post("/:id/requests/:studentId/accept", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }

    course.pendingStudents = course.pendingStudents.filter(id => id.toString() !== req.params.studentId);
    if (!course.students.includes(req.params.studentId)) {
      course.students.push(req.params.studentId);
    }
    await course.save();
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// REJECT a join request
router.post("/:id/requests/:studentId/reject", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }

    course.pendingStudents = course.pendingStudents.filter(id => id.toString() !== req.params.studentId);
    await course.save();
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPLOAD PDF -> generate week content via AI and add to course (teacher only)
router.post("/:id/upload", authMiddleware, requireRole("teacher"), upload.single("pdf"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }

    const text = await pdfService.extractPdfText(req.file.path);
    const result = await aiService.generateCourseContent(text);

    const nextWeekNumber = course.weeks.length > 0
      ? Math.max(...course.weeks.map(w => w.number)) + 1
      : 1;

    const newWeek = {
      number: nextWeekNumber,
      title: result.title || `Week ${nextWeekNumber}`,
      description: result.description || "",
      lessonNotes: result.lessonNotes || [],
      lessonSummary: result.lessonSummary || { lesson: [], page: [] },
      flashCards: result.flashCards || [],
      hasCode: false,
    };

    course.weeks.push(newWeek);
    await course.save();

    res.json({
      success: true,
      data: course,
      outdatedFlags: result.outdatedFlags || [],
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE a specific week (teacher only)
router.put("/:id/weeks/:weekId", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }

    const week = course.weeks.find(w => w._id.toString() === req.params.weekId);
    if (!week) return res.status(404).json({ success: false, error: "Week not found" });

    const { title, description } = req.body;
    if (title !== undefined) week.title = title;
    if (description !== undefined) week.description = description;

    await course.save();
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Re-check a specific week for outdated content (teacher only)
router.post("/:id/weeks/:weekId/recheck", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not your course" });
    }

    const week = course.weeks.find(w => w._id.toString() === req.params.weekId);
    if (!week) return res.status(404).json({ success: false, error: "Week not found" });

    const aiService = require("../services/aiService");
    const flags = await aiService.checkOutdatedContent(week);

    res.json({ success: true, data: flags });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;