import { GoogleGenAI, Type } from "@google/genai";
import type { QuestionType, QuizQuestion } from "@/types/quiz";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GenerateQuizArgs {
  sourceText: string;
  numQuestions: number;
  questionType: QuestionType;
}

export async function generateQuizFromText({
  sourceText,
  numQuestions,
  questionType,
}: GenerateQuizArgs): Promise<QuizQuestion[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "Missing GEMINI_API_KEY. Add it to .env.local and restart your dev server."
    );
  }

  const typeInstruction =
    questionType === "multiple-choice"
      ? "Every question must be multiple choice with exactly 4 answer options."
      : questionType === "true-false"
      ? 'Every question must be true/false. Set "options" to exactly ["True", "False"].'
      : 'Mix multiple choice (4 options) questions and true/false (2 options: ["True","False"]) questions.';

  const prompt = `You are an experienced teacher writing a quiz for students, based only on the source material below. Do not use any outside knowledge.

SOURCE MATERIAL:
"""
${sourceText.slice(0, 20000)}
"""

Write exactly ${numQuestions} quiz questions. ${typeInstruction}
Each question needs one clearly correct answer and a one-sentence explanation of why that answer is correct.`;

  const response = await ai.models.generateContent({
   model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["multiple-choice", "true-false"] },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ["question", "type", "options", "correctAnswerIndex", "explanation"],
          propertyOrdering: ["question", "type", "options", "correctAnswerIndex", "explanation"],
        },
      },
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error("Gemini returned an empty response. Try again.");
  }

  const questions = JSON.parse(rawText) as QuizQuestion[];

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Gemini did not return any quiz questions.");
  }

  return questions;
}