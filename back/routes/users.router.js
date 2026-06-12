const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");
const jwt = require("jsonwebtoken");

// GET current user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE profile (name only - email comes from OAuth provider)
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    if (name) user.name = name;
    await user.save();

    const newToken = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email, avatar: user.avatar, githubUsername: user.githubUsername, hasGoogle: !!user.googleId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, data: user, token: newToken });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;