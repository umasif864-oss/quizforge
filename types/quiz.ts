export type QuestionType = "multiple-choice" | "true-false" | "mixed";

export interface QuizQuestion {
  question: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}