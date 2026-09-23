import { useState } from 'react'

type SupplyItem = {
  id: number
  name: string
  category: string
  unit: string
  unitPrice: number
  minOrder: number
  qty: number
  image: string
}

const catalog: SupplyItem[] = [
  { id: 1, name: 'All-Purpose Flour (50 lb bag)', category: 'Dry Goods', unit: 'bag', unitPrice: 22.50, minOrder: 10, qty: 0, image: '🌾' },
  { id: 2, name: 'Granulated Sugar (50 lb bag)', category: 'Dry Goods', unit: 'bag', unitPrice: 28.00, minOrder: 5, qty: 0, image: '🍬' },
  { id: 3, name: 'Unsalted Butter (36 lb case)', category: 'Dairy', unit: 'case', unitPrice: 148.00, minOrder: 2, qty: 0, image: '🧈' },
  { id: 4, name: 'Cream Cheese (30 lb case)', category: 'Dairy', unit: 'case', unitPrice: 112.00, minOrder: 2, qty: 0, image: '🧀' },
  { id: 5, name: 'Large Eggs (15 dozen case)', category: 'Dairy', unit: 'case', unitPrice: 54.00, minOrder: 4, qty: 0, image: '🥚' },
  { id: 6, name: 'Whole Milk (4 gal case)', category: 'Dairy', unit: 'case', unitPrice: 22.00, minOrder: 10, qty: 0, image: '🥛' },
  { id: 7, name: 'Callebaut Chocolate 811 (5 kg)', category: 'Chocolate', unit: 'block', unitPrice: 38.50, minOrder: 4, qty: 0, image: '🍫' },
  { id: 8, name: 'Cocoa Powder, Dutch Process (5 lb)', category: 'Chocolate', unit: 'tin', unitPrice: 24.00, minOrder: 6, qty: 0, image: '☕' },
  { id: 9, name: 'Pure Vanilla Extract (1 gal)', category: 'Flavoring', unit: 'jug', unitPrice: 68.00, minOrder: 2, qty: 0, image: '🌿' },
  { id: 10, name: 'Almond Extract (1 qt)', category: 'Flavoring', unit: 'bottle', unitPrice: 18.00, minOrder: 4, qty: 0, image: '🌰' },
  { id: 11, name: 'Baking Powder (10 lb can)', category: 'Leavening', unit: 'can', unitPrice: 14.00, minOrder: 6, qty: 0, image: '🫙' },
  { id: 12, name: 'Baking Soda (12 lb bag)', category: 'Leavening', unit: 'bag', unitPrice: 9.50, minOrder: 8, qty: 0, image: '🫙' },
  { id: 13, name: 'Cake Boxes 10" (pack of 50)', category: 'Packaging', unit: 'pack', unitPrice: 42.00, minOrder: 4, qty: 0, image: '📦' },
  { id: 14, name: 'Bakery Tissue Paper (500 sheets)', category: 'Packaging', unit: 'ream', unitPrice: 16.00, minOrder: 6, qty: 0, image: '🗒️' },
  { id: 15, name: 'Parchment Paper Roll (1000 ft)', category: 'Packaging', unit: 'roll', unitPrice: 48.00, minOrder: 2, qty: 0, image: '📜' },
]

const categories = ['All', ...Array.from(new Set(catalog.map(i => i.category)))]

const recentOrders = [
  { id: 'BLK-0412', date: 'Sep 15, 2026', items: 8, total: 2840.00, status: 'Delivered' },
  { id: 'BLK-0399', date: 'Sep 1, 2026', items: 12, total: 4210.50, status: 'Delivered' },
  { id: 'BLK-0388', date: 'Aug 18, 2026', items: 6, total: 1680.00, status: 'Delivered' },
]

