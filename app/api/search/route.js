import { NextResponse } from "next/server";

import pool from "@/app/lib/db";
import { createEmbedding } from "@/app/lib/embeddings";
import { generateResponse } from "@/app/lib/generation";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      {
        success: false,
        error: "Query is required",
      },
      { status: 400 }
    );
  }

  try {
    const start = Date.now();

    console.log("START");

    // -------------------------
    // 1. Embedding
    // -------------------------

    const embeddingStart = Date.now();

    const queryVector = await createEmbedding(
      query,
      "RETRIEVAL_QUERY"
    );

    console.log(
      "Embedding:",
      Date.now() - embeddingStart,
      "ms"
    );

    // -------------------------
    // 2. Vector search
    // -------------------------

    const vectorString = `[${queryVector.join(",")}]`;

    const searchStart = Date.now();

    const results = await pool.query(
      `
      SELECT
        id,
        content,
        embedding <=> $1 AS distance
      FROM documents
      ORDER BY embedding <=> $1
      LIMIT 3
      `,
      [vectorString]
    );

    console.log(
      "DB search:",
      Date.now() - searchStart,
      "ms"
    );

    // -------------------------
    // 3. Build context
    // -------------------------

    const context = results.rows
      .map((row) => row.content)
      .join("\n\n");

    console.log(
      "Retrieval finished:",
      Date.now() - start,
      "ms"
    );

    // -------------------------
    // 4. Generate + stream
    // -------------------------

    const stream = await generateResponse(
      query,
      context
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate response",
      },
      { status: 500 }
    );
  }
}