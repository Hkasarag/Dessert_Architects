import { useState } from 'react'

type InventoryItem = {
  id: number
  name: string
  category: string
  unit: string
  currentStock: number
  parLevel: number
  maxLevel: number
  unitCost: number
  supplier: string
  lastRestocked: string
  expiryDays: number | null
}

const initialInventory: InventoryItem[] = [
  { id: 1, name: 'All-Purpose Flour', category: 'Dry Goods', unit: 'lbs', currentStock: 42, parLevel: 50, maxLevel: 200, unitCost: 0.45, supplier: 'HQ Wholesale', lastRestocked: 'Sep 12, 2026', expiryDays: null },
  { id: 2, name: 'Granulated Sugar', category: 'Dry Goods', unit: 'lbs', currentStock: 68, parLevel: 40, maxLevel: 150, unitCost: 0.56, supplier: 'HQ Wholesale', lastRestocked: 'Sep 12, 2026', expiryDays: null },
  { id: 3, name: 'Unsalted Butter', category: 'Dairy', unit: 'lbs', currentStock: 18, parLevel: 20, maxLevel: 72, unitCost: 4.11, supplier: 'HQ Wholesale', lastRestocked: 'Sep 14, 2026', expiryDays: 12 },
  { id: 4, name: 'Cream Cheese', category: 'Dairy', unit: 'lbs', currentStock: 4, parLevel: 15, maxLevel: 30, unitCost: 3.73, supplier: 'HQ Wholesale', lastRestocked: 'Sep 10, 2026', expiryDays: 5 },
  { id: 5, name: 'Large Eggs', category: 'Dairy', unit: 'dozen', currentStock: 24, parLevel: 20, maxLevel: 60, unitCost: 3.60, supplier: 'HQ Wholesale', lastRestocked: 'Sep 18, 2026', expiryDays: 18 },
  { id: 6, name: 'Whole Milk', category: 'Dairy', unit: 'gallons', currentStock: 8, parLevel: 8, maxLevel: 20, unitCost: 5.50, supplier: 'HQ Wholesale', lastRestocked: 'Sep 19, 2026', expiryDays: 7 },
  { id: 7, name: 'Callebaut Chocolate 811', category: 'Chocolate', unit: 'kg', currentStock: 18, parLevel: 10, maxLevel: 40, unitCost: 7.70, supplier: 'HQ Wholesale', lastRestocked: 'Sep 8, 2026', expiryDays: null },
  { id: 8, name: 'Cocoa Powder (Dutch)', category: 'Chocolate', unit: 'lbs', currentStock: 9, parLevel: 8, maxLevel: 25, unitCost: 4.80, supplier: 'HQ Wholesale', lastRestocked: 'Sep 8, 2026', expiryDays: null },
  { id: 9, name: 'Pure Vanilla Extract', category: 'Flavoring', unit: 'oz', currentStock: 38, parLevel: 32, maxLevel: 128, unitCost: 0.53, supplier: 'HQ Wholesale', lastRestocked: 'Sep 5, 2026', expiryDays: null },
  { id: 10, name: 'Baking Powder', category: 'Leavening', unit: 'lbs', currentStock: 6, parLevel: 5, maxLevel: 20, unitCost: 1.40, supplier: 'HQ Wholesale', lastRestocked: 'Sep 3, 2026', expiryDays: null },
  { id: 11, name: 'Cake Boxes 10"', category: 'Packaging', unit: 'units', currentStock: 85, parLevel: 50, maxLevel: 200, unitCost: 0.84, supplier: 'HQ Wholesale', lastRestocked: 'Sep 1, 2026', expiryDays: null },
  { id: 12, name: 'Parchment Paper Roll', category: 'Packaging', unit: 'ft', currentStock: 320, parLevel: 200, maxLevel: 1000, unitCost: 0.048, supplier: 'HQ Wholesale', lastRestocked: 'Aug 28, 2026', expiryDays: null },
]

function stockStatus(item: InventoryItem) {
  const ratio = item.currentStock / item.parLevel
  if (ratio <= 0.3) return { label: 'Critical', color: '#C0392B', bg: '#FFF0F0' }
  if (ratio < 1) return { label: 'Low', color: '#D4870A', bg: '#FFF8E0' }
  return { label: 'Good', color: '#27AE60', bg: '#F0FFF4' }
}

function StockBar({ item }: { item: InventoryItem }) {
  const pct = Math.min(100, (item.currentStock / item.maxLevel) * 100)
  const status = stockStatus(item)
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: status.color }} />
    </div>
  )
}

const categories = ['All', ...Array.from(new Set(initialInventory.map(i => i.category)))]

