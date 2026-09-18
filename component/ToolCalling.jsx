"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ToolCalling() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCallTool = async () => {
    setLoading(true);
    setError(null);
    setAnswer("");

    try {
      const response = await fetch("/api/ask-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      setAnswer(data?.data || "");
    } catch (error) {
      console.log("error", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex p-10 flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Tool Ask</h1>

      <input
        type="text"
        className="border-2 border-gray-300 p-2 rounded-md"
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        className="bg-blue-500 active:bg-blue-600 text-white p-2 rounded-md"
        onClick={handleCallTool}
        disabled={loading}
      >
        Call Tool
      </button>

      {loading ? (
        <div className="font-medium w-full text-center my-4">Searching...</div>
      ) : (
        <div className="w-full max-w-5xl my-4 prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default ToolCalling;
