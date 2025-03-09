import { ClipboardList, Edit3, Layers, Puzzle } from "lucide-react";

export const MODES = [
  {
    value: "quiz",
    label: "Practice Quiz",
    description: "Test knowledge with various choose the correct answer questions",
    icon: ClipboardList,
  },
  {
    value: "flashcards",
    label: "Flashcards",
    description: "Memorize key terms and concepts",
    icon: Layers,
  },
  {
    value: "matching",
    label: "Matching Game",
    description: "Connect related terms and definitions",
    icon: Puzzle,
  },

];

export enum LearningModeEnum {
  QUIZ = "quiz",
  FLASHCARDS = "flashcards",
  MATCHING = "matching",
}

export type LearningMode = "quiz" | "flashcards" | "matching";