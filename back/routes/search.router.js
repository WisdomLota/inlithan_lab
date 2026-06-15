const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Activity = require("../models/Activity");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) return res.json({ success: true, data: { courses: [], activities: [], students: [] } });

    const regex = new RegExp(q, "i");

    let courseFilter = { title: regex };
    if (req.user.role === "teacher") {
      courseFilter.teacher = req.user.id;
    } else {
      courseFilter.students = req.user.id;
    }
    const courses = await Course.find(courseFilter).select("title _id").limit(5);

    const courseIds = courses.length
      ? courses.map(c => c._id)
      : (await Course.find(courseFilter).select("_id")).map(c => c._id);

    const allUserCourses = await Course.find(
      req.user.role === "teacher" ? { teacher: req.user.id } : { students: req.user.id }
    ).select("_id");
    const allCourseIds = allUserCourses.map(c => c._id);

    const activities = await Activity.find({
      courseId: { $in: allCourseIds },
      title: regex,
    }).select("title type courseId _id").limit(5);

    let students = [];
    if (req.user.role === "teacher") {
      const teacherCourses = await Course.find({ teacher: req.user.id }).populate("students", "name email _id");
      const studentMap = new Map();
      teacherCourses.forEach(c => {
        c.students.forEach(s => {
          if (regex.test(s.name) && !studentMap.has(s._id.toString())) {
            studentMap.set(s._id.toString(), { id: s._id, name: s.name, email: s.email });
          }
        });
      });
      students = Array.from(studentMap.values()).slice(0, 5);
    }

    res.json({
      success: true,
      data: {
        courses: courses.map(c => ({ id: c._id, title: c.title })),
        activities: activities.map(a => ({ id: a._id, title: a.title, type: a.type, courseId: a.courseId })),
        students,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;