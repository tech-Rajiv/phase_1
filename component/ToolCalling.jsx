"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ToolCalling() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines = buffer.split("\n");

        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;

          const data = JSON.parse(line);

          if (data.type === "status") {
            console.log("STATUS:", data.status);
            setStatus(data.status);
          }
          if (data.type === "answer") {
            setAnswer((prev) => prev + data.content);
          }

          if (data.type === "error") {
            setError(data.message);
          }
        }
      }
    } catch (error) {
      console.log("error", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setStatus("");
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
      <div className="w-full max-w-5xl my-4 prose">
        {status === "thinking" && <div>🧠 Thinking...</div>}

        {status === "searching" && <div>🔎 Searching the web...</div>}

        {status === "search_complete" && (
          <div>📚 Reading search results...</div>
        )}

        {status === "generating" && <div>✍️ Generating answer...</div>}

        {answer && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default ToolCalling;
