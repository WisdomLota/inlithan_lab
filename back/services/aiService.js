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

function buildPrompt(prompt, type, questionCount) {
  switch (type) {
    case "quiz":
      return `
        You are an AI tutor. Generate a quiz based on the following topic:

        "${prompt}"

        Generate exactly ${questionCount || 5} questions.

        Return ONLY a raw JSON object with absolutely no explanation, no markdown, no backticks, no extra text before or after. Just the JSON:
        {
          "questions": [
            {
              "question": "string",
              "options": ["option text 1", "option text 2", "option text 3", "option text 4"],
              "answer": "the exact text of the correct option, identical to one of the strings in options, with no letter prefix"
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

async function generateActivity(prompt, type, model = "default", timeout, questionCount) {
  const formattedPrompt = buildPrompt(prompt, type, questionCount);
  const raw = await callLLM(formattedPrompt, model, timeout);

  let clean = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/^[^{[]*/, "")
    .replace(/[^}\]]*$/, "")
    .trim();

  // remove trailing commas before } or ]
  clean = clean.replace(/,(\s*[}\]])/g, "$1");

  let response;
  try {
    response = JSON.parse(clean);
  } catch (err) {
    console.error("Failed to parse AI response:", clean);
    response = { questions: [], main: "", summary: "", cards: [] };
  }

  switch (type) {
    case "course":
      return { type, prompt, questions: response.questions || [] };
    case "quiz":
      return { type, prompt, questions: response.questions || [] };
    case "explanation":
      return { type, prompt, main: response.main || "", summary: response.summary || "" };
    case "flashcards":
      return { type, prompt, cards: response.cards || [] };
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

async function generateCourseContent(text) {
  const prompt = `
You are an AI curriculum designer. Based on the following course material, generate ONE week's worth of structured lesson content.

"${text.slice(0, 6000)}"

Return ONLY a raw JSON object with no explanation, no markdown, no backticks:
{
  "title": "Week title",
  "description": "Short week description",
  "lessonNotes": [
    [
      { "type": "h", "text": "Section heading" },
      { "type": "p", "text": "Paragraph text" },
      { "type": "ul", "items": ["point 1", "point 2"] }
    ]
  ],
  "lessonSummary": {
    "lesson": [{ "type": "p", "text": "summary text" }],
    "page": [{ "type": "p", "text": "shorter summary" }]
  },
  "flashCards": [
    { "question": "Q text", "answer": "A text" }
  ],
  "outdatedFlags": ["Any outdated concepts found in the material, with explanation"]
}
`;

  const raw = await callLLM(prompt, "ollama", 180000); // 3 minutes for large documents
  let clean = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/^[^{[]*/, "")
    .replace(/[^}\]]*$/, "")
    .trim();

  clean = clean.replace(/,(\s*[}\]])/g, "$1");

    try {
      return JSON.parse(clean);
    } catch (err) {
      console.error("Failed to parse course content:", clean);
      return {
        title: "Untitled Week",
        description: "",
        lessonNotes: [],
        lessonSummary: { lesson: [], page: [] },
        flashCards: [],
        outdatedFlags: ["AI response could not be parsed. Please try uploading again."],
      };
    }
  }

async function checkOutdatedContent(week) {
  const contentText = JSON.stringify({
    title: week.title,
    description: week.description,
    lessonNotes: week.lessonNotes,
  }).slice(0, 8000);

  const prompt = `
You are an AI curriculum reviewer. Review the following week's lesson content for outdated information, deprecated technologies, superseded standards, or methodologies that have since changed.

"${contentText}"

Return ONLY a raw JSON object with no explanation, no markdown, no backticks:
{
  "outdatedFlags": ["Description of outdated item and what it should be updated to", "..."],
  "isUpToDate": true or false
}

If nothing is outdated, return an empty array and isUpToDate: true.
`;

  const raw = await callLLM(prompt, "ollama");
  let clean = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/^[^{[]*/, "")
    .replace(/[^}\]]*$/, "")
    .trim();

  // remove trailing commas before } or ]
  clean = clean.replace(/,(\s*[}\]])/g, "$1");

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error("Failed to parse AI response:", clean);
    // graceful fallback
    return { outdatedFlags: [], isUpToDate: true, parseError: true };
  }
}

async function generateResearchSummary(paperTitle, paperSummary) {
  const prompt = `
You are an academic writing assistant. Based on the following research paper abstract, write a multi-page structured summary suitable for students.

Title: "${paperTitle}"
Abstract: "${paperSummary}"

Return ONLY a raw JSON object with no explanation, no markdown, no backticks:
{
  "pages": [
    [
      { "type": "h", "text": "Section heading" },
      { "type": "p", "text": "Paragraph text" },
      { "type": "ul", "items": ["point 1", "point 2"] }
    ]
  ]
}

Generate 3-5 pages, each page being an array of blocks. Cover: overview, key concepts, methodology/approach, findings, and relevance to students.
`;

  const raw = await callLLM(prompt, "ollama", 180000);
  let clean = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/^[^{[]*/, "")
    .replace(/[^}\]]*$/, "")
    .trim();
  clean = clean.replace(/,(\s*[}\]])/g, "$1");

  try {
    const parsed = JSON.parse(clean);
    return parsed.pages || [];
  } catch (err) {
    console.error("Failed to parse research summary:", clean);
    return [[{ type: "p", text: paperSummary }]];
  }
}

module.exports = { generateActivity, generateCourse, generateCourseContent, checkOutdatedContent, generateResearchSummary };