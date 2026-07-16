"use client";

import { useEffect, useState } from "react";
import type { QuestionType, QuizQuestion } from "@/types/quiz";
import QuizDisplay from "./QuizDisplay";
import QuizList from "./QuizList";

interface QuizGeneratorProps {
  extractedText: string;
  documentName?: string;
}

const LOADING_MESSAGES = [
  "Reading your document…",
  "Identifying key ideas…",
  "Writing questions…",
  "Checking the answers…",
  "Almost ready…",
];

export default function QuizGenerator({ extractedText, documentName }: QuizGeneratorProps) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionType, setQuestionType] = useState<QuestionType>("multiple-choice");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
   const [quizReady, setQuizReady]       = useState(false);
  const [reviewList, setReviewList]     = useState<{ id: number; text: string }[]>([]);

  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(() => setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length), 1600);
    return () => clearInterval(interval);
  }, [status]);

  async function handleGenerate() {
    setStatus("loading");
    setErrorMessage("");
    setMessageIndex(0);
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText: extractedText, numQuestions, questionType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate quiz.");
      setQuiz(data.quiz);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function handleReset() {
    setQuiz(null);
    setStatus("idle");
  }

  if (status === "success" && quiz) {
  if (!quizReady) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <p className="text-xs tracking-[0.2em] uppercase text-[#2F6F4E] font-medium mb-3 px-1">
          Review your questions
        </p>
        <QuizList
          initialQuestions={quiz.map((q) => q.question)}
          onQuestionsChange={setReviewList}
        />
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => setQuizReady(true)}
            className="px-5 py-2.5 bg-[#2F6F4E] text-white rounded-lg text-sm font-medium hover:bg-[#24573D] transition-colors"
          >
            Start quiz →
          </button>
        </div>
      </div>
    );
  }

  // Merge teacher edits back into the full quiz objects (options, answers, etc.)
  const finalQuiz =
    reviewList.length > 0
      ? reviewList
          .filter((item) => item.id < quiz.length)          // drop any manually-added questions
          .map((item) => ({ ...quiz[item.id], question: item.text }))  // apply edited text
      : quiz;                                                // no edits → use original

  return <QuizDisplay quiz={finalQuiz} onGenerateAnother={handleReset} />;
}

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white border border-[#D9D0BC] rounded-lg shadow-sm p-6 sm:p-8">
      <p className="text-xs tracking-[0.2em] uppercase text-[#2F6F4E] font-medium mb-2">
        Quiz builder
      </p>
      <h2 className="text-2xl text-[#1E2A38] mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        Turn {documentName ? `"${documentName}"` : "this document"} into a quiz
      </h2>
      <p className="text-[#6B7280] text-sm mb-6">
        Choose how many questions and what type, then generate.
      </p>

      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="numQuestions" className="text-sm font-medium text-[#1E2A38]">
            Number of questions
          </label>
          <span className="text-lg font-semibold text-[#2F6F4E]" style={{ fontFamily: "var(--font-mono)" }}>
            {numQuestions}
          </span>
        </div>
        <input
          id="numQuestions"
          type="range"
          min={5}
          max={20}
          step={1}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          disabled={status === "loading"}
          className="w-full accent-[#2F6F4E]"
        />
        <div className="flex justify-between text-xs text-[#9A9282] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
          <span>5</span>
          <span>20</span>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm font-medium text-[#1E2A38] mb-2">Question type</p>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: "multiple-choice", label: "Multiple choice" },
              { value: "true-false", label: "True / False" },
              { value: "mixed", label: "Mixed" },
            ] as { value: QuestionType; label: string }[]
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={status === "loading"}
              onClick={() => setQuestionType(option.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                questionType === option.value
                  ? "border-[#2F6F4E] bg-[#2F6F4E]/10 text-[#2F6F4E]"
                  : "border-[#D9D0BC] bg-[#FAF6ED] text-[#6B7280] hover:border-[#2F6F4E]/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {status === "error" && (
        <div className="mb-4 pl-3 border-l-2 border-[#C1443C] text-sm text-[#C1443C]">
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={status === "loading" || !extractedText}
        className="w-full px-5 py-3 bg-[#2F6F4E] text-white rounded-lg text-sm font-medium hover:bg-[#24573D] disabled:bg-[#D9D0BC] disabled:text-[#9A9282] transition-colors"
      >
        {status === "loading" ? `Generating… ${LOADING_MESSAGES[messageIndex]}` : "Generate quiz"}
      </button>

      {status === "loading" && (
        <div className="w-full h-[2px] bg-[#D9D0BC] rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-[#2F6F4E]"
            style={{ animation: "drawLine 1.4s ease-in-out infinite alternate" }}
          />
        </div>
      )}

      {!extractedText && (
        <p className="text-center text-xs text-[#9A9282] mt-3">Upload a document above first.</p>
      )}
    </div>
  );
}