import { useState } from 'react'
import { useAuth, type SignupData, type UserRole } from '../context/AuthContext'

type Props = { onGoLogin: () => void }

export default function SignUp({ onGoLogin }: Props) {
  const { signup } = useAuth()
  const [form, setForm] = useState<SignupData>({
    username: '',
    password: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    role: 'customer',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: keyof SignupData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password || !form.email) {
      setError('Username, password, and email are required.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const result = signup(form)
      if (!result.ok) setError(result.error ?? 'Sign up failed.')
      setLoading(false)
    }, 700)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:border-[var(--primary)]"
  const inputStyle = { background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-md"
            style={{ background: 'var(--primary)' }}
          >🥐</div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Join Frosted Corner</h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>Fresh treats, personalized for you</p>
        </div>

        <div className="rounded-3xl border p-8 shadow-sm" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Fraunces, serif' }}>Create your account</h2>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FFF0F0', color: '#C0392B', border: '1px solid #F5C6CB' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Username <span style={{ color: '#E74C3C' }}>*</span></label>
              <input type="text" value={form.username} onChange={set('username')} placeholder="choose a username" autoComplete="username" className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Password <span style={{ color: '#E74C3C' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="min. 8 characters"
                  autoComplete="new-password"
                  className={inputClass + ' pr-12'}
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded" style={{ color: 'var(--muted-foreground)' }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <svg width="13" height="13" fill="none" stroke="#4CAF50" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span className="text-xs" style={{ color: '#4CAF50' }}>Encrypted &amp; securely stored — never visible to staff</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Email <span style={{ color: '#E74C3C' }}>*</span></label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" autoComplete="email" className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Phone Number</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" autoComplete="tel" className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Date of Birth</label>
              <input type="date" value={form.dob} onChange={set('dob')} className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Delivery Address</label>
              <input type="text" value={form.address} onChange={set('address')} placeholder="123 Main St, City, State ZIP" autoComplete="street-address" className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Account Type</label>
              <select value={form.role} onChange={set('role') as React.ChangeEventHandler<HTMLSelectElement>} className={inputClass} style={inputStyle}>
                <option value="customer">Customer</option>
                <option value="admin">Admin / Franchise</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-base text-white transition hover:opacity-90 disabled:opacity-60 shadow-md mt-2"
              style={{ background: 'var(--primary)' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Already have an account? </span>
          <button onClick={onGoLogin} className="text-sm font-bold transition hover:underline" style={{ color: 'var(--primary)' }}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
