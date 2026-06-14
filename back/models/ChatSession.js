const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  attachment: { type: String }, // filename of attached PDF, optional
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "New Session" },
  mode: { type: String, enum: ["tutor", "buddy"], default: "buddy" },
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model("ChatSession", chatSessionSchema);