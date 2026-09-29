import { testLangGraph } from "@/app/lib/langchain-langgraph";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { question } = await request.json();

  const response = await testLangGraph(question);

  return NextResponse.json({ data: response });
}
