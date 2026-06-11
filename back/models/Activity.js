const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["Quiz", "Assignment", "Notes"], required: true },
  questions: { type: Array, default: [] },
  questionCount: { type: Number, default: 0 },
  timeBased: { type: Boolean, default: false },
  minutes: { type: Number },
  questionType: { type: String, enum: ["Multiple Choice", "Theory", "Mixed"] },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      answers: { type: Array, default: [] },
      score: { type: Number, default: 0 },
      submittedAt: { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);