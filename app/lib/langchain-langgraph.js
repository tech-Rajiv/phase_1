import { ChatGroq } from "@langchain/groq";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  StateGraph,
  MessagesAnnotation,
  Annotation,
  MemorySaver,
} from "@langchain/langgraph";
import { weatherTool } from "../tools/weatherTool";
import { searchWebTool } from "../tools/searchTool";

const threadId = "conv-1";
const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0,
});

const tools = [weatherTool, searchWebTool];

const modelWithTools = model.bindTools(tools);

const graph = new StateGraph(
  Annotation.Root({
    ...MessagesAnnotation.spec,
    lastToolUsed: Annotation({
      default: () => "",
    }),
    toolCount: Annotation({
      default: () => 0,
    }),
    llmCount: Annotation({
      default: () => 0,
    }),
  }),
);

const callModel = async (state) => {
  const messages = state.messages;
  const recentMessages = messages.slice(-3);
  const response = await modelWithTools.invoke(recentMessages);

  return {
    messages: [response],
    lastToolUsed: response.tool_calls?.[0]?.name || state.lastToolUsed,
    llmCount: (state.llmCount || 0) + 1,
    toolCount: state.toolCount + (response.tool_calls?.length || 0),
  };
};

const toolNode = new ToolNode(tools);

const shouldContinue = (state) => {
  const lastMessage = state.messages.at(-1);

  if (lastMessage.tool_calls?.length) {
    if (state.toolCount >= 3) {
      return "__end__";
    }
    return "toolNode";
  }

  return "__end__";
};

//nodes
graph.addNode("toolNode", toolNode);
graph.addNode("callModel", callModel);

graph.addEdge("__start__", "callModel");
graph.addConditionalEdges("callModel", shouldContinue);
graph.addEdge("toolNode", "callModel");

const checkpointer = new MemorySaver();

const app = graph.compile({
  checkpointer,
});

export async function testLangGraph(question) {
  const result = await app.invoke(
    {
      messages: [
        {
          role: "user",
          content: question,
        },
      ],

      lastToolUsed: "",
      toolCount: 0,
      llmCount: 0,
    },
    {
      configurable: {
        thread_id: threadId,
      },
    },
  );

  console.log("result", result, { depth: null });

  const lastMessage = result.messages.at(-1);
  return lastMessage.content;
}