export default function AdminHome() {
  const [items, setItems] = useState<SupplyItem[]>(catalog)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const filtered = items.filter(i =>
    (activeCategory === 'All' || i.category === activeCategory) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const setQty = (id: number, qty: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i))

  const cart = items.filter(i => i.qty > 0)
  const total = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const totalItems = cart.reduce((s, i) => s + i.qty, 0)

  const handleSubmit = () => {
    if (cart.length === 0) return
    setSubmitted(true)
    setTimeout(() => {
      setItems(catalog.map(i => ({ ...i, qty: 0 })))
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Bulk Ingredient Ordering</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Order supplies directly from Frosted Corners HQ. Bulk pricing applied automatically.</p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: '#E8F5FF', color: 'var(--primary)' }}
        >
          🏭 Franchise Portal
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'This Month Spend', value: '$7,730', icon: '💰', note: 'vs $6,890 last month' },
          { label: 'Open Orders', value: '0', icon: '📋', note: 'All delivered' },
          { label: 'Saved vs Retail', value: '$1,240', icon: '✅', note: 'Bulk discount' },
          { label: 'Next HQ Cutoff', value: 'Oct 1', icon: '⏰', note: '9 days away' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className="font-bold text-xl">{k.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{k.label}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.note}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Catalog */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-3 py-1.5 rounded-xl font-semibold text-sm whitespace-nowrap transition"
                  style={{
                    background: activeCategory === cat ? 'var(--primary)' : 'var(--muted)',
                    color: activeCategory === cat ? 'white' : 'var(--muted-foreground)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search supplies…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 rounded-xl border text-sm outline-none flex-shrink-0"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', minWidth: 160 }}
            />
          </div>

          <div className="space-y-3">
            {filtered.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="text-3xl w-10 text-center flex-shrink-0">{item.image}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm leading-tight">{item.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Min order: {item.minOrder} {item.unit}s
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold">${item.unitPrice.toFixed(2)}</div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>per {item.unit}</div>
                </div>
                <div className="flex items-center gap-1 rounded-xl border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                  <button
                    className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-[var(--muted)] transition"
                    onClick={() => setQty(item.id, item.qty - 1)}
                  >−</button>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={e => setQty(item.id, parseInt(e.target.value) || 0)}
                    className="w-12 text-center font-semibold text-sm outline-none"
                    style={{ background: 'transparent' }}
                    min={0}
                  />
                  <button
                    className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-[var(--muted)] transition"
                    onClick={() => setQty(item.id, item.qty + 1)}
                  >+</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--muted)' }}>
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-semibold">No supplies match your search</p>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:w-72 flex-shrink-0 space-y-5">
          <div
            className="rounded-2xl border p-5 sticky top-24"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Order Summary</h3>
            {cart.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
                No items added yet. Set quantities above.
              </p>
            ) : (
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {cart.map(i => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2" style={{ maxWidth: 160 }}>{i.name.split(' (')[0]}</span>
                    <span className="font-semibold flex-shrink-0">{i.qty} × ${i.unitPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t pt-3 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>{totalItems} units</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>Bulk discount (12%)</span>
                <span className="font-semibold text-green-600">−${(total * 0.12).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total</span>
                <span>${(total * 0.88).toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={cart.length === 0}
              className="w-full mt-4 py-3 rounded-2xl font-bold text-sm text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ background: submitted ? '#4CAF50' : 'var(--primary)' }}
            >
              {submitted ? '✓ Order Submitted to HQ!' : 'Submit Bulk Order'}
            </button>
            {submitted && (
              <p className="text-xs text-center mt-2" style={{ color: '#4CAF50' }}>
                Confirmation email sent. Delivery in 2–3 business days.
              </p>
            )}
          </div>

          {/* Recent orders */}
          <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-base mb-3" style={{ fontFamily: 'Fraunces, serif' }}>Recent Bulk Orders</h3>
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold">{o.id}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{o.date} · {o.items} items</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${o.total.toLocaleString()}</div>
                    <span className="text-xs font-bold text-green-600">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Admin Chat */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="font-bold text-lg mb-3">Franchise Operations Assistant</h3>
        <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Ask about inventory forecasts, promotions, reorder suggestions, and simulated promotion outcomes.
        </p>
        <AdminChat />
      </div>
    </div>
  )
}

import { routeAdminIntent, executeAgentByIntent } from '../agents/router'

function AdminChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ id: number; role: 'admin' | 'assistant'; text: string; payload?: string }[]>([])

  const send = (text: string) => {
    if (!text.trim()) return
    const id = Date.now()
    setMessages(prev => [...prev, { id, role: 'admin', text }])
    setInput('')
    const route = routeAdminIntent(text)
    const result = executeAgentByIntent(route.intent, text, 'admin')
    setTimeout(() => {
      setMessages(prev => [...prev, { id: id + 1, role: 'assistant', text: route.rationale, payload: JSON.stringify(result, null, 2) }])
    }, 600)
  }

  return (
    <div className="space-y-3">
      <div className="w-full">
        {messages.map(m => (
          <div key={m.id} className="mb-2">
            <div className={`text-sm font-semibold ${m.role === 'admin' ? 'text-right' : ''}`}>{m.role === 'admin' ? 'You' : 'Franchise Assistant'}</div>
            <div className="rounded-xl p-3" style={{ background: m.role === 'admin' ? 'var(--muted)' : 'var(--card)' }}>
              <div className="text-sm whitespace-pre-wrap">{m.text}</div>
              {m.payload && (
                <pre className="mt-2 text-xs p-2 rounded" style={{ background: '#0b1220', color: '#e6eef8' }}>{m.payload}</pre>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} className="flex-1 px-3 py-2 rounded-xl border" />
        <button onClick={() => send(input)} className="px-4 py-2 rounded-xl text-white" style={{ background: 'var(--primary)' }}>Send</button>
      </div>
    </div>
  )
}
