import {
  matchingArraySchema,
  matchingGameSetSchema,
} from "@/lib/schemas";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";

export const maxDuration = 60;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERARIVE_AI,
});

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;

  const result = streamObject({
    model: google("gemini-1.5-pro-latest"),
    messages: [
      {
        role: "system",
        content:
          "You are a teacher. Your job is to take a document and create matching pairs (terms and definitions) for a memory match game. Generate exactly 8 pairs, where each term has a corresponding definition. Ensure the terms and definitions are clear, concise, and directly related to the content of the document.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Create matching pairs for a memory match game based on this document.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: matchingGameSetSchema,
    output: "array",
    onFinish: ({ object }) => {
      const res = matchingArraySchema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });
  return result.toTextStreamResponse();
}
