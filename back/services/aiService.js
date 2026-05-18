const { callLLM } = require("../utils/llmClients.js");

async function generateActivity(prompt, type, model = "default") {
  // Example: type could be "quiz", "explanation", "flashcards"
  const response = await callLLM(prompt, model);

  switch (type) {
    case "quiz":
      return {
        type,
        prompt,
        questions: response.questions || ["Sample Q1", "Sample Q2"],
      };
    case "explanation":
      return {
        type,
        prompt,
        explanation: response.text || "Generated explanation...",
      };
    case "flashcards":
      return {
        type,
        prompt,
        cards: response.cards || [{ front: "Term", back: "Definition" }],
      };
    default:
      return { type, prompt, output: response.text };
  }
}

module.exports = { generateActivity };