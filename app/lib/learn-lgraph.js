import { StateGraph, Annotation } from "@langchain/langgraph";

const State = Annotation.Root({
  count: Annotation({
    default: () => 0,
  }),

  username: Annotation({
    default: () => "",
  }),
  message: Annotation({
    default: () => "",
  }),
});

const graph = new StateGraph(State);

const incrementCount = async (state) => {
  return {
    count: state.count + 1,
  };
};

const addUsername = async (state) => {
  return {
    username: "rajiv",
  };
};

const addMessage = async (state) => {
  return {
    message: "hello " + state.username + " how are you?",
  };
};

graph.addEdge("__start__", "addUsername");
graph.addEdge("addUsername", "addMessage");
graph.addEdge("addMessage", "incrementCount");
graph.addEdge("incrementCount", "__end__");

graph.addNode("incrementCount", incrementCount);
graph.addNode("addUsername", addUsername);
graph.addNode("addMessage", addMessage);
const app = graph.compile();

export async function learnLangGraph() {
  const res = await app.invoke({});
  console.log("resssss", res);
  return res;
}
