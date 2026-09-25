import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CartItem } from '../App'
import { useAuth } from '../context/AuthContext'
import { isInSeason, menuProducts } from '../data/menuProducts'
import { featuredPromotions } from '../data/promotions'
import { LOYALTY } from '../data/loyalty'
import { bundleCartId, cartItemFromBundle, cartItemFromMenuProduct } from '../lib/cartItems'
import { fetchLoyaltyBalance } from '../lib/loyaltyApi'
import AdminProfile from './AdminProfile'

type AddToCart = (item: Omit<CartItem, 'quantity'>, quantity?: number) => void

type Props = {
  addToCart: AddToCart
}

type OrderItem = { productId: string; productName: string; quantity: number }

type ProfileOrder = {
  id: string
  date: string
  items: OrderItem[]
  total: number
}

type OrderRecord = {
  orderId?: string
  createdAt?: string
  total?: number
  items?: Array<{ productId?: string; productName?: string; quantity?: number }>
}

type ReorderStatus = {
  orderId: string
  addedUnits: number
  skipped: string[]
}

const formatHistoryDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const normalizeCustomerOrder = (order: OrderRecord): ProfileOrder => ({
  id: order.orderId || 'Order',
  date: formatHistoryDate(order.createdAt),
  items: (order.items || []).map(item => ({
    productId: String(item.productId ?? ''),
    productName: item.productName || 'Item',
    quantity: Number(item.quantity) || 0,
  })),
  total: Number(order.total || 0),
})

