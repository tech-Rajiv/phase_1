import { generationWithTool } from "@/app/lib/tool-generation";

export async function POST(req) {
  const { question } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendStatus = (status) => {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "status",
              status,
            }) + "\n",
          ),
        );
      };

      const sendAnswer = (content) => {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "answer",
              content,
            }) + "\n",
          ),
        );
      };

      try {
        await generationWithTool(question, sendStatus, sendAnswer);

        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "error",
              message: error.message,
            }) + "\n",
          ),
        );

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
    },
  });
}
