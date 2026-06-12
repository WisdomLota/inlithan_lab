const axios = require("axios");

async function getGithubStats(accessToken, username) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Get user's repos
  const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
  const repos = reposRes.data;

  // Total commits across repos (authenticated user, last 90 days approx via events)
  const eventsRes = await axios.get(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
  const events = eventsRes.data;

  const commitEvents = events.filter(e => e.type === "PushEvent");
  const commitCount = commitEvents.reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);

  const prEvents = events.filter(e => e.type === "PullRequestEvent");

  return {
    repoCount: repos.length,
    commitCount,
    prCount: prEvents.length,
  };
}

module.exports = { getGithubStats };