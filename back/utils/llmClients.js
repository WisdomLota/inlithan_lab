const axios = require("axios");

async function callLLM(prompt, model) {
  switch (model) {
    case "gemini":
      return await callGemini(prompt);
    case "claude":
      return await callClaude(prompt);
    case "huggingface":
      return await callHuggingFace(prompt);
    default:
      return await callGemini(prompt); // default
  }
}

// Example Gemini client
async function callGemini(prompt) {
  const res = await axios.post("https://api.gemini.com/v1/generate", {
    prompt,
  }, {
    headers: { Authorization: `Bearer ${process.env.GEMINI_API_KEY}` }
  });
  return res.data;
}

// Example Claude client
async function callClaude(prompt) {
  const res = await axios.post("https://api.anthropic.com/v1/complete", {
    prompt,
    model: "claude-3-opus",
  }, {
    headers: { Authorization: `Bearer ${process.env.CLAUDE_API_KEY}` }
  });
  return res.data;
}

// Example HuggingFace client
async function callHuggingFace(prompt) {
  const res = await axios.post("https://api-inference.huggingface.co/models/bert-base-uncased", {
    inputs: prompt,
  }, {
    headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` }
  });
  return res.data;
}

module.exports = { callLLM };