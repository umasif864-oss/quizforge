import { useState } from "react";

// ─── QuizList ────────────────────────────────────────────────────────────────
// Drop this component wherever you currently display your AI-generated questions.
// It receives an array of question strings as "initialQuestions".
//
// Usage example:
//   <QuizList initialQuestions={["What is photosynthesis?", "Name a planet."]} />
// ─────────────────────────────────────────────────────────────────────────────

export default function QuizList({ initialQuestions = [] }) {
  // "questions" is the list we show on screen.
  // Each question is an object with a unique id and the text string.
  const [questions, setQuestions] = useState(
    initialQuestions.map((text, i) => ({ id: i + 1, text }))
  );

  // "editingId" tracks WHICH question is currently open for editing.
  // null means nothing is being edited right now.
  const [editingId, setEditingId] = useState(null);

  // "editText" holds whatever the teacher is typing while editing.
  const [editText, setEditText] = useState("");

  // ── Open a question for editing ──────────────────────────────────────────
  function startEdit(question) {
    setEditingId(question.id);
    setEditText(question.text); // pre-fill the textarea with existing text
  }

  // ── Save the edited text back into the list ──────────────────────────────
  function saveEdit() {
    if (!editText.trim()) return; // don't save a blank question
    setQuestions((prev) =>
      prev.map((q) => (q.id === editingId ? { ...q, text: editText.trim() } : q))
    );
    setEditingId(null);
    setEditText("");
  }

  // ── Cancel without saving ────────────────────────────────────────────────
  function cancelEdit() {
    // If this was a brand-new blank question and user cancels, remove it
    const question = questions.find((q) => q.id === editingId);
    if (question && question.text === "") {
      setQuestions((prev) => prev.filter((q) => q.id !== editingId));
    }
    setEditingId(null);
    setEditText("");
  }

  // ── Delete a question ────────────────────────────────────────────────────
  function deleteQuestion(id) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditText("");
    }
  }

  // ── Add a blank new question and immediately open it for editing ─────────
  function addQuestion() {
    const newId = Date.now(); // simple unique id using current timestamp
    const newQuestion = { id: newId, text: "" };
    setQuestions((prev) => [...prev, newQuestion]);
    setEditingId(newId);
    setEditText("");
  }

  // ── Keyboard shortcuts inside the textarea ───────────────────────────────
  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") saveEdit(); // Cmd/Ctrl + Enter = save
    if (e.key === "Escape") cancelEdit();                           // Esc = cancel
  }

  return (
    <div style={styles.wrapper}>
      {/* Header row */}
      <div style={styles.header}>
        <h2 style={styles.title}>Quiz questions</h2>
        <span style={styles.count}>
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Question list */}
      <ul style={styles.list}>
        {questions.map((q, index) => {
          const isEditing = editingId === q.id;

          return (
            <li
              key={q.id}
              style={{
                ...styles.card,
                ...(isEditing ? styles.cardEditing : {}),
                ...(q.text === "" ? styles.cardNew : {}),
              }}
            >
              {/* Top row: number badge + question text + action buttons */}
              <div style={styles.row}>
                {/* Number badge */}
                <span style={styles.badge}>{index + 1}</span>

                {/* Question text — click it to start editing */}
                <span
                  style={{
                    ...styles.questionText,
                    ...(q.text === "" ? styles.placeholder : {}),
                  }}
                  onClick={() => startEdit(q)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") startEdit(q);
                  }}
                >
                  {q.text || "Click to write your question…"}
                </span>

                {/* Edit / Save button */}
                <button
                  style={styles.iconBtn}
                  onClick={() => (isEditing ? saveEdit() : startEdit(q))}
                  title={isEditing ? "Save question" : "Edit question"}
                >
                  {isEditing ? "✓" : "✎"}
                </button>

                {/* Delete button */}
                <button
                  style={{ ...styles.iconBtn, ...styles.deleteBtn }}
                  onClick={() => deleteQuestion(q.id)}
                  title="Delete question"
                >
                  ✕
                </button>
              </div>

              {/* Editing area — only shown when this question is active */}
              {isEditing && (
                <div style={styles.editArea}>
                  <textarea
                    autoFocus
                    style={styles.textarea}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question here…"
                    rows={3}
                  />
                  <div style={styles.hint}>
                    <kbd>Cmd+Enter</kbd> to save &nbsp;·&nbsp; <kbd>Esc</kbd> to cancel
                  </div>
                  <div style={styles.editButtons}>
                    <button style={styles.saveBtn} onClick={saveEdit}>
                      Save question
                    </button>
                    <button style={styles.cancelBtn} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Add question button */}
      <button style={styles.addBtn} onClick={addQuestion}>
        + Add a question
      </button>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Plain JS objects — no extra CSS files or libraries needed.
const styles = {
  wrapper: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "1.5rem 1rem",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  title: {
    fontSize: 20,
    fontWeight: 500,
    margin: 0,
    color: "#1a1a1a",
  },
  count: {
    fontSize: 13,
    color: "#6b7280",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  card: {
    background: "#fff",
    border: "0.5px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    transition: "border-color 0.15s",
  },
  cardEditing: {
    border: "1px solid #3b82f6",
  },
  cardNew: {
    borderStyle: "dashed",
  },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "0.9rem 1rem",
  },
  badge: {
    flexShrink: 0,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 1.5,
    color: "#111827",
    cursor: "pointer",
    padding: "2px 0",
  },
  placeholder: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  iconBtn: {
    flexShrink: 0,
    width: 30,
    height: 30,
    borderRadius: 6,
    border: "0.5px solid #d1d5db",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    color: "#ef4444",
    borderColor: "#fca5a5",
  },
  editArea: {
    padding: "0 1rem 0.9rem 2.5rem",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    fontSize: 15,
    fontFamily: "system-ui, sans-serif",
    lineHeight: 1.5,
    padding: "10px 12px",
    border: "1px solid #93c5fd",
    borderRadius: 6,
    background: "#f9fafb",
    color: "#111827",
    outline: "none",
    resize: "vertical",
  },
  hint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 6,
  },
  editButtons: {
    display: "flex",
    gap: 8,
    marginTop: 10,
  },
  saveBtn: {
    padding: "7px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "7px 16px",
    background: "transparent",
    color: "#6b7280",
    border: "0.5px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
  },
  addBtn: {
    marginTop: 10,
    width: "100%",
    padding: "12px",
    border: "0.5px dashed #9ca3af",
    borderRadius: 12,
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    color: "#6b7280",
    fontFamily: "system-ui, sans-serif",
  },
};