const { callLLM } = require("../utils/llmClients.js");

function buildCourseworkPrompt(text) {
  return `
        You are an AI tutor. Based on the following course material:

        "${text}"

        Generate coursework strictly in JSON with this structure:
        {
          "title": "Course title",
          "about": "Text explaining the course",
          "week 1": "Text for week 1,
          "week 2": "Text for week 2,
          "week 3": "Text for week 3,
          and so on
        }

        make sure the matrial you generate to up to par with current conventions and methodology and flag anything that may be outdated
        `;
}

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
      return prompt;
  }
}

async function generateActivity(prompt, type, model = "default") {
  const formattedPrompt = buildPrompt(prompt, type);
  const response = JSON.parse(await callLLM(formattedPrompt, model));

  switch (type) {
    case "course":
      return {
        type,
        prompt,
        questions: response.questions || [],
      };
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

async function generateCourse(text, type, model = "default") {
  if (type === "coursework") {
    const prompt = buildCourseworkPrompt(text);
    const response = await callLLM(prompt, model);
    return response;
  }
  return { error: "Unsupported type" };
}

module.exports = { generateActivity, generateCourse };