export default function Inventory() {
  const [inventory, setInventory] = useState(initialInventory)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editVal, setEditVal] = useState('')
  const [filterLow, setFilterLow] = useState(false)

  const filtered = inventory.filter(i =>
    (activeCategory === 'All' || i.category === activeCategory) &&
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterLow || stockStatus(i).label !== 'Good')
  )

  const saveEdit = (id: number) => {
    const val = parseFloat(editVal)
    if (!isNaN(val) && val >= 0) {
      setInventory(prev => prev.map(i => i.id === id ? { ...i, currentStock: val, lastRestocked: 'Sep 22, 2026' } : i))
    }
    setEditId(null)
  }

  const criticalCount = inventory.filter(i => stockStatus(i).label === 'Critical').length
  const lowCount = inventory.filter(i => stockStatus(i).label === 'Low').length
  const totalValue = inventory.reduce((s, i) => s + i.currentStock * i.unitCost, 0)

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Inventory Management</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Live stock levels · Last updated Sep 22, 2026 at 7:00 AM</p>
        </div>
        <button
          className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
          style={{ background: 'var(--primary)' }}
          onClick={() => window.location.href = '/'}
        >
          + New Bulk Order
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-2xl mb-1">📦</div>
          <div className="font-bold text-xl">{inventory.length}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Total SKUs tracked</div>
        </div>
        <div className="rounded-2xl border p-5" style={{ background: '#FFF0F0', borderColor: '#F5C6CB' }}>
          <div className="text-2xl mb-1">🚨</div>
          <div className="font-bold text-xl" style={{ color: '#C0392B' }}>{criticalCount}</div>
          <div className="text-xs mt-0.5" style={{ color: '#C0392B' }}>Critical stock items</div>
        </div>
        <div className="rounded-2xl border p-5" style={{ background: '#FFF8E0', borderColor: '#F4D03F44' }}>
          <div className="text-2xl mb-1">⚠️</div>
          <div className="font-bold text-xl" style={{ color: '#D4870A' }}>{lowCount}</div>
          <div className="text-xs mt-0.5" style={{ color: '#D4870A' }}>Low stock items</div>
        </div>
        <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-2xl mb-1">💰</div>
          <div className="font-bold text-xl">${totalValue.toFixed(0)}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Total inventory value</div>
        </div>
      </div>

      {/* Alerts */}
      {(criticalCount > 0 || lowCount > 0) && (
        <div className="rounded-2xl border p-4 space-y-2" style={{ background: '#FFF8E0', borderColor: '#F4A36144' }}>
          <div className="font-bold flex items-center gap-2">⚠️ Stock Alerts</div>
          {inventory.filter(i => stockStatus(i).label !== 'Good').map(i => {
            const s = stockStatus(i)
            return (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span>
                  <strong>{i.name}</strong> — {i.currentStock} {i.unit} remaining
                  {i.expiryDays && <span style={{ color: s.color }}> · Expires in {i.expiryDays} days</span>}
                </span>
                <span className="font-bold px-2 py-0.5 rounded-full text-xs" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
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
        <div className="flex gap-3 ml-auto">
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={filterLow}
              onChange={e => setFilterLow(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Show alerts only
          </label>
          <input
            type="text"
            placeholder="Search inventory…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm outline-none"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', width: 180 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--muted)' }}>
              <tr>
                {['Ingredient', 'Category', 'Stock', 'Par Level', 'Status', 'Unit Cost', 'Value', 'Last Restocked', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-xs" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const status = stockStatus(item)
                const isEditing = editId === item.id
                return (
                  <tr
                    key={item.id}
                    style={{ borderTop: idx > 0 ? '1px solid var(--border)' : undefined }}
                  >
                    <td className="py-3.5 px-4 font-semibold">{item.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 min-w-[140px]">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(item.id); if (e.key === 'Escape') setEditId(null) }}
                            className="w-20 px-2 py-1 rounded-lg border text-sm outline-none"
                            style={{ borderColor: 'var(--primary)' }}
                            autoFocus
                          />
                          <button onClick={() => saveEdit(item.id)} className="text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ background: '#4CAF50' }}>✓</button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold mb-1">{item.currentStock} {item.unit}</div>
                          <StockBar item={item} />
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4" style={{ color: 'var(--muted-foreground)' }}>{item.parLevel} {item.unit}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                      {item.expiryDays && item.expiryDays <= 7 && (
                        <div className="text-xs mt-0.5" style={{ color: status.color }}>⏱ {item.expiryDays}d expiry</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">${item.unitCost.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-semibold">${(item.currentStock * item.unitCost).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.lastRestocked}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditId(item.id); setEditVal(String(item.currentStock)) }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border transition hover:bg-[var(--muted)]"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          Edit
                        </button>
                        {status.label !== 'Good' && (
                          <button
                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition hover:opacity-90"
                            style={{ background: 'var(--primary)' }}
                            onClick={() => window.location.href = '/'}
                          >
                            Reorder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold">No inventory items match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
