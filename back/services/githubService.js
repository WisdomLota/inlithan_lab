const axios = require("axios");

const DAY_MS = 1000 * 60 * 60 * 24;

async function getGithubStats(accessToken, username) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
  const repos = reposRes.data;

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

// Detailed stats for Student List "Rank Details"
async function getDetailedGithubStats(accessToken, username) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
  const repos = reposRes.data;

  // Events API: up to ~90 days, used for week/month commit counts
  const eventsRes = await axios.get(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
  const events = eventsRes.data;

  const now = Date.now();
  const pushEvents = events.filter(e => e.type === "PushEvent");

  const commitsWeek = pushEvents
    .filter(e => now - new Date(e.created_at).getTime() <= 7 * DAY_MS)
    .reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);

  const commitsMonth = pushEvents
    .filter(e => now - new Date(e.created_at).getTime() <= 30 * DAY_MS)
    .reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);

  const commitsYear = pushEvents
    .filter(e => now - new Date(e.created_at).getTime() <= 365 * DAY_MS)
    .reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);

  // All-time commits: sum contributor stats across top repos (capped to avoid rate-limit issues)
  let commitsAllTime = 0;
  const topRepos = repos
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 5);

  for (const repo of topRepos) {
    try {
      const statsRes = await axios.get(
        `https://api.github.com/repos/${username}/${repo.name}/stats/contributors`,
        { headers }
      );
      const contributor = (statsRes.data || []).find(c => c.author?.login === username);
      if (contributor) {
        commitsAllTime += contributor.total || 0;
      }
    } catch {
      // stats endpoint can 202 (computing) or fail - skip silently
    }
  }

  // fallback: if all-time computation yields 0, use yearly as floor
  if (commitsAllTime === 0) commitsAllTime = commitsYear;

  // Top languages across repos
  const languageCounts = {};
  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang)
    .join(", ") || "N/A";

  const prEvents = events.filter(e => e.type === "PullRequestEvent");

  return {
    repoCount: repos.length,
    commitCount: pushEvents.reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0),
    prCount: prEvents.length,
    commitsWeek,
    commitsMonth,
    commitsYear,
    commitsAllTime,
    topLanguages,
  };
}

module.exports = { getGithubStats, getDetailedGithubStats };