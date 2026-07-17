'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // Supabase sends a confirmation email by default.
    // Show a success state instead of silently redirecting.
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF6ED] paper-texture px-4">
        <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-[#D9D0BC] text-center">
          <div className="text-3xl mb-4">📬</div>
          <h2
            className="text-xl text-[#1E2A38] mb-2"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            Check your email
          </h2>
          <p className="text-sm text-[#6B7280] mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#1E2A38] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#2F3E52] transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF6ED] paper-texture px-4">

      {/* Back to home */}
      <Link
        href="/"
        className="mb-8 text-xs text-[#6B7280] hover:text-[#1E2A38] transition-colors flex items-center gap-1"
      >
        ← Back to QuizForge
      </Link>

      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-[#D9D0BC]">
        <h1
          className="text-2xl text-[#1E2A38] mb-1 text-center"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
        >
          Create account
        </h1>
        <p className="text-sm text-[#6B7280] text-center mb-6">Start building quizzes for free</p>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#D9D0BC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A38]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-[#D9D0BC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A38]"
            />
            <p className="text-xs text-[#9CA3AF] mt-1">Minimum 6 characters</p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded-full bg-[#1E2A38] text-white text-sm font-medium hover:bg-[#2F3E52] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-center text-[#6B7280] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#2F6F4E] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}