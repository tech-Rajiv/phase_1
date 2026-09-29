import { learnLangGraph } from "@/app/lib/learn-lgraph";
import { NextResponse } from "next/server";

export async function GET() {
  const res = await learnLangGraph();
  return NextResponse.json({ data: res });
}
