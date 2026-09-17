import fs from "fs/promises";
import path from "path";


import { chunkText } from "@/app/lib/chunk";
import { createEmbedding } from "@/app/lib/embeddings";
import pool from "@/app/lib/db";


export async function GET() {
  // 1. Read our TXT file
  const filePath = path.join(
    process.cwd(),
    "data",
    "knowledge.txt"
  );

  const text = await fs.readFile(filePath, "utf8");

  // 2. Turn the document into chunks
  const chunks = chunkText(text);

  console.log("Chunks:", chunks);

  // 3. Store every chunk + embedding
  for (const chunk of chunks) {
    const embedding = await createEmbedding(
      chunk,
      "RETRIEVAL_DOCUMENT"
    );

    await pool.query(
      `
      INSERT INTO documents (content, embedding)
      VALUES ($1, $2)
      `,
      [chunk, `[${embedding.join(",")}]`]
    );
  }

  return Response.json({
    success: true,
    chunksIndexed: chunks.length,
  });
}