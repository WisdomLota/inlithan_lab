import React, { useState } from "react";
import { generateActivity } from "../api/ai";

export default function AI() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("quiz");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log("I got called")
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateActivity(prompt, type);
      setResult(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-brand-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-brand-orange mb-4">
        AI Activity Generator
      </h2>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a topic or prompt..."
        className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-brand-orange"
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-brand-orange"
      >
        <option value="quiz">Quiz</option>
        <option value="explanation">Explanation</option>
        <option value="flashcards">Flashcards</option>
      </select>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-red disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}