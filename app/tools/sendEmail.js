import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const sendEmailTool = tool(
  async ({ to, message }) => {
    const approval = interrupt({
      action: "send_email",
      to,
      message,
      question: "Do you want to send this email?",
    });

    if (approval !== "yes") {
      return "Email was not sent.";
    }
    console.log("📧 EMAIL SENT");
    console.log("To:", to);
    console.log("Message:", message);

    return "Email sent successfully";
  },
  {
    name: "sendEmail",
    description: "Send an email to someone",
    schema: z.object({
      to: z.string(),
      message: z.string(),
    }),
  },
);
