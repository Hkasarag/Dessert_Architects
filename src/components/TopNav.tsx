import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Props = {
  cartCount: number
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export default function TopNav({ cartCount, searchQuery, setSearchQuery }: Props) {
  const { user, logout } = useAuth()
  const [showAccount, setShowAccount] = useState(false)
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    setShowAccount(false)
    logout()
  }

  return (
    <header
      className="flex items-center gap-4 px-6 py-3 border-b sticky top-0 z-30"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex-1">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder={isAdmin ? 'Search ingredients & supplies…' : 'Search treats, flavors, occasions…'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none transition"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
              border: '1.5px solid var(--border)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold rounded px-1"
              style={{ color: 'var(--muted-foreground)' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {/* Account */}
      <div className="relative">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition hover:bg-[var(--muted)]"
          onClick={() => setShowAccount(v => !v)}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'var(--primary)' }}
          >
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--foreground)' }}>
            {user?.username}
          </span>
          {isAdmin && (
            <span
              className="hidden sm:inline-flex text-xs font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: '#E8F5FF', color: 'var(--primary)' }}
            >
              Admin
            </span>
          )}
        </button>

        {showAccount && (
          <div
            className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl border overflow-hidden z-50"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="font-semibold text-sm">{user?.username}</div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</div>
            </div>
            <button
              className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-[var(--muted)] transition"
              onClick={() => { navigate('/profile'); setShowAccount(false) }}
            >
              My Profile
            </button>
            <div className="border-t" style={{ borderColor: 'var(--border)' }} />
            <button
              className="w-full text-left px-4 py-2.5 text-sm font-medium transition hover:bg-red-50"
              style={{ color: '#C0392B' }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {!isAdmin && (
        <button
          className="relative p-2.5 rounded-xl transition hover:bg-[var(--muted)]"
          onClick={() => navigate('/cart')}
          aria-label="Cart"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--foreground)' }}>
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
              style={{ background: 'var(--secondary)' }}
            >
              {cartCount}
            </span>
          )}
        </button>
      )}
    </header>
  )
}
