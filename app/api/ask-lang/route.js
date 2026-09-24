import { testLangChainAgent } from "@/app/lib/langchain-agent";
import { testLangGraph } from "@/app/lib/langchain-langgraph";
import { testLangChain } from "@/app/lib/langchain-manual";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { question } = await request.json();

  const response = await testLangGraph(question);

  //   console.log("response by route", response);
  return NextResponse.json({ data: response });
}
