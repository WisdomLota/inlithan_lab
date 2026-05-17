import React, { useState } from "react";
import { generateActivity } from "../api/ai";

export default function AI() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);

  const handleGenerate = () => {
    generateActivity(prompt, "quiz").then(setResult);
  };

  return (
    <div>
      <h2>AI Activity Generator</h2>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt..."
      />
      <button onClick={handleGenerate}>Generate</button>
      {result && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
    </div>
  );
}