export const searchWebTool = {
  type: "function",
  function: {
    name: "searchWeb",
    description:
      "Search the internet for general current or up-to-date information. Do not use this tool for current weather because a dedicated weather tool is available.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
      },
      required: ["query"],
    },
  },
};

export const searchWeb = async ({ query }) => {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      max_results: 3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(`Tavily search failed: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return data.results;
};
