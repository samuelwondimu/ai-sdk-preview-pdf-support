import { Button } from "@/components/ui/button";
import { flashCardsArraySchema } from "@/lib/schemas";
import { z } from "zod";
import { useState } from "react";
import { Progress } from "./ui/progress";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";

const FlashCard = ({
  cards,
  title,
  clearPDF,
}: {
  clearPDF: () => void;
  cards: z.infer<typeof flashCardsArraySchema>;
  title: string;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const currentCard = cards[currentCardIndex];

  const goToNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setProgress(((currentCardIndex + 2) / cards.length) * 100);
    }
  };

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      setProgress((currentCardIndex / cards.length) * 100);
    }
  };

  const [progress, setProgress] = useState(0);

  if (!currentCard) return null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <div className="mb-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Card {currentCardIndex + 1}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      <div
        className="relative w-full h-[400px] perspective-1000 mb-8 cursor-pointer overflow-hidden"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          <Card className="absolute w-full h-full backface-hidden">
            <CardContent className="flex items-center justify-center h-full p-6 text-center">
              <div>
                <p className="text-xl font-medium">{currentCard.question}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="absolute w-full h-full backface-hidden rotate-y-180">
            <CardContent className="flex items-center justify-center h-full p-6 text-center">
              <div>
                <p className="text-xl">{currentCard.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between gap-4 flex-wrap">
        <Button
          onClick={goToPrevCard}
          disabled={currentCardIndex === 0}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={goToNextCard}
          disabled={currentCardIndex === cards.length - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button
          onClick={clearPDF}
          disabled={currentCardIndex !== cards.length - 1}
          variant="outline"
          className="w-full md:w-fit"
        >
          <FileText className="mr-2 h-4 w-4" /> Try Another PDF
        </Button>
      </div>
    </div>
  );
};

export default FlashCard;
