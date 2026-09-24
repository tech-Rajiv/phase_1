import { ChatGroq } from "@langchain/groq";

import { weatherTool } from "../tools/weatherTool";
import { searchWebTool } from "../tools/searchTool";
import { createAgent } from "langchain";

const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0,
});

const agent = createAgent({
  model,
  tools: [weatherTool, searchWebTool],
});

export async function testLangChainAgent(question) {
  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });

  console.dir(result, { depth: null });
  const lastMessage = result.messages.at(-1);
  return lastMessage;
}
