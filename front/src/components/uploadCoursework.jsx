import React, { useState } from "react";

export default function UploadCoursework() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("http://localhost:5000/courses/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data.data);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Upload PDF for Coursework</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-orange text-white rounded hover:bg-brand-red disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Coursework"}
      </button>

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Generated Coursework</h3>

          {/* Quizzes */}
          <div className="mb-4">
            <h4 className="font-bold">Quizzes</h4>
            {result.quizzes?.map((q, i) => (
              <div key={i} className="p-2 border rounded mb-2">
                <p className="font-semibold">{q.question}</p>
                <ul className="list-disc ml-6">
                  {q.options.map((opt, idx) => (
                    <li key={idx}>{opt}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-600">Answer: {q.answer}</p>
              </div>
            ))}
          </div>

          {/* Summaries */}
          <div className="mb-4">
            <h4 className="font-bold">Summaries</h4>
            {result.summaries?.map((s, i) => (
              <div key={i} className="p-2 border rounded mb-2">
                <p className="font-semibold">{s.section}</p>
                <p>{s.summary}</p>
              </div>
            ))}
          </div>

          {/* Flashcards */}
          <div>
            <h4 className="font-bold">Flashcards</h4>
            {result.flashcards?.map((c, i) => (
              <div key={i} className="p-2 border rounded mb-2">
                <p className="font-semibold">Front: {c.front}</p>
                <p>Back: {c.back}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}