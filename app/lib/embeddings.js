import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function createEmbedding(
  text,
  taskType = "RETRIEVAL_DOCUMENT"
) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      taskType,
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}