const axios = require("axios");
const {GoogleGenAI} = require("@google/genai")

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
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

  const res = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  })

  console.log(res.text);

  return res.text
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

async function callGeminiWithRotation(prompt) {
  const keys = [
    process.env.GEMINI_KEY,
    process.env.LAB2_API_KEY
  ].filter(Boolean); // remove undefined keys

  let lastError;

  for (const key of keys) {
    try {
      const client = new GoogleGenAI({ apiKey: key });

      const result = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      });

      return result; // success
    } catch (err) {
      const code = err?.status || err?.error?.code;
      console.warn(`Key ${key || "undefined"} failed with code ${code}`);
      lastError = err;

      // skip to next key if it's a quota or transient error
      if (code === 429 || code === 503) {
        continue;
      } else {
        throw err; // stop on other errors
      }
    }
  }

  // if all keys failed
  throw lastError || new Error("All Gemini API keys exhausted or invalid.");
}

module.exports = { callLLM, callGeminiWithRotation };