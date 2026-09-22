import { useState } from 'react'
import type { CartItem } from '../App'

type Props = { addToCart: (item: Omit<CartItem, 'quantity'>) => void; searchQuery?: string }

const tabs = ['All', 'Pastries', 'Cakes', 'Cookies', 'Breads', 'Seasonal']

const allProducts = [
  { id: 201, name: 'Butter Croissant', desc: 'Classic French laminated dough', price: 3.25, cat: 'Pastries', image: 'photo-1555507036-ab1f4038808a' },
  { id: 202, name: 'Almond Croissant', desc: 'Filled with almond frangipane', price: 4.25, cat: 'Pastries', image: 'photo-1509365390695-33aee754301f' },
  { id: 203, name: 'Pain au Chocolat', desc: 'Dark chocolate inside flaky pastry', price: 4.00, cat: 'Pastries', image: 'photo-1517093157656-b9eccef91cb1' },
  { id: 204, name: 'Cinnamon Roll', desc: 'Cream cheese frosting, served warm', price: 4.75, cat: 'Pastries', image: 'photo-1509365465985-25d11c17e812' },
  { id: 205, name: 'Blueberry Muffin', desc: 'Bursting with fresh blueberries', price: 3.50, cat: 'Pastries', image: 'photo-1587314168485-3236d6710814' },
  { id: 206, name: 'Birthday Cake (10")', desc: 'Serves 16–20, custom decorated', price: 64.00, cat: 'Cakes', image: 'photo-1578985545062-69928b1d9587' },
  { id: 207, name: 'Chocolate Layer Cake', desc: 'Three layers of rich chocolate sponge', price: 52.00, cat: 'Cakes', image: 'photo-1606313564200-e75d5e30476c' },
  { id: 208, name: 'Lemon Drizzle Cake', desc: 'Bright lemon with crunchy glaze', price: 38.00, cat: 'Cakes', image: 'photo-1519869325930-281384150729' },
  { id: 209, name: 'Carrot Cake (8")', desc: 'Cream cheese frosting, walnut top', price: 44.00, cat: 'Cakes', image: 'photo-1621303837174-89787a7d4729' },
  { id: 210, name: 'Chocolate Chip Cookie', desc: 'Classic recipe, soft & chewy', price: 2.50, cat: 'Cookies', image: 'photo-1499636136210-6f4ee915583e' },
  { id: 211, name: 'Snickerdoodle', desc: 'Cinnamon sugar with soft center', price: 2.50, cat: 'Cookies', image: 'photo-1558961363-fa8fdf82db35' },
  { id: 212, name: 'Dark Choc Brownie', desc: 'Dense fudgy squares, daily fresh', price: 3.25, cat: 'Cookies', image: 'photo-1606313564200-e75d5e30476c' },
  { id: 213, name: 'Macaron (each)', desc: 'Assorted French macarons', price: 2.75, cat: 'Cookies', image: 'photo-1569864358642-9d1684040f43' },
  { id: 214, name: 'Sourdough Loaf', desc: 'Long-ferment, natural starter', price: 8.50, cat: 'Breads', image: 'photo-1509440159596-0249088772ff' },
  { id: 215, name: 'Multigrain Loaf', desc: 'Seeds & whole grains, dense crumb', price: 7.50, cat: 'Breads', image: 'photo-1573246123716-6b1782bfc499' },
  { id: 216, name: 'Focaccia (half sheet)', desc: 'Rosemary & flaky sea salt', price: 9.00, cat: 'Breads', image: 'photo-1574085733277-851d9d856a3a' },
  { id: 217, name: 'Pumpkin Spice Cake', desc: 'Fall spices & cream cheese glaze', price: 36.00, cat: 'Seasonal', image: 'photo-1601784551446-20c9e07cdbdb' },
  { id: 218, name: 'Peppermint Bark', desc: 'Dark chocolate & candy cane', price: 12.00, cat: 'Seasonal', image: 'photo-1549007953-2f2dc0b24019' },
  { id: 219, name: 'Apple Cider Donut', desc: 'Cinnamon sugar, baked fresh', price: 3.00, cat: 'Seasonal', image: 'photo-1508737804141-4c3b688e2546' },
]

export default function FullMenu({ addToCart, searchQuery = '' }: Props) {
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState(searchQuery)
  const [added, setAdded] = useState<number | null>(null)

  const filtered = allProducts.filter(p =>
    (activeTab === 'All' || p.cat === activeTab) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = (p: typeof allProducts[0]) => {
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      image: `https://images.unsplash.com/${p.image}?w=200&h=200&fit=crop&auto=format`,
    })
    setAdded(p.id)
    setTimeout(() => setAdded(null), 1800)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Full Bakery Menu</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Everything we bake fresh, every morning — {allProducts.length} items and counting.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition"
              style={{
                background: activeTab === tab ? 'var(--primary)' : 'var(--muted)',
                color: activeTab === tab ? 'white' : 'var(--muted-foreground)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search menu…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', minWidth: 180 }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(p => (
          <div
            key={p.id}
            className="rounded-2xl overflow-hidden border flex flex-col shadow-sm"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="h-36 bg-amber-50 overflow-hidden">
              <img
                src={`https://images.unsplash.com/${p.image}?w=400&h=280&fit=crop&auto=format`}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex flex-col flex-1 gap-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full self-start"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                {p.cat}
              </span>
              <div className="font-bold text-base mt-1">{p.name}</div>
              <div className="text-xs flex-1" style={{ color: 'var(--muted-foreground)' }}>{p.desc}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-lg">${p.price.toFixed(2)}</span>
                <button
                  onClick={() => handleAdd(p)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: added === p.id ? '#4CAF50' : 'var(--primary)' }}
                >
                  {added === p.id ? '✓' : '+ Add'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-semibold">No items found for "{search}"</p>
          <button onClick={() => { setSearch(''); setActiveTab('All') }} className="mt-4 text-sm underline" style={{ color: 'var(--primary)' }}>Clear filters</button>
        </div>
      )}
    </div>
  )
}
