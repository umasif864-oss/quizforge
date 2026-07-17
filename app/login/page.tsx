'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
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
          Log in
        </h1>
        <p className="text-sm text-[#6B7280] text-center mb-6">Welcome back to QuizForge</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              className="w-full px-3 py-2 border border-[#D9D0BC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A38]"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded-full bg-[#1E2A38] text-white text-sm font-medium hover:bg-[#2F3E52] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-xs text-center text-[#6B7280] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#2F6F4E] font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}