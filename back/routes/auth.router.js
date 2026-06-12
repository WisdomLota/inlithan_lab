const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware/auth");

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email, avatar: user.avatar },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// GitHub OAuth
router.get("/github", passport.authenticate("github", {
  scope: ["user:email", "read:user", "public_repo"]
}));

router.get("/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    const token = generateToken(req.user);

    // refresh score in background
    const Score = require("../models/Score");
    const { getGithubStats } = require("../services/githubService");
    (async () => {
      try {
        if (req.user.githubAccessToken && req.user.githubUsername) {
          const stats = await getGithubStats(req.user.githubAccessToken, req.user.githubUsername);
          let score = await Score.findOne({ userId: req.user._id });
          if (!score) score = new Score({ userId: req.user._id });
          score.githubCommits = stats.commitCount;
          score.githubPRs = stats.prCount;
          score.githubRepos = stats.repoCount;
          score.totalScore = score.githubCommits * 2 + score.githubPRs * 10 + score.githubRepos * 5 + score.activitiesCompleted * 15 + score.quizScoreTotal * 0.5;
          await score.save();
        }
      } catch (err) {
        console.warn("Background score refresh failed:", err.message);
      }
    })();

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Google OAuth
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch {
    res.status(401).json({ success: false });
  }
});

// Set role (called after first login)
router.post("/role", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    user.role = req.body.role;
    await user.save();

    const newToken = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email, avatar: user.avatar },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token: newToken });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;