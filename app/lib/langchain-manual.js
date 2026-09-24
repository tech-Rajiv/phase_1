import { ChatGroq } from "@langchain/groq";
import { weatherTool } from "../tools/weatherTool";
import { searchWebTool } from "../tools/searchTool";

const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0,
});

const modelWithTools = model.bindTools([weatherTool, searchWebTool]);

export async function testLangChain(question) {
  const response = await modelWithTools.invoke(question);

  console.log("response by model with tools", response);
  console.log("Tool calls:", response.tool_calls);

  // No tool required
  if (!response.tool_calls?.length) {
    return response.content;
  }

  const toolMessages = [];

  for (const toolCall of response.tool_calls) {
    const toolResult = await weatherTool.invoke(toolCall);

    console.log("Tool result:", toolResult);

    toolMessages.push(toolResult);
  }

  // Give the tool result back to the LLM
  const finalResponse = await modelWithTools.invoke([
    {
      role: "user",
      content: question,
    },
    response,
    ...toolMessages,
  ]);

  return finalResponse.content;
}
