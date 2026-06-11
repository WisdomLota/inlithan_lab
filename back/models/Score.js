const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  githubCommits: { type: Number, default: 0 },
  githubPRs: { type: Number, default: 0 },
  githubRepos: { type: Number, default: 0 },
  activitiesCompleted: { type: Number, default: 0 },
  quizScoreTotal: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Score", scoreSchema);