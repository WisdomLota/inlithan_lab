import React, { useState } from "react";

export default function UploadCoursework() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    console.log("Upload button clicked", file);
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
      console.log("Response from backend:", data);
      setResult(data);
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
        onChange={(e) => {
          console.log("Selected file:", e.target.files[0]);
          setFile(e.target.files[0]);
        }}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Backend Response</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
