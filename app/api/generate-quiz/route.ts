import { NextRequest, NextResponse } from "next/server";
import { generateQuizFromText } from "@/lib/gemini";
import type { QuestionType } from "@/types/quiz";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceText, numQuestions, questionType } = body as {
      sourceText?: string;
      numQuestions?: number;
      questionType?: QuestionType;
    };

    if (!sourceText || sourceText.trim().length < 50) {
      return NextResponse.json(
        { error: "Not enough text to build a quiz from. Upload a document with more content." },
        { status: 400 }
      );
    }

    const safeNumQuestions = Math.min(Math.max(numQuestions ?? 10, 5), 20);
    const safeQuestionType: QuestionType =
      questionType === "true-false" || questionType === "mixed" ? questionType : "multiple-choice";

    const quiz = await generateQuizFromText({
      sourceText,
      numQuestions: safeNumQuestions,
      questionType: safeQuestionType,
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("generate-quiz error:", error);

    const message = error instanceof Error ? error.message : String(error);
    const isQuota =
      message.includes("429") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("quota");

    return NextResponse.json(
      {
        error: isQuota
          ? "Gemini API quota exceeded. Wait a minute and try again, or add billing at https://ai.dev/rate-limit"
          : "Something went wrong generating the quiz. Please try again.",
      },
      { status: isQuota ? 429 : 500 }
    );
  }
}