const mongoose = require("mongoose");

const researchPaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sourceUrl: { type: String },
  sourceTitle: { type: String },
  authors: { type: [String], default: [] },
  pages: { type: [Object], default: [] }, // array of page-blocks: [{type, text/items}]
  weekOf: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model("ResearchPaper", researchPaperSchema);