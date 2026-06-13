const mongoose = require("mongoose");

const weekSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  lessonNotes: { type: Array, default: [] },
  lessonSummary: { type: Object, default: { lesson: [], page: [] } },
  flashCards: { type: Array, default: [] },
  hasCode: { type: Boolean, default: false },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  about: { type: String, default: "" },
  aboutPoints: { type: [String], default: [] },
  aboutClosing: { type: String, default: "" },
  code: { type: String },
  icon: { type: String },
  currentWeek: { type: Number, default: 1 },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  pendingStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  weeks: [weekSchema],
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);