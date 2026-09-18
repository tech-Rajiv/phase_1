import { generationWithTool } from "@/app/lib/tool-generation";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { question } = await request.json();
  const response = await generationWithTool(question);
  console.log("response", response);
  return NextResponse.json({ data: response });
}
