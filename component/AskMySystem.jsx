"use client";

import React, { useState } from "react";

function AskMySystem() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const handleAsk = async () => {
    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(question)}`,
      );

      if (!response.body) {
        throw new Error("Response body is empty");
      }

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      let answerText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        console.log("CHUNK:", chunk);

        answerText += chunk;

        setAnswer(answerText);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col p-5 items-center justify-center h-screen">
      <div className="mb-4">
        The Lantern in the Rain Arjun lived in a small village called Devgarh
        with his mother and younger sister Meera. He worked as a carpenter in a
        workshop near the village market. Every morning, he opened the workshop
        at seven o'clock and usually worked until sunset. One evening, heavy
        rain began falling while Arjun was returning home from the market. On
        the way, he noticed an old man standing beside a broken wooden cart. The
        old man was trying to protect a small lantern from the rain, but the
        lantern kept going out. Arjun stopped and offered to help. He repaired
        the broken wheel of the cart using a piece of wood he had in his tool
        bag. The old man thanked him and introduced himself as Dev, a retired
        school teacher who lived on the other side of the village. Because the
        rain became heavier, Arjun invited Dev to stay at his house for the
        night. When they arrived, Meera gave Dev a dry blanket and Arjun's
        mother prepared hot tea and dinner for him. During dinner, Dev told the
        family that he had lost an important notebook while travelling through
        the village. The notebook contained years of notes about plants and
        traditional medicines that he had collected while working as a teacher.
        The next morning, Arjun went back to the road where he had found Dev.
        After searching near the broken cart, he discovered the notebook under a
        large stone. He cleaned the wet cover and carefully returned it to Dev.
        Dev was extremely happy. Before leaving, he gave Arjun the old lantern
        that he had repaired. He told Arjun that the lantern had belonged to his
        father and had been with his family for many years. Arjun kept the
        lantern in his workshop. From that day onward, he turned it on every
        evening before closing the workshop, remembering that a small act of
        kindness can sometimes become an important memory.
      </div>
      <h1>Ask my system</h1>
      <input
        type="text"
        placeholder="Ask me anything"
        className="w-full max-w-md p-2 border border-gray-300 rounded-md"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded-md mt-2"
        onClick={handleAsk}
      >
        {loading ? "..." : "Ask"}
      </button>
      {answer && (
        <div id="answer" className="mt-4">
          <div className="text-lg font-bold whitespace-pre-wrap">{answer}</div>
        </div>
      )}
    </div>
  );
}

export default AskMySystem;
