const { callLLM, callGeminiWithRotation } = require("../utils/llmClients.js");

function buildCourseworkPrompt(text) {
  return `
        You are an AI tutor. Based on the following course material:

        "${text}"

        Generate coursework strictly in JSON with this structure:
        {
          "title": "Course title",
          "about": "Text explaining the course",
          "week 1": "Text for week 1",
          "week 2": "Text for week 2",
          "week 3": "Text for week 3",
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

        Return ONLY a raw JSON object with absolutely no explanation, no markdown, no backticks, no extra text before or after. Just the JSON:
        {
          "questions": [
            {
              "question": "string",
              "options": ["A. option", "B. option", "C. option", "D. option"],
              "answer": "string"
            }
          ]
        }
        `;

    case "explanation":
      return `
        You are an AI tutor. Explain the following topic:

        "${prompt}"

        Return ONLY a raw JSON object with absolutely no explanation, no markdown, no backticks, no extra text before or after. Just the JSON:
        {
          "main": "Detailed explanation text",
          "summary": "Short summary text"
        }
        `;
    case "flashcards":
      return `
        You are an AI tutor. Create flashcards for the following topic:

        "${prompt}"

        Return ONLY a raw JSON object with absolutely no explanation, no markdown, no backticks, no extra text before or after. Just the JSON:
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
  const raw = await callLLM(formattedPrompt, model);
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  const response = JSON.parse(clean);

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
    const result = await callGeminiWithRotation(text);
    return result;
  }
  return { error: "Unsupported type" };
}

module.exports = { generateActivity, generateCourse };