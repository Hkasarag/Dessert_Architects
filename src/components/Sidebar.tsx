import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const HomeIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
)
const CartIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)
const ChartIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)
const ConciergeIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const SubIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)
const InventoryIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

export default function Sidebar() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150 ${
      isActive
        ? 'text-white shadow-md'
        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
    }`

  const activeStyle = { background: 'var(--primary)' }

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col py-6 px-4 gap-2 border-r"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            style={{ background: 'var(--primary)' }}
          >
            🥐
          </div>
          <div>
            <div className="font-bold text-lg leading-tight" style={{ fontFamily: 'Fraunces, serif', color: 'var(--foreground)' }}>
              Frosted Corner
            </div>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {isAdmin ? 'Admin Portal' : 'Dessert Shop'}
            </div>
          </div>
        </div>
      </div>

      {isAdmin ? (
        <>
          <NavLink to="/" end className={linkClass} style={({ isActive }) => isActive ? activeStyle : {}}>
            <HomeIcon /> Bulk Ordering
          </NavLink>
          <NavLink to="/inventory" className={linkClass} style={({ isActive }) => isActive ? activeStyle : {}}>
            <InventoryIcon /> Inventory
          </NavLink>
          <NavLink to="/analytics" className={linkClass} style={({ isActive }) => isActive ? activeStyle : {}}>
            <ChartIcon /> Business Analytics
          </NavLink>
          <NavLink to="/concierge" className={linkClass} style={({ isActive }) => isActive ? activeStyle : {}}>
            <ConciergeIcon /> Bakery Concierge
          </NavLink>
        </>
      ) : (
        <>
          <NavLink to="/" end className={linkClass} style={({ isActive }) => isActive ? activeStyle : {}}>
            <HomeIcon /> Home
          </NavLink>
          <NavLink to="/cart" className={linkClass} style={({ isActive }) => isActive ? activeStyle : {}}>
            <CartIcon /> My Cart
          </NavLink>
          <NavLink to="/concierge" className={linkClass} style={({ isActive }) => isActive ? activeStyle : {}}>
            <ConciergeIcon /> Bakery Concierge
          </NavLink>
          <NavLink to="/subscriptions" className={linkClass} style={({ isActive }) => isActive ? activeStyle : {}}>
            <SubIcon /> Subscriptions
          </NavLink>
        </>
      )}

      <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div
          className="rounded-xl p-3 text-sm"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
        >
          <div className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
            {isAdmin ? '🏭 Franchise Portal' : '✨ AI Personalized'}
          </div>
          <div className="text-xs leading-relaxed">
            {isAdmin
              ? 'Order supplies directly from HQ. Bulk pricing applied automatically.'
              : 'Your experience learns and improves with every order.'}
          </div>
        </div>
      </div>
    </aside>
  )
}
