export const getWeatherTool = {
  functionDeclarations: [
    {
      name: "getWeather",
      description:
        "Get the weather for a city. Use this tool to get the weather for a city.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
          },
        },
        required: ["city"],
      },
    },
  ],
};

export const getWeather = async (city) => {
  console.log("Weather tool called for:", city);

  return `The weather in ${city} is sunny`;
};