const displayName = (name: string) => name.replace(/[^\p{L}\p{N}\s'&-]/gu, '').trim()

/** Adds an old order's items to the cart at today's prices. Returns what was added and skipped. */
function reorderItems(order: ProfileOrder, addToCart: AddToCart): ReorderStatus {
  let addedUnits = 0
  const skipped: string[] = []

  for (const item of order.items) {
    if (item.quantity <= 0) continue
    const id = Number(item.productId)
    const product = menuProducts.find(p => p.id === id)
    if (product) {
      if (!isInSeason(product.season)) {
        skipped.push(`${displayName(product.name)} (out of season)`)
        continue
      }
      addToCart(cartItemFromMenuProduct(product), item.quantity)
      addedUnits += item.quantity
      continue
    }

    const bundle = featuredPromotions.find(p => bundleCartId(p) === id)
    if (bundle) {
      addToCart(cartItemFromBundle(bundle), item.quantity)
      addedUnits += item.quantity
      continue
    }

    skipped.push(id < 0
      ? `${displayName(item.productName)} (memberships aren't reordered)`
      : `${displayName(item.productName)} (no longer on the menu)`)
  }

  return { orderId: order.id, addedUnits, skipped }
}

function formatDob(dob: string) {
  if (!dob) return '—'
  try {
    const [y, m, d] = dob.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
  } catch {
    return dob
  }
}

export default function Profile({ addToCart }: Props) {
  const { user } = useAuth()
  return user?.role === 'admin' ? <AdminProfile /> : <CustomerProfile addToCart={addToCart} />
}

function CustomerProfile({ addToCart }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orderHistory, setOrderHistory] = useState<ProfileOrder[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null)
  const [reorderStatus, setReorderStatus] = useState<ReorderStatus | null>(null)

  useEffect(() => {
    if (!user?.username) return
    const controller = new AbortController()
    fetchLoyaltyBalance(user.username, controller.signal)
      .then(summary => setLoyaltyBalance(summary.balance))
      .catch(() => { /* the Rewards card shows a dash when points can't load */ })
    return () => controller.abort()
  }, [user?.username])

  useEffect(() => {
    if (!user) return

    const controller = new AbortController()
    const endpoint = `http://localhost:5050/orders?customerId=${encodeURIComponent(user.username)}&limit=3`

    const loadHistory = async () => {
      setHistoryLoading(true)
      setHistoryError('')

      try {
        const response = await fetch(endpoint, { signal: controller.signal })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to load order history.')

        setOrderHistory((result as OrderRecord[]).map(normalizeCustomerOrder).slice(0, 3))
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setHistoryError(error instanceof Error ? error.message : 'Unable to load order history.')
      } finally {
        if (!controller.signal.aborted) setHistoryLoading(false)
      }
    }

    loadHistory()
    return () => controller.abort()
  }, [user])

  const handleLogout = () => {
    logout()
  }

  const tasteGroups = [
    { title: 'FAVORITE BAKED GOODS', tags: user?.tasteProfile.favoriteBakedGoods ?? [], style: { background: 'var(--muted)', color: 'var(--foreground)' } },
    { title: 'DIETARY PREFERENCES', tags: user?.tasteProfile.dietaryPreferences ?? [], style: { background: '#FFF0E0', color: '#C47A00' } },
    { title: 'RECENT INTERESTS', tags: user?.tasteProfile.recentInterests ?? [], style: { background: 'var(--muted)', color: 'var(--foreground)' } },
  ]

  const displayName = user?.username ?? 'User'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>My Profile</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-red-50"
          style={{ borderColor: '#E74C3C44', color: '#C0392B' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Info */}
        <section className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Account Information</h2>
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'var(--primary)' }}
            >
              {initial}
            </div>
            <div>
              <div className="font-bold text-lg">{displayName}</div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{user?.email || '—'}</div>
              <div
                className="inline-flex items-center gap-1 mt-1 text-xs font-bold px-2.5 py-1 rounded-full"
                style={user?.role === 'admin'
                  ? { background: '#E8F5FF', color: 'var(--primary)' }
                  : { background: '#FFF4E0', color: '#C47A00' }
                }
              >
                {user?.role === 'admin' ? '🏭 Administrator' : '⭐ Gold Member'}
              </div>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            {[
              ['Username', user?.username || '—'],
              ['Email', user?.email || '—'],
              ['Phone', user?.phone || '—'],
              ['Date of Birth', formatDob(user?.dob ?? '')],
              ['Address', user?.address || '—'],
              ['Member Since', user?.memberSince || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                <span className="font-semibold text-right max-w-[200px] truncate" title={v}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <svg width="13" height="13" fill="none" stroke="#4CAF50" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="text-xs" style={{ color: '#4CAF50' }}>Password encrypted &amp; securely stored</span>
          </div>
        </section>

        {/* Taste Profile */}
        <section className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Fraunces, serif' }}>✨ Taste Profile</h2>
          <div className="space-y-4">
            {tasteGroups.map(group => (
              <div key={group.title}>
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>{group.title}</div>
                {group.tags.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Nothing added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map(t => (
                      <span key={t} className="px-3 py-1 rounded-full text-sm font-semibold" style={group.style}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="mt-5 text-sm font-semibold" style={{ color: 'var(--primary)' }}>Update Taste Profile →</button>
        </section>

        {/* Rewards */}
        <section className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Fraunces, serif' }}>🏆 Rewards</h2>
          <div
            className="rounded-2xl p-5 mb-5"
            style={{ background: 'linear-gradient(135deg, #6BBFD8 0%, #4AA8C8 100%)', color: 'white' }}
          >
            <div className="text-3xl font-bold mb-1">{loyaltyBalance === null ? '—' : loyaltyBalance.toLocaleString('en-US')}</div>
            <div className="text-sm opacity-85">Loyalty Points</div>
            <div className="mt-3 text-sm opacity-85">
              = ${((loyaltyBalance ?? 0) * LOYALTY.pointValue).toFixed(2)} in bakery credit
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[['Total Savings', '$48.60'], ['Treats Ordered', '87 items'], ['Consecutive Weeks', '14 weeks']].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Active Subscription */}
        <section className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Fraunces, serif' }}>📦 Subscriptions</h2>
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: '#E8F5FF', borderLeft: '4px solid var(--primary)' }}
          >
            <div className="font-bold">Family Favorites Plan</div>
            <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Weekly delivery · 8 treats/week</div>
            <div className="text-sm mt-2">Renews <strong>Oct 1, 2026</strong></div>
          </div>
          <div className="text-sm space-y-1.5" style={{ color: 'var(--muted-foreground)' }}>
            <div>✓ 15% discount on all orders</div>
            <div>✓ Early access to seasonal items</div>
            <div>✓ Free delivery every week</div>
          </div>
          <button
            className="mt-5 text-sm font-semibold"
            style={{ color: 'var(--primary)' }}
            onClick={() => navigate('/subscriptions')}
          >
            Manage Subscription →
          </button>
        </section>
      </div>

      {/* Order History */}
      <section className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Fraunces, serif' }}>📋 Order History</h2>
        {historyLoading && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading recent orders…</p>}
        {historyError && <p className="text-sm text-red-600">{historyError}</p>}
        {!historyLoading && !historyError && orderHistory.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No recent orders found.</p>
        )}
        {!historyLoading && !historyError && <div className="space-y-4">
          {orderHistory.map(order => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
            >
              <div>
                <div className="font-bold text-sm">{order.id}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{order.date}</div>
                <div className="text-sm mt-1">{order.items.map(item => `${item.productName} ×${item.quantity}`).join(' · ')}</div>
                {reorderStatus?.orderId === order.id && (
                  <div className="text-xs mt-2" role="status">
                    {reorderStatus.addedUnits > 0 ? (
                      <span className="font-semibold text-green-700">
                        ✓ Added {reorderStatus.addedUnits} item{reorderStatus.addedUnits === 1 ? '' : 's'} to your cart.{' '}
                        <button className="underline" style={{ color: 'var(--primary)' }} onClick={() => navigate('/cart')}>View cart</button>
                      </span>
                    ) : (
                      <span className="font-semibold text-red-600">Nothing from this order could be added.</span>
                    )}
                    {reorderStatus.skipped.length > 0 && (
                      <span className="block mt-1" style={{ color: 'var(--muted-foreground)' }}>Skipped: {reorderStatus.skipped.join(', ')}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold">${order.total.toFixed(2)}</div>
                <button
                  className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                  style={{ background: 'var(--primary)' }}
                  onClick={() => setReorderStatus(reorderItems(order, addToCart))}
                >
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>}
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-bold mb-3" style={{ color: '#C0392B' }}>Account Actions</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border-2 transition hover:bg-red-50"
          style={{ borderColor: '#E74C3C', color: '#C0392B' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out of Frosted Corners
        </button>
      </section>
    </div>
  )
}
