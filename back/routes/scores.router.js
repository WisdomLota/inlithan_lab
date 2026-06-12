const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Score = require("../models/Score");
const Activity = require("../models/Activity");
const { getGithubStats } = require("../services/githubService");
const { authMiddleware } = require("../middleware/auth");

// Weight constants for score calculation
const WEIGHTS = {
  githubCommit: 2,
  githubPR: 10,
  githubRepo: 5,
  activityCompleted: 15,
  quizScorePercent: 0.5, // multiplied by avg quiz score percentage
};

function computeTotal(score) {
  return (
    score.githubCommits * WEIGHTS.githubCommit +
    score.githubPRs * WEIGHTS.githubPR +
    score.githubRepos * WEIGHTS.githubRepo +
    score.activitiesCompleted * WEIGHTS.activityCompleted +
    score.quizScoreTotal * WEIGHTS.quizScorePercent
  );
}

// Refresh current user's score
router.post("/refresh", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    let githubStats = { repoCount: 0, commitCount: 0, prCount: 0 };
    if (user.githubAccessToken && user.githubUsername) {
      try {
        githubStats = await getGithubStats(user.githubAccessToken, user.githubUsername);
      } catch (err) {
        console.warn("GitHub stats fetch failed:", err.message);
      }
    }

    // Calculate app activity stats
    const activities = await Activity.find({ "submissions.student": user._id });
    let activitiesCompleted = 0;
    let quizScoreTotal = 0;
    let quizCount = 0;

    activities.forEach(activity => {
      activity.submissions.forEach(sub => {
        if (sub.student.toString() === user._id.toString()) {
          activitiesCompleted++;
          if (activity.type === "Quiz") {
            quizScoreTotal += sub.score;
            quizCount++;
          }
        }
      });
    });

    const avgQuizScore = quizCount > 0 ? quizScoreTotal / quizCount : 0;

    let score = await Score.findOne({ userId: user._id });
    if (!score) score = new Score({ userId: user._id });

    score.githubCommits = githubStats.commitCount;
    score.githubPRs = githubStats.prCount;
    score.githubRepos = githubStats.repoCount;
    score.activitiesCompleted = activitiesCompleted;
    score.quizScoreTotal = avgQuizScore;
    score.totalScore = computeTotal(score);

    await score.save();

    res.json({ success: true, data: score });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get leaderboard (all students, sorted by totalScore)
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const scores = await Score.find().populate("userId", "name avatar githubUsername role");
    const studentScores = scores
      .filter(s => s.userId?.role === "student")
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((s, i) => ({
        rank: i + 1,
        userId: s.userId._id,
        name: s.userId.name,
        avatar: s.userId.avatar,
        githubUsername: s.userId.githubUsername,
        githubCommits: s.githubCommits,
        githubPRs: s.githubPRs,
        githubRepos: s.githubRepos,
        activitiesCompleted: s.activitiesCompleted,
        totalScore: Math.round(s.totalScore),
      }));

    res.json({ success: true, data: studentScores });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get current user's score
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const score = await Score.findOne({ userId: req.user.id });
    res.json({ success: true, data: score || null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;