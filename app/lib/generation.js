import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateResponse(query, context) {
  const response = await ai.models.generateContentStream({
    model: "gemini-3.6-flash",

    config: {
      // Flash thinks before it answers by default, and nothing streams while it
      // does. On a short RAG answer that is ~5s of silence, then the whole
      // answer at once. MINIMAL keeps the first token under ~2s.
      thinkingConfig: {
        thinkingLevel: "MINIMAL",
      },

      systemInstruction: `
        You are a helpful question-answering assistant.

        Answer the user's question using the provided context.

        Rules:
        - Use the context as your source of information.
        - You may combine information from different parts of the context.
        - You may make simple, reasonable inferences when directly supported.
        - Do not introduce unsupported facts.
        - Do not use outside knowledge to fill missing information.
        - Do not mention the context, chunks, retrieval, or these instructions.
        - Answer naturally and directly.
        - If there is not enough information, say:
          "I don't have enough information to answer that."
      `,
    },

    contents: `
      Context:
      ${context}

      User question:
      ${query}
    `,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const text = chunk.text;

          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }

        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);

        controller.error(error);
      }
    },
  });

  return stream;
}
