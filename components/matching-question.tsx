"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { matchingGameSetSchema } from "@/lib/schemas";

type CardType = {
  id: string;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: "term" | "definition";
};

interface CardMatchingGameProps {
  title: string;
  matchingGameSet: z.infer<typeof matchingGameSetSchema>;
  clearPDF: () => void;
}

const CardMatchingGame: React.FC<CardMatchingGameProps> = ({
  title,
  matchingGameSet,
  clearPDF,
}) => {
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [cards, setCards] = useState<CardType[]>([]);

  useEffect(() => {
    initializeGame();
  }, [matchingGameSet]);

  const initializeGame = () => {
    const cardPairs = matchingGameSet.pairs.flatMap((pair) => [
      {
        id: `term-${pair.term}`,
        content: pair.term,
        isFlipped: false,
        isMatched: false,
        type: "term" as const,
      },
      {
        id: `definition-${pair.term}`,
        content: pair.definition,
        isFlipped: false,
        isMatched: false,
        type: "definition" as const,
      },
    ]);

    const shuffledCards = shuffle(cardPairs);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
  };

  function shuffle(array: CardType[]) {
    return array.sort(() => Math.random() - 0.5);
  }

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find((card) => card.id === firstId);
      const secondCard = cards.find((card) => card.id === secondId);

      if (firstCard && secondCard) {
        const isMatch =
          (firstCard.type === "term" &&
            secondCard.type === "definition" &&
            firstCard.content ===
              matchingGameSet.pairs.find(
                (pair) => pair.definition === secondCard.content
              )?.term) ||
          (firstCard.type === "definition" &&
            secondCard.type === "term" &&
            secondCard.content ===
              matchingGameSet.pairs.find(
                (pair) => pair.definition === firstCard.content
              )?.term);

        if (isMatch) {
          // Match found
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true, isFlipped: true }
                : card
            )
          );
          setMatchedPairs((prev) => prev + 1);
        } else {
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((card) =>
                card.id === firstId || card.id === secondId
                  ? { ...card, isFlipped: false }
                  : card
              )
            );
          }, 1000);
        }

        setFlippedCards([]);
        setMoves((prev) => prev + 1);
      }
    }
  }, [flippedCards, cards, matchingGameSet.pairs]);

  // Check if game is complete
  useEffect(() => {
    if (matchedPairs === matchingGameSet.pairs.length && matchedPairs > 0) {
      setGameComplete(true);
    }
  }, [matchedPairs, matchingGameSet.pairs.length]);

  const handleCardClick = (id: string) => {
    const clickedCard = cards.find((card) => card.id === id);
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(id) ||
      clickedCard?.isMatched
    ) {
      return;
    }

    setFlippedCards((prev) => [...prev, id]);
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );
  };

  const resetGame = () => {
    initializeGame();
  };

  return (
    <div className="flex flex-col items-center max-w-6xl mx-auto p-4">
      <div className="w-full text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">{matchingGameSet.title}</h1>
        <p className="">{matchingGameSet.description}</p>
        <div className="flex justify-center gap-6 mb-4">
          <div className="text-lg">
            <span className="font-medium">Moves:</span> {moves}
          </div>
          <div className="text-lg">
            <span className="font-medium">Matches:</span> {matchedPairs}/
            {matchingGameSet.pairs.length}
          </div>
        </div>
        <div className="flex gap-4 items-center justify-center">
          <Button onClick={resetGame} variant="outline" className="gap-2">
            <Shuffle className="h-4 w-4" />
            Restart Game
          </Button>
          <Button onClick={clearPDF} variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Try Another PDF
          </Button>
        </div>
      </div>

      {gameComplete && (
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-6 text-center">
          <h2 className="text-xl font-bold mb-2">Congratulations! 🎉</h2>
          <p>You completed the game in {moves} moves!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
        {cards.map((card) => (
          <Card
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={cn(
              "h-24 sm:h-32 flex items-center justify-center cursor-pointer transition-all duration-300 transform",
              card.isFlipped || card.isMatched ? "bg-primary/10" : "",
              card.isMatched &&
                "bg-green-100 dark:bg-green-900 border-green-500",
              !card.isFlipped && !card.isMatched && "hover:bg-primary/20"
            )}
          >
            <div className={cn("transition-all duration-300 text-center px-4")}>
              {card.content}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CardMatchingGame;
