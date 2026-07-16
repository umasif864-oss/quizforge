// src/utils/generatePDF.js
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * @param {Object} quiz
 * @param {string} quiz.title        - Quiz title
 * @param {string} [quiz.subject]    - Optional subject line
 * @param {Array}  quiz.questions    - Array of question objects
 *   Each question: {
 *     text: string,
 *     options: string[],          // e.g. ["Paris", "London", "Rome", "Berlin"]
 *     correctAnswer: string,      // e.g. "Paris"
 *     type: "multiple-choice" | "short-answer"
 *   }
 * @param {"teacher"|"student"} version
 */
export function generateQuizPDF(quiz, version = "student") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const isTeacher = version === "teacher";

  const MARGIN = 48;
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
  let y = MARGIN;

  // ── Helpers ──────────────────────────────────────────────────────────────

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const writeLine = (text, opts = {}) => {
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

    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent);
    checkPageBreak(lines.length * (fontSize * 1.4) + gap);
    doc.text(lines, MARGIN + indent, y);
    y += lines.length * (fontSize * 1.4) + gap;
  };

  const drawHRule = (color = [200, 200, 200]) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 10;
  };

  // ── Header ────────────────────────────────────────────────────────────────

  // Coloured banner
  doc.setFillColor(isTeacher ? 220 : 59, isTeacher ? 38 : 130, isTeacher ? 38 : 246);
  doc.rect(0, 0, PAGE_WIDTH, 70, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(quiz.title || "Quiz", MARGIN, 38);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const badge = isTeacher ? "TEACHER — ANSWER KEY INCLUDED" : "STUDENT COPY";
  doc.text(badge, MARGIN, 56);

  y = 90;

  // Meta row
  if (quiz.subject) {
    writeLine(`Subject: ${quiz.subject}`, { fontSize: 10, color: [100, 100, 100] });
  }
  writeLine(`Date: ___________________________    Name: ___________________________`, {
    fontSize: 10,
    color: [100, 100, 100],
  });
  y += 6;
  drawHRule();

  // ── Questions ─────────────────────────────────────────────────────────────

  quiz.questions.forEach((q, i) => {
    checkPageBreak(60);

    // Question number + text
    writeLine(`${i + 1}.  ${q.text}`, { fontSize: 12, fontStyle: "bold", gap: 10 });

    if (q.type === "multiple-choice" && Array.isArray(q.options)) {
      const letters = ["A", "B", "C", "D", "E"];
      q.options.forEach((opt, j) => {
        const prefix = `${letters[j] ?? j + 1}.`;
        writeLine(`${prefix}  ${opt}`, { indent: 16, fontSize: 11, gap: 5 });
      });

      if (isTeacher && q.correctAnswer) {
        y += 4;
        writeLine(`✓  Correct Answer: ${q.correctAnswer}`, {
          indent: 16,
          fontSize: 10,
          fontStyle: "bold",
          color: [22, 163, 74], // green
          gap: 4,
        });
      }
    } else {
      // Short-answer blank lines for students; model answer for teachers
      if (isTeacher && q.correctAnswer) {
        writeLine(`Answer: ${q.correctAnswer}`, {
          indent: 16,
          fontSize: 10,
          fontStyle: "bold",
          color: [22, 163, 74],
          gap: 4,
        });
      } else {
        // Draw 3 ruled lines for writing
        for (let ln = 0; ln < 3; ln++) {
          checkPageBreak(22);
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.5);
          doc.line(MARGIN + 16, y, PAGE_WIDTH - MARGIN, y);
          y += 22;
        }
      }
    }

    y += 14; // breathing room between questions
    drawHRule([230, 230, 230]);
  });

  // ── Teacher answer-key summary table ─────────────────────────────────────

  if (isTeacher) {
    doc.addPage();
    y = MARGIN;

    writeLine("Answer Key Summary", { fontSize: 16, fontStyle: "bold", gap: 12 });
    drawHRule([59, 130, 246]);

    const tableBody = quiz.questions.map((q, i) => [
      `${i + 1}`,
      q.text.length > 70 ? q.text.slice(0, 70) + "…" : q.text,
      q.correctAnswer ?? "—",
    ]);

    doc.autoTable({
      startY: y,
      head: [["#", "Question", "Answer"]],
      body: tableBody,
      margin: { left: MARGIN, right: MARGIN },
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 120 } },
    });

    y = doc.lastAutoTable.finalY + 16;
  }

  // ── Footer on every page ──────────────────────────────────────────────────

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(
      `${quiz.title ?? "Quiz"} — Generated by QuizForge    |    Page ${p} of ${totalPages}`,
      MARGIN,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  const slug = (quiz.title ?? "quiz").toLowerCase().replace(/\s+/g, "-");
  doc.save(`${slug}-${version}.pdf`);
}