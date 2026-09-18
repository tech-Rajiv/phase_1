import { GoogleGenAI } from "@google/genai";
import { getWeatherTool, getWeather } from "../tools/weatherTool";
import { searchWeb, searchWebTool } from "../tools/searchTool";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generationWithTool(question) {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: `
    User question:
    ${question}
    `,
    config: {
      tools: [getWeatherTool, searchWebTool],
    },
  });
  console.log("response of gemini", response);

  if (response.functionCalls?.length) {
    console.log("gemini wants to call these functions", response.functionCalls);

    const toolCall = response.functionCalls[0];
    console.log("first tool to call is", toolCall?.name);
    console.log("arguments to pass to the tool are", toolCall?.args);

    if (toolCall?.name === "getWeather") {
      console.log("using tool getWeather");
      const toolResult = await getWeather(toolCall.args.city);
      console.log("result of the tool call is", toolResult);

      //send the result of the tool call back to gemini
      const content = [
        {
          role: "user",
          parts: [{ text: question }],
        },
        response.candidates[0].content,
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: toolCall.name,
                response: {
                  result: toolResult,
                },
              },
            },
          ],
        },
      ];
      const finalResponse = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: content,
      });
      return finalResponse.text;
    }

    if (toolCall?.name === "searchWeb") {
      console.log("using tool searchWeb");

      const toolResult = await searchWeb(toolCall.args.query);

      console.log("result of the tool call is", toolResult);

      const content = [
        {
          role: "user",
          parts: [{ text: question }],
        },
        {
          role: "user",
          parts: [{ context: toolResult }],
        },
      ];

      const finalResponse = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: content,
      });
      console.log(
        "SECOND RESPONSE:",
        JSON.stringify(finalResponse?.candidates, null, 2),
      );
      console.log(
        "SECOND CONTENT:",
        JSON.stringify(finalResponse?.candidates?.[0]?.content, null, 2),
      );

      console.log("SECOND FUNCTION CALLS:", finalResponse.functionCalls);

      return finalResponse.text;
    }
  }
  return response.text;
}
