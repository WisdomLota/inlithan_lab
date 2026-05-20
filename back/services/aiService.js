const { callLLM } = require("../utils/llmClients.js");

function buildPrompt(prompt, type) {
  switch (type) {
    case "quiz":
      return `
You are an AI tutor. Generate a quiz based on the following topic:

"${prompt}"

Return the result strictly in JSON with this structure:
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "string"
    }
  ]
}
`;
    case "explanation":
      return `
You are an AI tutor. Explain the following topic:

"${prompt}"

Return the result strictly in JSON with this structure:
{
  "main": "Detailed explanation text",
  "summary": "Short summary text"
}
`;
    case "flashcards":
      return `
You are an AI tutor. Create flashcards for the following topic:

"${prompt}"

Return the result strictly in JSON with this structure:
{
  "cards": [
    { "front": "Term", "back": "Definition" }
  ]
}
`;
    default:
      return prompt; // fallback
  }
}

async function generateActivity(prompt, type, model = "default") {
  const formattedPrompt = buildPrompt(prompt, type);
  const response = JSON.parse(await callLLM(formattedPrompt, model));

  switch (type) {
    case "quiz":
      return {
        type,
        prompt,
        questions: response.questions || [],
      };
    case "explanation":
      return {
        type,
        prompt,
        main: response.main || "",
        summary: response.summary || "",
      };
    case "flashcards":
      return {
        type,
        prompt,
        cards: response.cards || [],
      };
    default:
      return { type, prompt, output: response.text || response };
  }
}

module.exports = { generateActivity };