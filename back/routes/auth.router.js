const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware/auth");

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email, avatar: user.avatar, githubUsername: user.githubUsername, hasGoogle: !!user.googleId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// GitHub OAuth
router.get("/github", passport.authenticate("github", {
  scope: ["user:email", "read:user", "repo"],
}));

router.get("/github/link", authMiddleware, (req, res, next) => {
  passport.authenticate("github", {
    scope: ["user:email", "read:user", "repo"],
    state: req.user.id,
  })(req, res, next);
});

router.get("/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    const linkingUserId = req.query.state;

    if (linkingUserId) {
      try {
        const User = require("../models/User");
        const githubUser = req.user;
        const originalUser = await User.findById(linkingUserId);

        if (originalUser) {
          originalUser.githubId = githubUser.githubId;
          originalUser.githubUsername = githubUser.githubUsername;
          originalUser.githubAccessToken = githubUser.githubAccessToken;
          await originalUser.save();

          if (githubUser._id.toString() !== originalUser._id.toString()) {
            if (githubUser.role !== "unset") {
              // This GitHub account is already a separate real account - don't merge
              return res.redirect(`${process.env.FRONTEND_URL}/settings?linked=conflict`);
            }
            await User.deleteOne({ _id: githubUser._id });
          }

          const newToken = generateToken(originalUser);
          return res.redirect(`${process.env.FRONTEND_URL}/settings?linked=success&token=${newToken}`);
        }
      } catch (err) {
        console.error("Link error:", err);
      }
      return res.redirect(`${process.env.FRONTEND_URL}/settings?linked=fail`);
    }

    const token = generateToken(req.user);
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