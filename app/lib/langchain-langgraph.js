import { ChatGroq } from "@langchain/groq";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { weatherTool } from "../tools/weatherTool";
import { searchWebTool } from "../tools/searchTool";

const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0,
});

const tools = [weatherTool, searchWebTool];

const modelWithTools = model.bindTools(tools);

const graph = new StateGraph(MessagesAnnotation);

const callModel = async (state) => {
  const response = await modelWithTools.invoke(state.messages);

  return {
    messages: [response],
  };
};

const toolNode = new ToolNode(tools);

const shouldContinue = (state) => {
  const lastMessage = state.messages.at(-1);

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  return "__end__";
};

//nodes
graph.addNode("callModel", callModel);

graph.addNode("tools", toolNode);

//edges
graph.addEdge("__start__", "callModel");

graph.addConditionalEdges("callModel", shouldContinue);

graph.addEdge("tools", "callModel");

const app = graph.compile();

export async function testLangGraph(question) {
  const result = await app.invoke({
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });

  console.dir(result, { depth: null });

  const lastMessage = result.messages.at(-1);

  return lastMessage.content;
}
