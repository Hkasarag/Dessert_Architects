import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

type Props = { onGoSignup: () => void }

export default function Login({ onGoSignup }: Props) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    setTimeout(() => {
      const result = login(username, password)
      if (!result.ok) setError(result.error ?? 'Login failed.')
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg"
            style={{ background: 'var(--primary)' }}
          >🥐</div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Frosted Corners</h1>
          <p className="mt-2 text-base" style={{ color: 'var(--muted-foreground)' }}>Your neighborhood AI Dessert Shop</p>
        </div>

        <div className="rounded-3xl border p-8 shadow-sm" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Fraunces, serif' }}>Welcome back</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FFF0F0', color: '#C0392B', border: '1px solid #F5C6CB' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your username"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:border-[var(--primary)]"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:border-[var(--primary)] pr-12"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-base text-white transition hover:opacity-90 disabled:opacity-60 shadow-md"
              style={{ background: 'var(--primary)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <span className="text-xs">Demo: </span>
            <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--muted)' }}>margaret / password123</code>
            <span className="text-xs mx-2">or</span>
            <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--muted)' }}>admin / admin123</code>
          </div>
        </div>

        <div className="text-center mt-6">
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Don't have an account? </span>
          <button
            onClick={onGoSignup}
            className="text-sm font-bold transition hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}
