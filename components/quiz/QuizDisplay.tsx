"use client";
import QuizList from "./QuizList";
import { useState } from "react";
import type { QuizQuestion } from "@/types/quiz";

interface QuizDisplayProps {
  quiz: QuizQuestion[];
  onGenerateAnother: () => void;
}

export default function QuizDisplay({ quiz, onGenerateAnother }: QuizDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
  const [revealed, setRevealed] = useState<boolean[]>(() => quiz.map(() => false));
  const [showSummary, setShowSummary] = useState(false);

  const score = selectedAnswers.reduce<number>(
  (total, answer, i) => (answer === quiz[i].correctAnswerIndex ? total + 1 : total),
  0
);

  function selectAnswer(optionIndex: number) {
    if (revealed[currentIndex]) return;
    const nextAnswers = [...selectedAnswers];
    nextAnswers[currentIndex] = optionIndex;
    setSelectedAnswers(nextAnswers);
    const nextRevealed = [...revealed];
    nextRevealed[currentIndex] = true;
    setRevealed(nextRevealed);
  }

  function goNext() {
    if (currentIndex < quiz.length - 1) setCurrentIndex(currentIndex + 1);
    else setShowSummary(true);
  }
  function goPrevious() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  if (showSummary) {
    const percent = Math.round((score / quiz.length) * 100);
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-white border border-[#D9D0BC] rounded-lg shadow-sm p-8 text-center">
        <div
          className="w-16 h-16 mx-auto rounded-full border-2 border-[#C1443C] flex items-center justify-center"
          style={{ animation: "stampIn 0.5s ease-out", transform: "rotate(-8deg)" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#C1443C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-xs tracking-widest uppercase text-[#C1443C] font-medium mt-3" style={{ fontFamily: "var(--font-mono)" }}>
          Quiz complete
        </p>
        <p className="text-5xl text-[#1E2A38] mt-3" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {score}
          <span className="text-2xl text-[#9A9282]">/{quiz.length}</span>
        </p>
        <p className="text-sm text-[#6B7280] mt-1">{percent}% correct</p>

        <div className="w-full h-2 bg-[#D9D0BC] rounded-full overflow-hidden mt-6">
          <div className="h-full bg-[#2F6F4E] transition-all duration-700" style={{ width: `${percent}%` }} />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-center mt-8">
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setSelectedAnswers(quiz.map(() => null));
              setRevealed(quiz.map(() => false));
              setShowSummary(false);
            }}
            className="px-5 py-2.5 border border-[#D9D0BC] rounded-lg text-sm font-medium text-[#1E2A38] hover:border-[#2F6F4E]/50 transition-colors"
          >
            Retake this quiz
          </button>
          <button
            type="button"
            onClick={onGenerateAnother}
            className="px-5 py-2.5 bg-[#2F6F4E] text-white rounded-lg text-sm font-medium hover:bg-[#24573D] transition-colors"
          >
            Generate a new quiz
          </button>
        </div>
      </div>
    );
  }

  const question = quiz[currentIndex];
  const isLastQuestion = currentIndex === quiz.length - 1;

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white border border-[#D9D0BC] rounded-lg shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-1.5 mb-6">
        {quiz.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i === currentIndex
                ? "bg-[#2F6F4E]"
                : revealed[i]
                ? selectedAnswers[i] === quiz[i].correctAnswerIndex
                  ? "bg-[#2F6F4E]/60"
                  : "bg-[#C1443C]/60"
                : "bg-[#D9D0BC]"
            }`}
          />
        ))}
      </div>

      <p className="text-xs tracking-[0.2em] uppercase text-[#2F6F4E] font-medium mb-2">
        Question {currentIndex + 1} of {quiz.length}
      </p>
      <h3 className="text-lg text-[#1E2A38] mb-5" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        {question.question}
      </h3>

      <div className="space-y-2.5">
        {question.options.map((option, i) => {
          const isSelected = selectedAnswers[currentIndex] === i;
          const isCorrectOption = i === question.correctAnswerIndex;
          const showResult = revealed[currentIndex];

          let stateClasses = "border-[#D9D0BC] bg-[#FAF6ED] hover:border-[#2F6F4E]/40";
          if (showResult && isCorrectOption) stateClasses = "border-[#2F6F4E] bg-[#2F6F4E]/10 text-[#2F6F4E]";
          else if (showResult && isSelected && !isCorrectOption) stateClasses = "border-[#C1443C] bg-[#C1443C]/10 text-[#C1443C]";
          else if (isSelected) stateClasses = "border-[#2F6F4E] bg-[#2F6F4E]/5 text-[#1E2A38]";

          return (
            <button
              key={i}
              type="button"
              onClick={() => selectAnswer(i)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${stateClasses} disabled:cursor-default`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {revealed[currentIndex] && (
        <div className="mt-4 pl-3 border-l-2 border-[#D9D0BC] text-sm text-[#6B7280]">
          {question.explanation}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={goPrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1E2A38] disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!revealed[currentIndex]}
          className="px-5 py-2 bg-[#2F6F4E] text-white rounded-lg text-sm font-medium hover:bg-[#24573D] disabled:bg-[#D9D0BC] disabled:text-[#9A9282] transition-colors"
        >
          {isLastQuestion ? "See results" : "Next question"}
        </button>
      </div>
    </div>
  );
}