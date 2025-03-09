import {
  flashCardsArraySchema,
  flashCardSchema,
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
          "You are a teacher. Your job is to take a document, and create flashcards (with 4 flashCards) based on the content of the document. each flashCard should be roughly equal in length.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Create flashcards based on this document.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: flashCardSchema,
    output: "array",
    onFinish: ({ object }) => {
      const res = flashCardsArraySchema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });

  return result.toTextStreamResponse();
}
