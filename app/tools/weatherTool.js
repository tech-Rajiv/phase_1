import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const weatherTool = tool(
  async ({ city }) => {
    console.log("🔥🔥🔥 WEATHER TOOL EXECUTED:", city);

    throw new Error("Weather API is down");
  },
  {
    name: "getWeather",
    description: "Get weather information for a location.",
    schema: z.object({
      city: z.string(),
      type: z.enum([
        "current",
        "forecast",
        "history",
        "alerts",
        "astronomy",
        "timezone",
      ]),
      date: z.string().optional(),
    }),
  },
);
