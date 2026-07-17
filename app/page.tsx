import { Analytics } from "@vercel/analytics/next"
import Link from 'next/link';

export const metadata = {
  title: 'QuizForge – Turn any document into a quiz in 30 seconds',
  description:
    'Upload a PDF, Word doc, or slide deck. QuizForge reads it and builds a ready-to-share quiz automatically.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF6ED] paper-texture font-[var(--font-body)]">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-[#FAF6ED]/90 backdrop-blur border-b border-[#D9D0BC]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span
            className="text-lg text-[#1E2A38]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            QuizForge
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#6B7280] hover:text-[#1E2A38] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-[#1E2A38] text-white px-4 py-2 rounded-full hover:bg-[#2F3E52] transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-[#2F6F4E] font-medium mb-4">
          Teacher tools
        </p>
        <h1
          className="text-5xl sm:text-6xl text-[#1E2A38] leading-tight mb-6"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
        >
          Turn any document<br />into a quiz.
        </h1>
        <p className="text-lg text-[#6B7280] mb-10 max-w-xl mx-auto">
          Upload a PDF, Word doc, or slide deck. QuizForge reads it and builds
          a ready-to-share quiz — in under 30 seconds.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="bg-[#1E2A38] text-white px-7 py-3 rounded-full text-sm font-medium hover:bg-[#2F3E52] transition-colors shadow-sm"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="border border-[#D9D0BC] text-[#6B7280] px-7 py-3 rounded-full text-sm font-medium hover:border-[#1E2A38] hover:text-[#1E2A38] transition-colors"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-[#D9D0BC]">
        <p className="text-xs tracking-[0.2em] uppercase text-[#2F6F4E] font-medium mb-10 text-center">
          How it works
        </p>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Upload your document',
              body: 'PDF, Word, or PowerPoint. Any format, any subject.',
            },
            {
              step: '02',
              title: 'AI builds the quiz',
              body: 'Gemini reads your material and writes multiple-choice or true/false questions automatically.',
            },
            {
              step: '03',
              title: 'Share or export',
              body: 'Download a student copy and a teacher answer key as PDF, ready to hand out.',
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="bg-white border border-[#D9D0BC] rounded-xl p-6 shadow-sm">
              <span
                className="text-xs tracking-widest text-[#2F6F4E] font-medium"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {step}
              </span>
              <h3
                className="text-base text-[#1E2A38] mt-2 mb-2"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
              >
                {title}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#1E2A38] py-14">
        <div className="max-w-3xl mx-auto px-6 grid sm:grid-cols-3 gap-8 text-center">
          {[
            { num: '30s', label: 'Average quiz generation' },
            { num: '40+', label: 'Supported file formats' },
            { num: '100%', label: 'Based on your document' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p
                className="text-4xl text-white mb-1"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
              >
                {num}
              </p>
              <p className="text-sm text-[#94A3B8]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2
          className="text-3xl text-[#1E2A38] mb-4"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
        >
          Ready to build your first quiz?
        </h2>
        <p className="text-[#6B7280] mb-8">
          No credit card needed. Free plan includes 5 quizzes per month.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#1E2A38] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#2F3E52] transition-colors shadow-sm"
        >
          Get started free
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#D9D0BC] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <span
            className="text-sm text-[#1E2A38]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            QuizForge
          </span>
          <p className="text-xs text-[#6B7280]">
            &copy; {new Date().getFullYear()} QuizForge &nbsp;·&nbsp;
            <a href="mailto:hello@quizforge.io" className="hover:text-[#1E2A38] transition-colors">
              Contact
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}