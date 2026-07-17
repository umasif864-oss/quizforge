'use client';

import { useState } from 'react';

interface Question {
  id: number;
  text: string;
}

interface QuizListProps {
  initialQuestions?: string[];
}

export default function QuizList({ initialQuestions = [] }: QuizListProps) {
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions.map((text, i) => ({ id: i + 1, text }))
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  function startEdit(question: Question) {
    setEditingId(question.id);
    setEditText(question.text);
  }

  function saveEdit() {
    if (!editText.trim()) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === editingId ? { ...q, text: editText.trim() } : q))
    );
    setEditingId(null);
    setEditText('');
  }

  function cancelEdit() {
    const question = questions.find((q) => q.id === editingId);
    if (question && question.text === '') {
      setQuestions((prev) => prev.filter((q) => q.id !== editingId));
    }
    setEditingId(null);
    setEditText('');
  }

  function deleteQuestion(id: number) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (editingId === id) { setEditingId(null); setEditText(''); }
  }

  function addQuestion() {
    const newId = Date.now();
    setQuestions((prev) => [...prev, { id: newId, text: '' }]);
    setEditingId(newId);
    setEditText('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sm font-medium text-[#1E2A38]">Quiz questions</h2>
        <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-mono)' }}>
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      <ul className="flex flex-col gap-3">
        {questions.map((q, index) => {
          const isEditing = editingId === q.id;
          return (
            <li
              key={q.id}
              className={`bg-white rounded-xl shadow-sm transition-all ${
                isEditing
                  ? 'border border-[#2F6F4E] ring-1 ring-[#2F6F4E]/20'
                  : q.text === ''
                  ? 'border border-dashed border-[#D9D0BC]'
                  : 'border border-[#D9D0BC]'
              }`}
            >
              {/* Row */}
              <div className="flex items-start gap-3 px-4 py-3">
                {/* Number badge */}
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F0EDE6] text-[#2F6F4E] text-xs font-medium flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>

                {/* Question text */}
                <span
                  className={`flex-1 text-sm leading-relaxed cursor-pointer py-0.5 ${
                    q.text === '' ? 'text-[#9CA3AF] italic' : 'text-[#1E2A38]'
                  }`}
                  onClick={() => startEdit(q)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startEdit(q); }}
                >
                  {q.text || 'Click to write your question…'}
                </span>

                {/* Edit / Save */}
                <button
                  onClick={() => (isEditing ? saveEdit() : startEdit(q))}
                  className="flex-shrink-0 w-7 h-7 rounded-md border border-[#D9D0BC] text-[#6B7280] hover:text-[#1E2A38] hover:border-[#1E2A38] text-sm flex items-center justify-center transition-colors"
                  title={isEditing ? 'Save' : 'Edit'}
                >
                  {isEditing ? '✓' : '✎'}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="flex-shrink-0 w-7 h-7 rounded-md border border-[#FECACA] text-[#EF4444] hover:bg-[#FEF2F2] text-sm flex items-center justify-center transition-colors"
                  title="Delete"
                >
                  ✕
                </button>
              </div>

              {/* Edit area */}
              {isEditing && (
                <div className="px-4 pb-4 pl-[3.25rem]">
                  <textarea
                    autoFocus
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question here…"
                    className="w-full px-3 py-2 text-sm text-[#1E2A38] border border-[#93C5FD] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2F6F4E]/30 resize-y"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                  <p className="text-xs text-[#9CA3AF] mt-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
                    Cmd+Enter to save · Esc to cancel
                  </p>
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-1.5 bg-[#1E2A38] text-white text-xs font-medium rounded-full hover:bg-[#2F3E52] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-1.5 border border-[#D9D0BC] text-[#6B7280] text-xs rounded-full hover:border-[#1E2A38] hover:text-[#1E2A38] transition-colors"
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
        onClick={addQuestion}
        className="mt-3 w-full py-3 border border-dashed border-[#D9D0BC] rounded-xl text-sm text-[#6B7280] hover:border-[#2F6F4E] hover:text-[#2F6F4E] transition-colors bg-transparent"
      >
        + Add a question
      </button>
    </div>
  );
}