// src/utils/generatePDF.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Types ─────────────────────────────────────────────────────────────────────
export type QuizVersion = "teacher" | "student";

export interface PDFQuestion {
  text: string;
  options?: string[];
  correctAnswer?: string;
  type: "multiple-choice" | "short-answer" | "true-false";
}

export interface PDFQuiz {
  title?: string | null;
  subject?: string | null;
  questions: PDFQuestion[];
}

// ── Main export ───────────────────────────────────────────────────────────────
export function generateQuizPDF(quiz: PDFQuiz, version: QuizVersion = "student"): void {
  if (typeof window === "undefined") return;

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const isTeacher = version === "teacher";

  const MARGIN = 48;
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
  let y = MARGIN;

  // Resolved title — safe to use everywhere
  const title: string = quiz.title ?? "Quiz";

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const writeLine = (
    text: string,
    opts: {
      fontSize?: number;
      fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
      color?: [number, number, number];
      indent?: number;
      gap?: number;
    } = {}
  ): void => {
    const {
      fontSize = 11,
      fontStyle = "normal",
      color = [30, 30, 30],
      indent = 0,
      gap = 6,
    } = opts;

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent) as string[];
    checkPageBreak(lines.length * (fontSize * 1.4) + gap);
    doc.text(lines, MARGIN + indent, y);
    y += lines.length * (fontSize * 1.4) + gap;
  };

  const drawHRule = (color: [number, number, number] = [200, 200, 200]): void => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 10;
  };

  // ── Header ───────────────────────────────────────────────────────────────────

  const headerColor: [number, number, number] = isTeacher ? [220, 38, 38] : [59, 130, 246];
  doc.setFillColor(...headerColor);
  doc.rect(0, 0, PAGE_WIDTH, 70, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(title, MARGIN, 38);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const badge = isTeacher ? "TEACHER — ANSWER KEY INCLUDED" : "STUDENT COPY";
  doc.text(badge, MARGIN, 56);

  y = 90;

  if (quiz.subject) {
    writeLine(`Subject: ${quiz.subject}`, { fontSize: 10, color: [100, 100, 100] });
  }
  writeLine("Date: ___________________________    Name: ___________________________", {
    fontSize: 10,
    color: [100, 100, 100],
  });
  y += 6;
  drawHRule();

  // ── Questions ────────────────────────────────────────────────────────────────

  quiz.questions.forEach((q: PDFQuestion, i: number) => {
    checkPageBreak(60);

    writeLine(`${i + 1}.  ${q.text}`, { fontSize: 12, fontStyle: "bold", gap: 10 });

    if (q.type === "multiple-choice" && Array.isArray(q.options)) {
      const letters = ["A", "B", "C", "D", "E"];
      q.options.forEach((opt: string, j: number) => {
        const prefix = letters[j] ?? String(j + 1);
        writeLine(`${prefix}.  ${opt}`, { indent: 16, fontSize: 11, gap: 5 });
      });

      if (isTeacher && q.correctAnswer) {
        y += 4;
        writeLine(`✓  Correct Answer: ${q.correctAnswer}`, {
          indent: 16,
          fontSize: 10,
          fontStyle: "bold",
          color: [22, 163, 74],
          gap: 4,
        });
      }
    } else {
      if (isTeacher && q.correctAnswer) {
        writeLine(`Answer: ${q.correctAnswer}`, {
          indent: 16,
          fontSize: 10,
          fontStyle: "bold",
          color: [22, 163, 74],
          gap: 4,
        });
      } else {
        for (let ln = 0; ln < 3; ln++) {
          checkPageBreak(22);
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.5);
          doc.line(MARGIN + 16, y, PAGE_WIDTH - MARGIN, y);
          y += 22;
        }
      }
    }

    y += 14;
    drawHRule([230, 230, 230]);
  });

  // ── Teacher answer-key summary table ─────────────────────────────────────────

  if (isTeacher) {
    doc.addPage();
    y = MARGIN;

    writeLine("Answer Key Summary", { fontSize: 16, fontStyle: "bold", gap: 12 });
    drawHRule([59, 130, 246]);

    const tableBody = quiz.questions.map((q: PDFQuestion, i: number) => [
      `${i + 1}`,
      q.text.length > 70 ? q.text.slice(0, 70) + "…" : q.text,
      q.correctAnswer ?? "—",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["#", "Question", "Answer"]],
      body: tableBody,
      margin: { left: MARGIN, right: MARGIN },
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 120 } },
    });
  }

  // ── Footer on every page ──────────────────────────────────────────────────────

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(
      `${title} — Generated by QuizForge    |    Page ${p} of ${totalPages}`,
      MARGIN,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  const slug = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  doc.save(`${slug}-${version}.pdf`);
}