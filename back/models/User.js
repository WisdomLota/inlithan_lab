const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  role: { type: String, enum: ["student", "teacher", "unset"], default: "unset" },
  githubId: { type: String },
  googleId: { type: String },
  githubUsername: { type: String },
  githubAccessToken: { type: String },
  score: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);