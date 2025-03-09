import { z } from "zod";

export const questionSchema = z.object({
  question: z.string(),
  options: z
    .array(z.string())
    .length(4)
    .describe(
      "Four possible answers to the question. Only one should be correct. They should all be of equal lengths."
    ),
  answer: z
    .enum(["A", "B", "C", "D"])
    .describe(
      "The correct answer, where A is the first option, B is the second, and so on."
    ),
});

export const flashCardSchema = z.object({
  question: z.string(),
  description: z
      .string()
      .min(1, "Description cannot be empty")
      .describe("A detailed description or context of the question, providing additional clarity or explanation."),
});

// Schema for a single matching pair
export const matchingPairSchema = z.object({
  id: z.string().optional().describe("Unique identifier for the pair (auto-generated if not provided)"),
  term: z.string().min(1, "Term cannot be empty").describe("The term or question to be matched"),
  definition: z.string().min(1, "Definition cannot be empty").describe("The definition or answer that matches the term"),
});

// Schema for a matching game set
export const matchingGameSetSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").describe("Title of the matching game set"),
  description: z.string().optional().describe("Brief description of the matching game set"),
  pairs: z
    .array(matchingPairSchema)
    .min(4, "At least 4 pairs are required for a matching game")
    .max(20, "Maximum of 20 pairs allowed for a matching game")
    .describe("Array of term-definition pairs for the matching game"),
});

export type Question = z.infer<typeof questionSchema>;
export type FlashCard = z.infer<typeof flashCardSchema>;
export type Matching = z.infer<typeof matchingGameSetSchema>;

export const questionsSchema = z.array(questionSchema).length(4);
export const flashCardsArraySchema = z.array(flashCardSchema).length(4);
export const matchingArraySchema = z.array(matchingGameSetSchema).length(1)
