import Groq from "groq-sdk";
import { searchWebTool, searchWeb } from "../tools/searchTool";
import { getWeather, weatherTool } from "../tools/weatherTool";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generationWithTool(question, sendStatus, sendAnswer) {
  const toolsFunctions = {
    searchWeb: searchWeb,
    getWeather: getWeather,
  };
  const tools = [searchWebTool, weatherTool];
  const messages = [
    {
      role: "system",
      content: `
  You are a helpful research assistant.
  
  Answer naturally and clearly.
  
  Use Markdown formatting when it improves readability:
  - Use paragraphs for normal explanations.
  - Use bullet points when listing multiple items.
  - Use headings when the answer has distinct sections.
  - Use bold sparingly for important terms.
  - Use tables only when comparing multiple items or when tabular information genuinely makes the answer easier to understand.
  - Use code blocks when showing code.
  - Do not use HTML tags such as <br>, <div>, or <span>.
  - Do not force formatting when a simple paragraph is sufficient.
  `,
    },
    {
      role: "user",
      content: question,
    },
  ];
  const maxToolCalls = 2;
  let toolCallsCount = 0;
  sendStatus("thinking");
  while (toolCallsCount < maxToolCalls) {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages,
      tools,
      include_reasoning: false,
    });
    const message = response.choices[0].message;
    console.log("message", message);
    if (!message.tool_calls?.length) {
      sendStatus("generating");
      console.log("message concluded and groq doesnot want to call any tools");
      // return message.content;
      break;
    }

    const toolCalls = message.tool_calls;
    messages.push(message);
    console.log("message from AI in loop to itself", message);
    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      if (toolName === "searchWeb") {
        sendStatus("searching");
      }
      if (toolName === "getWeather") {
        sendStatus("getting_weather_reports");
      }
      const toolArgs = JSON.parse(toolCall.function.arguments);
      const toolResult = await toolsFunctions[toolName](toolArgs);
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolName,
        content: JSON.stringify(toolResult),
      });
      if (toolName === "searchWeb") {
        sendStatus("search_complete");
      }
      if (toolName === "getWeather") {
        sendStatus("weather_reports_complete");
      }
      // this is important and where you place is also important
      toolCallsCount++;
      console.log("toolCallsCount increased to", toolCallsCount);
    }
  }

  console.log("loop ended ready to generate final answer");
  sendStatus("generating");
  messages.push({
    role: "user",
    content:
      "Please provide the final answer based on the information provided.",
  });
  const finalResponse = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages,
    tool_choice: "none",
    reasoning_effort: "low",
    include_reasoning: false,
    stream: true,
  });

  console.log("finalResponse stream started");

  for await (const chunk of finalResponse) {
    const content = chunk.choices[0]?.delta?.content;

    if (content) {
      sendAnswer(content);
    }
  }
}
