import { useState } from 'react'
import { useChat } from '../context/ChatContext'

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
  { id: 1, name: "Active Dry Yeast (2 lb pack)", category: "Leavening", unit: "pack", unitPrice: 19.84, minOrder: 1, qty: 0, image: "🧁" },
  { id: 2, name: "All Purpose Flour (50 lb bag)", category: "Dry Goods", unit: "bag", unitPrice: 29.00, minOrder: 2, qty: 0, image: "🌾" },
  { id: 3, name: "Almond Extract (16 oz container)", category: "Flavoring", unit: "container", unitPrice: 60.00, minOrder: 1, qty: 0, image: "🌿" },
  { id: 4, name: "Almond Milk (6 gallon case)", category: "Dairy Alternatives", unit: "case", unitPrice: 19.50, minOrder: 1, qty: 0, image: "🌱" },
  { id: 5, name: "Baking Powder (10 lb can)", category: "Baking Essentials", unit: "can", unitPrice: 139.20, minOrder: 1, qty: 0, image: "🥣" },
  { id: 6, name: "Baking Soda (12 lb bag)", category: "Baking Essentials", unit: "bag", unitPrice: 188.16, minOrder: 1, qty: 0, image: "🥣" },
  { id: 7, name: "Bananas (40 lb case)", category: "Fruit & Produce", unit: "case", unitPrice: 27.20, minOrder: 1, qty: 0, image: "🍓" },
  { id: 8, name: "Blueberries (10 lb case)", category: "Fruit & Produce", unit: "case", unitPrice: 45.30, minOrder: 1, qty: 0, image: "🍓" },
  { id: 9, name: "Bread Flour (50 lb bag)", category: "Dry Goods", unit: "bag", unitPrice: 36.00, minOrder: 2, qty: 0, image: "🌾" },
  { id: 10, name: "Brown Sugar (25 lb bag)", category: "Sweeteners", unit: "bag", unitPrice: 49.38, minOrder: 2, qty: 0, image: "🍯" },
  { id: 11, name: "Butter (36 lb case)", category: "Dairy", unit: "case", unitPrice: 178.56, minOrder: 2, qty: 0, image: "🥛" },
  { id: 12, name: "Buttercream Frosting (10 lb case)", category: "Dairy", unit: "case", unitPrice: 45.90, minOrder: 1, qty: 0, image: "🥛" },
  { id: 13, name: "Cake Flour (50 lb bag)", category: "Dry Goods", unit: "bag", unitPrice: 108.00, minOrder: 2, qty: 0, image: "🌾" },
  { id: 14, name: "Caramel Sauce (4 gallon case)", category: "Sweeteners", unit: "case", unitPrice: 39.04, minOrder: 1, qty: 0, image: "🍯" },
  { id: 15, name: "Carrots (10 lb case)", category: "Fruit & Produce", unit: "case", unitPrice: 16.60, minOrder: 1, qty: 0, image: "🍓" },
  { id: 16, name: "Chocolate Chips (10 lb case)", category: "Chocolate", unit: "case", unitPrice: 47.25, minOrder: 1, qty: 0, image: "🍫" },
  { id: 17, name: "Chocolate Chunks (10 lb case)", category: "Chocolate", unit: "case", unitPrice: 47.00, minOrder: 1, qty: 0, image: "🍫" },
  { id: 18, name: "Chocolate Frosting (10 lb case)", category: "Dairy", unit: "case", unitPrice: 47.30, minOrder: 1, qty: 0, image: "🥛" },
  { id: 19, name: "Cinnamon (5 lb container)", category: "Spices", unit: "container", unitPrice: 77.60, minOrder: 1, qty: 0, image: "🫙" },
  { id: 20, name: "Cocoa Powder (10 lb case)", category: "Chocolate", unit: "case", unitPrice: 46.50, minOrder: 1, qty: 0, image: "🍫" },
  { id: 21, name: "Coconut Extract (16 oz container)", category: "Flavoring", unit: "container", unitPrice: 57.12, minOrder: 1, qty: 0, image: "🌿" },
  { id: 22, name: "Coconut Oil (35 lb pail)", category: "Fats & Oils", unit: "pail", unitPrice: 82.25, minOrder: 1, qty: 0, image: "🥥" },
  { id: 23, name: "Coffee (4 gallon case)", category: "Beverage", unit: "case", unitPrice: 31.60, minOrder: 1, qty: 0, image: "☕" },
  { id: 24, name: "Cookie Crumbs (10 lb case)", category: "Baking Essentials", unit: "case", unitPrice: 19.10, minOrder: 1, qty: 0, image: "🥣" },
  { id: 25, name: "Cream Cheese (10 lb case)", category: "Dairy", unit: "case", unitPrice: 45.60, minOrder: 1, qty: 0, image: "🥛" },
  { id: 26, name: "Cream Cheese Frosting (10 lb case)", category: "Dairy", unit: "case", unitPrice: 42.10, minOrder: 1, qty: 0, image: "🥛" },
  { id: 27, name: "Cream of Tartar (5 lb container)", category: "Baking Essentials", unit: "container", unitPrice: 64.80, minOrder: 1, qty: 0, image: "🥣" },
  { id: 28, name: "Eggs (15 dozen case)", category: "Dairy", unit: "case", unitPrice: 52.20, minOrder: 2, qty: 0, image: "🥛" },
  { id: 29, name: "Espresso Powder (16 oz container)", category: "Beverage", unit: "container", unitPrice: 13.60, minOrder: 1, qty: 0, image: "☕" },
  { id: 30, name: "Flour (50 lb bag)", category: "Dry Goods", unit: "bag", unitPrice: 29.00, minOrder: 2, qty: 0, image: "🌾" },
  { id: 31, name: "Fudge Chunks (10 lb case)", category: "Chocolate", unit: "case", unitPrice: 42.10, minOrder: 1, qty: 0, image: "🍫" },
  { id: 32, name: "Ginger (16 oz container)", category: "Spices", unit: "container", unitPrice: 14.56, minOrder: 1, qty: 0, image: "🫙" },
  { id: 33, name: "Graham Crackers (10 lb case)", category: "Baking Essentials", unit: "case", unitPrice: 21.60, minOrder: 1, qty: 0, image: "🥣" },
  { id: 34, name: "Granulated Sugar (50 lb bag)", category: "Sweeteners", unit: "bag", unitPrice: 99.50, minOrder: 2, qty: 0, image: "🍯" },
  { id: 35, name: "Lemon Juice (4 gallon case)", category: "Fruit & Produce", unit: "case", unitPrice: 31.48, minOrder: 1, qty: 0, image: "🍓" },
  { id: 36, name: "Lemon Zest (10 lb case)", category: "Fruit & Produce", unit: "case", unitPrice: 20.50, minOrder: 1, qty: 0, image: "🍓" },
  { id: 37, name: "Marshmallows (10 lb case)", category: "Baking Essentials", unit: "case", unitPrice: 17.40, minOrder: 1, qty: 0, image: "🥣" },
  { id: 38, name: "Mascarpone Cheese (10 lb case)", category: "Dairy", unit: "case", unitPrice: 54.00, minOrder: 1, qty: 0, image: "🥛" },
  { id: 39, name: "Matcha Powder (16 oz container)", category: "Flavoring", unit: "container", unitPrice: 62.40, minOrder: 1, qty: 0, image: "🌿" },
  { id: 40, name: "Mint Extract (16 oz container)", category: "Flavoring", unit: "container", unitPrice: 48.32, minOrder: 1, qty: 0, image: "🌿" },
  { id: 41, name: "Molasses (4 gallon case)", category: "Sweeteners", unit: "case", unitPrice: 39.40, minOrder: 1, qty: 0, image: "🍯" },
  { id: 42, name: "Nutmeg (16 oz container)", category: "Spices", unit: "container", unitPrice: 12.48, minOrder: 1, qty: 0, image: "🫙" },
  { id: 43, name: "Peach Filling (10 lb case)", category: "Fruit & Produce", unit: "case", unitPrice: 37.00, minOrder: 1, qty: 0, image: "🍓" },
  { id: 44, name: "Peanut Butter (10 lb case)", category: "Nuts", unit: "case", unitPrice: 69.00, minOrder: 1, qty: 0, image: "🌰" },
  { id: 45, name: "Pecans (10 lb case)", category: "Nuts", unit: "case", unitPrice: 54.90, minOrder: 1, qty: 0, image: "🌰" },
  { id: 46, name: "Peppermint Extract (16 oz container)", category: "Flavoring", unit: "container", unitPrice: 52.00, minOrder: 1, qty: 0, image: "🌿" },
  { id: 47, name: "Pretzel Pieces (10 lb case)", category: "Baking Essentials", unit: "case", unitPrice: 21.50, minOrder: 1, qty: 0, image: "🥣" },
  { id: 48, name: "Pumpkin Puree (10 lb case)", category: "Fruit & Produce", unit: "case", unitPrice: 20.25, minOrder: 1, qty: 0, image: "🍓" },
  { id: 49, name: "Red Food Coloring (16 oz container)", category: "Flavoring", unit: "container", unitPrice: 14.72, minOrder: 1, qty: 0, image: "🌿" },
  { id: 50, name: "Rolled Oats (10 lb case)", category: "Dry Goods", unit: "case", unitPrice: 20.40, minOrder: 1, qty: 0, image: "🌾" },
  { id: 51, name: "Salt (25 lb bag)", category: "Baking Essentials", unit: "bag", unitPrice: 400.00, minOrder: 1, qty: 0, image: "🥣" },
  { id: 52, name: "Strawberries (10 lb case)", category: "Fruit & Produce", unit: "case", unitPrice: 45.55, minOrder: 1, qty: 0, image: "🍓" },
  { id: 53, name: "Ube Extract (16 oz container)", category: "Flavoring", unit: "container", unitPrice: 55.20, minOrder: 1, qty: 0, image: "🌿" },
  { id: 54, name: "Ube Powder (16 oz container)", category: "Flavoring", unit: "container", unitPrice: 54.08, minOrder: 1, qty: 0, image: "🌿" },
  { id: 55, name: "Vanilla Extract (1 gallon jug)", category: "Flavoring", unit: "jug", unitPrice: 464.64, minOrder: 1, qty: 0, image: "🌿" },
  { id: 56, name: "Vanilla Frosting (10 lb case)", category: "Dairy", unit: "case", unitPrice: 44.60, minOrder: 1, qty: 0, image: "🥛" },
  { id: 57, name: "Walnuts (10 lb case)", category: "Nuts", unit: "case", unitPrice: 67.00, minOrder: 1, qty: 0, image: "🌰" },
  { id: 58, name: "White Chocolate Chips (10 lb case)", category: "Chocolate", unit: "case", unitPrice: 41.60, minOrder: 1, qty: 0, image: "🍫" },
  { id: 59, name: "Whole Milk (4 gallon case)", category: "Dairy", unit: "case", unitPrice: 38.24, minOrder: 2, qty: 0, image: "🥛" },
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
  const [checkoutError, setCheckoutError] = useState('')

  const filtered = items.filter(i =>
    (activeCategory === 'All' || i.category === activeCategory) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const setQty = (id: number, qty: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
  const cart = items.filter(i => i.qty > 0)
  const total = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const totalItems = cart.reduce((s, i) => s + i.qty, 0)
  const submitOrder = async () => {
    const cartItems = items.filter(item => item.qty > 0)
    if (cartItems.length === 0) return

    setCheckoutError('')
    setSubmitted(false)

    const inventory = {
      inventoryTransactionId: '',
      locationId: 'ATL001',
      transactionDate: new Date().toISOString(),
      transactionType: 'Purchase',
      totalCost: total,
      lineItems: cartItems.map(item => ({
        ingredientId: `ING-${String(item.id).padStart(3, '0')}`,
        ingredientName: item.name.split(' (')[0].toLowerCase().replace(/\s+/g, '_'),
        category: item.category,
        quantity: item.qty,
        unitOfMeasure: item.unit,
        unitCost: item.unitPrice,
        extendedCost: item.qty * item.unitPrice,
        lotNumber: null,
        expirationDate: null,
        storageLocation: item.category === 'Dairy' ? 'Cold Storage' : 'Dry Storage',
      })),
      createdAt: '',
    }

    try {
      const response = await fetch('http://localhost:5050/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventory),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Unable to create the inventory transaction.')
      }

      setItems(catalog.map(item => ({ ...item, qty: 0 })))
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to create the inventory transaction.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Bulk Ingredient Ordering</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Order supplies directly from Crumb & Joy HQ. Bulk pricing applied automatically.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#E8F5FF', color: 'var(--primary)' }}>🏭 Franchise Portal</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'This Month Spend', value: '$7,730', icon: '💰', note: 'vs $6,890 last month' },
          { label: 'Open Orders', value: '0', icon: '📋', note: 'All delivered' },
          { label: 'Saved vs Retail', value: '$1,240', icon: '✅', note: 'Bulk discount' },
          { label: 'Next HQ Cutoff', value: 'Oct 1', icon: '⏰', note: '9 days away' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="text-2xl mb-1">{k.icon}</div><div className="font-bold text-xl">{k.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{k.label}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.note}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
              {categories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className="px-3 py-1.5 rounded-xl font-semibold text-sm whitespace-nowrap transition" style={{ background: activeCategory === cat ? 'var(--primary)' : 'var(--muted)', color: activeCategory === cat ? 'white' : 'var(--muted-foreground)' }}>{cat}</button>)}
            </div>
            <input type="text" placeholder="Search supplies…" value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 rounded-xl border text-sm outline-none flex-shrink-0" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', minWidth: 160 }} />
          </div>
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="text-3xl w-10 text-center flex-shrink-0">{item.image}</div>
                <div className="flex-1 min-w-0"><div className="font-bold text-sm leading-tight">{item.name}</div><div className="flex items-center gap-2 mt-0.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{item.category}</span><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Min order: {item.minOrder} {item.unit}s</span></div></div>
                <div className="text-right flex-shrink-0"><div className="font-bold">${item.unitPrice.toFixed(2)}</div><div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>per {item.unit}</div></div>
                <div className="flex items-center gap-1 rounded-xl border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                  <button className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-[var(--muted)] transition" onClick={() => setQty(item.id, item.qty - 1)}>−</button>
                  <input type="number" value={item.qty} onChange={e => setQty(item.id, parseInt(e.target.value) || 0)} className="w-12 text-center font-semibold text-sm outline-none" style={{ background: 'transparent' }} min={0} />
                  <button className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-[var(--muted)] transition" onClick={() => setQty(item.id, item.qty + 1)}>+</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--muted)' }}><div className="text-4xl mb-3">🔍</div><p className="font-semibold">No supplies match your search</p></div>}
          </div>
        </div>
        <div className="lg:w-72 flex-shrink-0 space-y-5">
          <div className="rounded-2xl border p-5 sticky top-24" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Order Summary</h3>
            {cart.length === 0 ? <p className="text-sm py-4 text-center" style={{ color: 'var(--muted-foreground)' }}>No items added yet. Set quantities above.</p> : <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">{cart.map(i => <div key={i.id} className="flex justify-between text-sm"><span className="truncate mr-2" style={{ maxWidth: 160 }}>{i.name.split(' (')[0]}</span><span className="font-semibold flex-shrink-0">{i.qty} × ${i.unitPrice.toFixed(2)}</span></div>)}</div>}
            <div className="border-t pt-3 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--muted-foreground)' }}>{totalItems} units</span><span className="font-semibold">${total.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--muted-foreground)' }}>Bulk discount (12%)</span><span className="font-semibold text-green-600">−${(total * 0.12).toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2"><span>Total</span><span>${(total * 0.88).toFixed(2)}</span></div>
            </div>
            <button onClick={submitOrder} disabled={cart.length === 0 || submitted} className="w-full mt-4 py-3 rounded-2xl font-bold text-sm text-white transition hover:opacity-90 disabled:opacity-40" style={{ background: submitted ? '#4CAF50' : 'var(--primary)' }}>{submitted ? '✓ Order Submitted to HQ!' : 'Checkout'}</button>
            {checkoutError && <p className="text-xs text-center mt-2 text-red-600">{checkoutError}</p>}
            {submitted && <p className="text-xs text-center mt-2" style={{ color: '#4CAF50' }}>Confirmation email sent. Delivery in 2–3 business days.</p>}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-base mb-3" style={{ fontFamily: 'Fraunces, serif' }}>Recent Bulk Orders</h3>
            <div className="space-y-3">{recentOrders.map(o => <div key={o.id} className="flex items-center justify-between text-sm"><div><div className="font-semibold">{o.id}</div><div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{o.date} · {o.items} items</div></div><div className="text-right"><div className="font-bold">${o.total.toLocaleString()}</div><span className="text-xs font-bold text-green-600">{o.status}</span></div></div>)}</div>
          </div>
        </div>
      </div>
      {/* Admin Chat */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="font-bold text-lg mb-3">Franchise Operations Assistant</h3>
        <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Ask for next month's sales forecast, reorder suggestions, promotions, and simulated promotion outcomes.
        </p>
        <AdminChat />
      </div>
    </div>
  )
}

function AdminChat() {
  const [input, setInput] = useState('')
  // The conversation lives in ChatProvider, so it survives leaving and returning to this page.
  const { messages, pending: thinking, send: sendToChat } = useChat('franchise')

  const send = (text: string) => {
    if (!text.trim() || thinking) return
    setInput('')
    sendToChat(text, { role: 'admin' })
  }

  return (
    <div className="space-y-3">
      <div className="w-full">
        {messages.map(m => (
          <div key={m.id} className="mb-2">
            <div className={`text-sm font-semibold ${m.role === 'user' ? 'text-right' : ''}`}>
              {m.role === 'user' ? 'You' : 'Franchise Assistant'}
              {m.agentLabel && <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}> · {m.agentLabel}</span>}
            </div>
            <div className="rounded-xl p-3" style={{ background: m.role === 'user' ? 'var(--muted)' : m.isError ? '#FFF0F0' : 'var(--card)' }}>
              <div className="text-sm whitespace-pre-wrap" style={m.isError ? { color: '#C0392B' } : undefined}>{m.text}</div>
            </div>
          </div>
        ))}
        {thinking && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Franchise Assistant is thinking…</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="e.g. Give me next month's forecast"
          aria-label="Message the franchise assistant"
          className="flex-1 px-3 py-2 rounded-xl border"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || thinking}
          className="px-4 py-2 rounded-xl text-white disabled:opacity-40"
          style={{ background: 'var(--primary)' }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
