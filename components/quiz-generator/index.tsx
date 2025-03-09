"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Loader2, UploadCloud } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { LearningMode, MODES } from "@/lib/constants";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  flashCardsArraySchema,
  matchingArraySchema,
  questionsSchema,
} from "@/lib/schemas";
import { experimental_useObject } from "ai/react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface QuizGeneratorProps {
  setQuestions: Dispatch<SetStateAction<z.infer<typeof questionsSchema>>>;
  setFlashCards: Dispatch<
    SetStateAction<z.infer<typeof flashCardsArraySchema>>
  >;
  setMatchingGameSets: Dispatch<
    SetStateAction<z.infer<typeof matchingArraySchema>>
  >;
  mode: LearningMode;
  setMode: Dispatch<SetStateAction<LearningMode>>;
  setTitle: Dispatch<SetStateAction<string>>;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  setQuestions,
  setFlashCards,
  setMatchingGameSets,
  mode,
  setMode,
  setTitle,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const generateQuiz = experimental_useObject({
    api: "/api/generate-quiz",
    schema: questionsSchema,
    initialValue: undefined,
    onError: (error) => {
      toast.error("Failed to generate quiz. Please try again.");
      setFiles([]);
    },
    onFinish: ({ object }) => {
      console.log("Quize", object);
      setQuestions(object ?? []);
    },
  });

  const generateFlashCards = experimental_useObject({
    api: "/api/generate-flashcards",
    schema: flashCardsArraySchema,
    initialValue: undefined,
    onError: (error) => {
      toast.error("Failed to generate quiz. Please try again.");
      setFiles([]);
    },
    onFinish: ({ object }) => {
      console.log("flash cards", object);
      setFlashCards(object ?? []);
    },
  });

  const generateMatchingGameSets = experimental_useObject({
    api: "/api/matching-game",
    schema: matchingArraySchema,
    initialValue: undefined,
    onError: (error) => {
      toast.error("Failed to generate quiz. Please try again.");
      setFiles([]);
    },
    onFinish: ({ object }) => {
      console.log("matching", object);
      setMatchingGameSets(object ?? []);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker."
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024
    );
    console.log(validFiles);

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files under 5MB are allowed.");
    }

    setFiles(validFiles);
  };

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const progress = generateQuiz.object
    ? (generateQuiz.object.length / 4) * 100
    : 0;

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const encodedFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await encodeFileAsBase64(file),
      }))
    );
    switch (mode) {
      case "quiz":
        generateQuiz.submit({
          files: encodedFiles,
        });
        break;
      case "flashcards":
        generateFlashCards.submit({
          files: encodedFiles,
        });
        break;
      case "matching":
        generateMatchingGameSets.submit({
          files: encodedFiles,
        });
        break;
    }

    setTitle(mode);
  };

  const isLoading = Object.values({
    generateQuiz,
    generateFlashCards,
    generateMatchingGameSets,
  }).some((fn) => fn.isLoading);

  const activeGeneration = Object.values({
    generateQuiz,
    generateFlashCards,
  }).find((fn) => fn.object);

  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragExit={() => setIsDragging(false)}
      onDragEnd={() => setIsDragging(false)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        console.log(e.dataTransfer.files);
        handleFileChange({
          target: { files: e.dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(PDFs only)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full md:max-w-[50vw] h-full border-0 sm:border sm:h-fit mt-12">
        <CardHeader className="text-center space-y-6">
          <CardTitle className="text-2xl font-bold">
            PDF Quiz Generator
          </CardTitle>
          <CardDescription className="text-base">
            Upload a PDF to generate an interactive quiz based on its content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitWithFiles} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="learning-mode" className="text-lg font-semibold">
                Select Learning Mode
              </Label>
              <RadioGroup
                defaultValue="quiz"
                className="flex flex-col md:flex-row gap-4"
                onValueChange={(value) => setMode(value as LearningMode)}
              >
                {MODES.map((mode) => (
                  <div key={mode.value} className="md:w-1/2 ">
                    <RadioGroupItem
                      value={mode.value}
                      id={mode.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={mode.value}
                      className="flex flex-col hover:cursor-pointer min-h-[150px] items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <mode.icon className="h-6 w-6 mb-2" />
                      <span className="font-medium">{mode.label}</span>
                      <span className="text-sm text-muted-foreground text-center">
                        {mode.description}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Upload Material</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center space-y-4 cursor-pointer"
                >
                  <UploadCloud className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p>
                      {files.length > 0 ? (
                        <span className="font-medium text-foreground">
                          {files[0].name}
                        </span>
                      ) : (
                        <span>Drop your PDF here or click to browse.</span>
                      )}
                    </p>
                  </div>
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={files.length === 0}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating {mode}...
                </div>
              ) : (
                `Generate ${mode.charAt(0).toUpperCase() + mode.slice(1)}`
              )}
            </Button>
          </form>
        </CardContent>
        {isLoading && (
          <CardFooter className="flex flex-col space-y-4 items-center">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-200" />
            </div>

            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <div className="h-3 w-3 rounded-full bg-yellow-500/70 animate-pulse" />
              <span className="text-center">
                {activeGeneration?.object
                  ? `Generating question ${
                      activeGeneration.object.length + 1
                    } of 4`
                  : "Analyzing content..."}
              </span>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default QuizGenerator;
