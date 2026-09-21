export const weatherTool = {
  type: "function",
  function: {
    name: "getWeather",

    description:
      "Get weather information for a location. Use this tool for current weather, forecasts, historical weather, weather alerts, astronomy, or local time information.",

    parameters: {
      type: "object",

      properties: {
        city: {
          type: "string",
          description: "The city or location to get weather information for.",
        },

        type: {
          type: "string",
          enum: [
            "current",
            "forecast",
            "history",
            "alerts",
            "astronomy",
            "timezone",
          ],
          description: "The type of weather information requested.",
        },

        date: {
          type: "string",
          description:
            "The date for historical weather in YYYY-MM-DD format. Required when type is history.",
        },
      },

      required: ["city", "type"],
    },
  },
};

export const getWeather = async ({ city, type, date }) => {
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

  console.log("weather data response", data);
  return data;
};
