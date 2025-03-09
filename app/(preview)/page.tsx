"use client";

import { useState } from "react";
import {
  flashCardsArraySchema,
  matchingArraySchema,
  questionsSchema,
} from "@/lib/schemas";
import { z } from "zod";
import Quiz from "@/components/quiz";
import QuizGenerator from "@/components/quiz-generator";
import { LearningMode, LearningModeEnum } from "@/lib/constants";
import FlashCard from "@/components/flash-cards";
import CardMatchingGame from "@/components/matching-question";

export default function ChatWithFiles() {
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>(
    []
  );
  const [flashCards, setFlashCards] = useState<
    z.infer<typeof flashCardsArraySchema>
  >([]);
  const [matchingGameSet, setMatchingGameSets] = useState<
    z.infer<typeof matchingArraySchema>
  >([]);
  const [mode, setMode] = useState<LearningMode>(LearningModeEnum.QUIZ);
  const [title, setTitle] = useState("Quiz");

  const clearPDF = () => {
    setQuestions([]);
    setFlashCards([]);
    setMatchingGameSets([]);
  };

  if (
    questions.length === 0 &&
    flashCards.length === 0 &&
    matchingGameSet.length === 0
  ) {
    return (
      <QuizGenerator
        setQuestions={setQuestions}
        setFlashCards={setFlashCards}
        setMatchingGameSets={setMatchingGameSets}
        mode={mode}
        setMode={setMode}
        setTitle={setTitle}
      />
    );
  }

  switch (mode) {
    case LearningModeEnum.QUIZ:
      return <Quiz title={title} questions={questions} clearPDF={clearPDF} />;
    case LearningModeEnum.FLASHCARDS:
      return <FlashCard title={title} cards={flashCards} clearPDF={clearPDF} />;
    case LearningModeEnum.MATCHING:
      return (
        <CardMatchingGame
          title={title}
          matchingGameSet={matchingGameSet[0]}
          clearPDF={clearPDF}
        />
      );
    default:
      return null;
  }
}
