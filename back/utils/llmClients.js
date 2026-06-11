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
    case "openai":
      return await callOpenAI(prompt);
    case "ollama":
      return await callOllama(prompt);
    default:
      return await callOllama(prompt);
  }
}

// Example Gemini client
async function callGemini(prompt) {
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

  const res = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt
  })

  console.log(res.text);

  return res.text
}

// Example Claude client
async function callClaude(prompt) {
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  
  return message.content[0].text;
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

async function callOpenAI(prompt) {
  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

async function callOllama(prompt) {
  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3.2",
    prompt: prompt,
    stream: false
  });
  return res.data.response;
}

async function callGeminiWithRotation(prompt) {
  const keys = [
    process.env.GEMINI_API_KEY,
  ].filter(Boolean);

  let lastError;

  for (const key of keys) {
    try {
      const client = new GoogleGenAI({ apiKey: key });

      const result = await client.models.generateContent({
        model: "gemini-1.5-flash",
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

module.exports = { callLLM, callGeminiWithRotation, callOpenAI, callClaude, callHuggingFace, callOllama };