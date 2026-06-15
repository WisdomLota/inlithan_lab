const Course = require("../models/Course");
const ResearchPaper = require("../models/ResearchPaper");
const { fetchRandomRecentPaper } = require("./arxivService");
const aiService = require("./aiService");

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(now.getFullYear(), now.getMonth(), diff);
}

async function generateWeeklyResearchPaper() {
  const courses = await Course.find().select("title");
  const topics = courses.map(c => c.title).slice(0, 5);

  const arxivPaper = await fetchRandomRecentPaper(topics);
  if (!arxivPaper) throw new Error("No paper found from arXiv");

  const pages = await aiService.generateResearchSummary(arxivPaper.title, arxivPaper.summary);

  const paper = await ResearchPaper.create({
    title: arxivPaper.title,
    sourceUrl: arxivPaper.url,
    sourceTitle: arxivPaper.title,
    authors: arxivPaper.authors,
    pages,
    weekOf: getWeekStart(),
  });

  return paper;
}

module.exports = { generateWeeklyResearchPaper, getWeekStart };