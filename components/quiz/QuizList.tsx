import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
  id: number;   // 0-based original index for initial questions; Date.now() for new ones
  text: string;
}

interface QuizListProps {
  initialQuestions: string[];
  /** Fires after every save / delete so QuizGenerator can track the current list. */
  onQuestionsChange?: (questions: { id: number; text: string }[]) => void;
}

// ─── QuizList ─────────────────────────────────────────────────────────────────
// File location: components/quiz/QuizList.tsx
// ──────────────────────────────────────────────────────────────────────────────

export default function QuizList({ initialQuestions = [], onQuestionsChange }: QuizListProps) {
  const [questions, setQuestions] = useState<Question[]>(
    // id = original array index (0-based) so QuizGenerator can match back to quiz objects
    initialQuestions.map((text, i) => ({ id: i, text }))
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText]   = useState<string>("");

  // Helper: fire the change callback with the latest list
  function notify(updated: Question[]) {
    onQuestionsChange?.(updated.map((q) => ({ id: q.id, text: q.text })));
  }

  // Open a question for editing
  function startEdit(q: Question) {
    setEditingId(q.id);
    setEditText(q.text);
  }

  // Save the edited text
  function saveEdit() {
    if (!editText.trim()) return;
    const updated = questions.map((q) =>
      q.id === editingId ? { ...q, text: editText.trim() } : q
    );
    setQuestions(updated);
    setEditingId(null);
    setEditText("");
    notify(updated);
  }

  // Cancel editing (remove blank questions that were never filled in)
  function cancelEdit() {
    const q = questions.find((q) => q.id === editingId);
    if (q && q.text === "") {
      const updated = questions.filter((q) => q.id !== editingId);
      setQuestions(updated);
      notify(updated);
    }
    setEditingId(null);
    setEditText("");
  }

  // Delete a question
  function deleteQuestion(id: number) {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    if (editingId === id) { setEditingId(null); setEditText(""); }
    notify(updated);
  }

  // Add a blank question and open it immediately
  function addQuestion() {
    const newId = Date.now(); // large number → won't collide with original indices
    const updated = [...questions, { id: newId, text: "" }];
    setQuestions(updated);
    setEditingId(newId);
    setEditText("");
    // don't notify yet — wait until they save it
  }

  // Keyboard shortcuts
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  }

  return (
    <div className="bg-white border border-[#D9D0BC] rounded-lg shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#1E2A38]">
          Edit before you begin
        </h3>
        <span className="text-xs text-[#9A9282]">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Question list */}
      <ul className="flex flex-col gap-2.5 p-0 m-0" style={{ listStyle: "none" }}>
        {questions.map((q, index) => {
          const isEditing = editingId === q.id;
          const isEmpty   = q.text === "";

          return (
            <li
              key={q.id}
              className={`rounded-lg border transition-colors overflow-hidden ${
                isEditing
                  ? "border-[#2F6F4E]"
                  : isEmpty
                  ? "border-dashed border-[#D9D0BC]"
                  : "border-[#D9D0BC]"
              }`}
            >
              {/* Row: number + text + buttons */}
              <div className="flex items-start gap-2.5 px-4 py-3">
                {/* Number badge */}
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FAF6ED] text-[#2F6F4E] text-xs font-semibold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>

                {/* Question text — click to edit */}
                <span
                  className={`flex-1 text-sm leading-relaxed cursor-pointer py-0.5 ${
                    isEmpty ? "text-[#9A9282] italic" : "text-[#1E2A38] hover:text-[#2F6F4E]"
                  }`}
                  onClick={() => startEdit(q)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") startEdit(q);
                  }}
                >
                  {isEmpty ? "Click to write your question…" : q.text}
                </span>

                {/* Edit / Save button */}
                <button
                  type="button"
                  onClick={() => (isEditing ? saveEdit() : startEdit(q))}
                  title={isEditing ? "Save" : "Edit"}
                  className="flex-shrink-0 w-7 h-7 rounded border border-[#D9D0BC] bg-transparent text-[#6B7280] text-xs hover:border-[#2F6F4E] hover:text-[#2F6F4E] transition-colors flex items-center justify-center"
                >
                  {isEditing ? "✓" : "✎"}
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deleteQuestion(q.id)}
                  title="Delete question"
                  className="flex-shrink-0 w-7 h-7 rounded border border-[#fca5a5] bg-transparent text-[#ef4444] text-xs hover:bg-red-50 transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Editable textarea */}
              {isEditing && (
                <div className="px-4 pb-4 pl-11">
                  <textarea
                    autoFocus
                    className="w-full text-sm text-[#1E2A38] leading-relaxed p-3 border border-[#2F6F4E]/40 rounded-lg bg-[#FAF6ED] outline-none resize-y"
                    style={{ boxSizing: "border-box" }}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question here…"
                    rows={3}
                  />
                  <p className="text-xs text-[#9A9282] mt-1.5">
                    <kbd>Cmd+Enter</kbd> to save &nbsp;·&nbsp; <kbd>Esc</kbd> to cancel
                  </p>
                  <div className="flex gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="px-4 py-1.5 bg-[#2F6F4E] text-white rounded-lg text-xs font-medium hover:bg-[#24573D] transition-colors"
                    >
                      Save question
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-1.5 border border-[#D9D0BC] text-[#6B7280] rounded-lg text-xs hover:border-[#9A9282] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Add question */}
      <button
        type="button"
        onClick={addQuestion}
        className="mt-3 w-full py-3 border border-dashed border-[#D9D0BC] rounded-lg text-sm text-[#9A9282] hover:text-[#1E2A38] hover:border-[#9A9282] transition-colors"
      >
        + Add a question
      </button>
    </div>
  );
}