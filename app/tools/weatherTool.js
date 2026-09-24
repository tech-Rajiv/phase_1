import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const weatherTool = tool(
  async ({ city, type, date }) => {
    const params = new URLSearchParams({
      key: process.env.WEATHER_API_KEY,
      q: city,
    });

    if (type === "history") {
      if (!date) {
        throw new Error("A date is required for historical weather.");
      }

      params.set("dt", date);
    }

    const response = await fetch(
      `https://api.weatherapi.com/v1/${type}.json?${params.toString()}`,
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(`Weather API failed: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return JSON.stringify(data);
  },
  {
    name: "getWeather",

    description:
      "Get weather information for a location. Use this for current weather, forecasts, historical weather, alerts, astronomy, or timezone information.",

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
