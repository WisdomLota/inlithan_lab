const axios = require("axios");
const { parseStringPromise } = require("xml2js");

async function fetchRandomRecentPaper(topics = []) {
  const query = topics.length > 0
    ? topics.map(t => `all:${encodeURIComponent(t)}`).join("+OR+")
    : "all:software+engineering";

  const url = `http://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=10`;

  const res = await axios.get(url);
  const parsed = await parseStringPromise(res.data);

  const entries = parsed.feed.entry || [];
  if (entries.length === 0) return null;

  const pick = entries[Math.floor(Math.random() * entries.length)];

  return {
    title: pick.title[0].trim().replace(/\s+/g, " "),
    summary: pick.summary[0].trim().replace(/\s+/g, " "),
    url: pick.id[0],
    authors: (pick.author || []).map(a => a.name[0]),
  };
}

module.exports = { fetchRandomRecentPaper };