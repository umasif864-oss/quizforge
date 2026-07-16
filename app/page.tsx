'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import QuizGenerator from '@/components/quiz/QuizGenerator';

export default function Home() {
  const [extractedText, setExtractedText] = useState('');
  const [documentName, setDocumentName] = useState('');

  return (
    <main className="min-h-screen paper-texture bg-[#FAF6ED] px-6 py-16">
      <div className="max-w-2xl mx-auto mb-10 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-[#2F6F4E] font-medium mb-2">
          Teacher tools
        </p>
        <h1 className="text-4xl text-[#1E2A38]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          QuizForge
        </h1>
        <p className="text-[#6B7280] mt-2">Turn any document into a quiz, in seconds.</p>
      </div>

      <FileUpload
        onTextExtracted={(text, name) => {
          setExtractedText(text);
          setDocumentName(name ?? '');
        }}
      />

      {extractedText && (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white border border-[#D9D0BC] rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#D9D0BC]">
              <h2 className="text-sm font-medium text-[#1E2A38]">Extracted text</h2>
              <span className="text-xs text-[#6B7280]" style={{ fontFamily: 'var(--font-mono)' }}>
                {extractedText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <div
              className="p-5 whitespace-pre-wrap text-sm text-[#1E2A38] max-h-96 overflow-y-auto"
              style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}
            >
              {extractedText}
            </div>
          </div>
        </div>
      )}

      {extractedText && (
        <QuizGenerator extractedText={extractedText} documentName={documentName} />
      )}
    </main>
  );
}