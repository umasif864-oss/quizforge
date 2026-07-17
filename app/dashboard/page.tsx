'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import FileUpload from '@/components/FileUpload';
import QuizGenerator from '@/components/quiz/QuizGenerator';

export default function DashboardPage() {
  const [extractedText, setExtractedText] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // ── Auth guard: redirect to /login if not signed in ──
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
      } else {
        setUserEmail(data.session.user.email ?? null);
        setChecking(false);
      }
    });
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAF6ED] paper-texture flex items-center justify-center">
        <p className="text-sm text-[#6B7280]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6ED] paper-texture">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-[#FAF6ED]/90 backdrop-blur border-b border-[#D9D0BC]">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <span
            className="text-base text-[#1E2A38]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            QuizForge
          </span>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-xs text-[#6B7280] hidden sm:block truncate max-w-[180px]">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-xs text-[#6B7280] hover:text-[#1E2A38] transition-colors border border-[#D9D0BC] px-3 py-1.5 rounded-full"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="px-6 py-12">
        <div className="max-w-2xl mx-auto mb-10 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-[#2F6F4E] font-medium mb-2">
            Teacher tools
          </p>
          <h1
            className="text-4xl text-[#1E2A38]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
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
                <span
                  className="text-xs text-[#6B7280]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
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
    </div>
  );
}