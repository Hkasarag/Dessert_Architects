import { useState } from 'react'
import type { CartItem } from '../App'
import { isInSeason, menuProducts } from '../data/menuProducts'

type Props = { addToCart: (item: Omit<CartItem, 'quantity'>) => void; searchQuery?: string }

const tabs = [
  'All',
  'Cookies',
  'Brownies',
  'Cupcakes',
  'Pastries',
  'Seasonal'
]
const legacyProducts = [
  // COOKIES
  {
    id: 1,
    name: '🍪 Chocolate Chip Cookie',
    desc: 'Fresh baked cookie loaded with chocolate chips',
    price: 2.99,
    cat: 'Cookies',
    image: 'photo-1499636136210-6f4ee915583e',
    season: 'All Year'
  },
  {
    id: 2,
    name: '✨ Snickerdoodle Cookie',
    desc: 'Classic cinnamon sugar cookie',
    price: 2.99,
    cat: 'Cookies',
    image: 'photo-1558961363-fa8fdf82db35',
    season: 'All Year'
  },
  {
    id: 3,
    name: '🥣 Oatmeal Cookie',
    desc: 'Soft oatmeal cookie with warm spice notes',
    price: 2.99,
    cat: 'Cookies',
    image: 'photo-1499636136210-6f4ee915583e',
    season: 'All Year'
  },
  {
    id: 4,
    name: '🌸 Almond Fudge Cookie',
    desc: 'Almond cookie loaded with fudge chunks',
    price: 2.99,
    cat: 'Seasonal',
    image: 'photo-1499636136210-6f4ee915583e',
    season: 'Spring'
  },
  {
    id: 5,
    name: '🍑 Peach Cobbler Sugar Cookie',
    desc: 'Peach filling and cinnamon sugar',
    price: 2.99,
    cat: 'Seasonal',
    image: 'photo-1499636136210-6f4ee915583e',
    season: 'Summer'
  },
  {
    id: 6,
    name: '🥨 Chocolate Chunk Pretzel Cookie',
    desc: 'Chocolate chunks with crunchy pretzel pieces',
    price: 2.99,
    cat: 'Seasonal',
    image: 'photo-1499636136210-6f4ee915583e',
    season: 'Fall'
  },
  {
    id: 7,
    name: '🎄 Gingerbread Cookie',
    desc: 'Classic holiday gingerbread spices',
    price: 2.99,
    cat: 'Seasonal',
    image: 'photo-1499636136210-6f4ee915583e',
    season: 'Winter'
  },

  // BROWNIES
  {
    id: 20,
    name: '🍫 Chocolate Brownie',
    desc: 'Rich fudgy chocolate brownie',
    price: 3.50,
    cat: 'Brownies',
    image: 'photo-1606313564200-e75d5e30476c',
    season: 'All Year'
  },
  {
    id: 21,
    name: '🌰 Walnut Brownie',
    desc: 'Chocolate brownie with walnuts',
    price: 3.50,
    cat: 'Brownies',
    image: 'photo-1606313564200-e75d5e30476c',
    season: 'All Year'
  },
  {
    id: 22,
    name: '🍓 Strawberry Blondie',
    desc: 'Spring strawberry blondie',
    price: 3.50,
    cat: 'Seasonal',
    image: 'photo-1606313564200-e75d5e30476c',
    season: 'Spring'
  },
  {
    id: 23,
    name: '🔥 Smores Brownie',
    desc: 'Chocolate brownie topped with marshmallow and graham cracker',
    price: 3.50,
    cat: 'Seasonal',
    image: 'photo-1606313564200-e75d5e30476c',
    season: 'Summer'
  },
  {
    id: 24,
    name: '🎃 Pumpkin Brownie',
    desc: 'Pumpkin brownie with warm fall spices',
    price: 3.50,
    cat: 'Seasonal',
    image: 'photo-1606313564200-e75d5e30476c',
    season: 'Fall'
  },
  {
    id: 25,
    name: '❄️ Peppermint Mocha Brownie',
    desc: 'Peppermint brownie infused with espresso',
    price: 3.50,
    cat: 'Seasonal',
    image: 'photo-1606313564200-e75d5e30476c',
    season: 'Winter'
  },

  // CUPCAKES
  {
    id: 40,
    name: '🧁 Vanilla Cupcake',
    desc: 'Classic vanilla buttercream cupcake',
    price: 4.50,
    cat: 'Cupcakes',
    image: 'photo-1486427944299-d1955d23e34d',
    season: 'All Year'
  },
  {
    id: 41,
    name: '🍫 Chocolate Cupcake',
    desc: 'Chocolate cupcake with chocolate frosting',
    price: 4.50,
    cat: 'Cupcakes',
    image: 'photo-1486427944299-d1955d23e34d',
    season: 'All Year'
  },
  {
    id: 42,
    name: '🍋 Lemon Cupcake',
    desc: 'Fresh citrus cupcake with vanilla frosting',
    price: 4.50,
    cat: 'Cupcakes',
    image: 'photo-1486427944299-d1955d23e34d',
    season: 'All Year'
  },
  {
    id: 43,
    name: '🫐 Blueberry Cupcake',
    desc: 'Blueberry cupcake with vanilla frosting',
    price: 4.50,
    cat: 'Seasonal',
    image: 'photo-1486427944299-d1955d23e34d',
    season: 'Spring'
  },
  {
    id: 44,
    name: '🥥 Toasted Coconut Cupcake',
    desc: 'Toasted coconut cupcake',
    price: 4.50,
    cat: 'Seasonal',
    image: 'photo-1486427944299-d1955d23e34d',
    season: 'Summer'
  },
  {
    id: 45,
    name: '🥕 Carrot Cupcake',
    desc: 'Carrot cupcake with cream cheese frosting',
    price: 4.50,
    cat: 'Seasonal',
    image: 'photo-1486427944299-d1955d23e34d',
    season: 'Fall'
  },
  {
    id: 46,
    name: '🎄 Peppermint Chocolate Cupcake',
    desc: 'Chocolate cupcake with peppermint frosting',
    price: 4.50,
    cat: 'Seasonal',
    image: 'photo-1486427944299-d1955d23e34d',
    season: 'Winter'
  },

  // PASTRIES
  {
    id: 60,
    name: '🥐 Cinnamon Roll',
    desc: 'Warm cinnamon roll with cream cheese frosting',
    price: 3.99,
    cat: 'Pastries',
    image: 'photo-1509365465985-25d11c17e812',
    season: 'All Year'
  },
  {
    id: 61,
    name: '🍌 Vegan Banana Bread Muffin',
    desc: 'Plant-based banana bread muffin',
    price: 2.99,
    cat: 'Pastries',
    image: 'photo-1587314168485-3236d6710814',
    season: 'All Year'
  }
]

const allProducts = menuProducts

export default function FullMenu({ addToCart, searchQuery = '' }: Props) {
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState(searchQuery)
  const [added, setAdded] = useState<number | null>(null)

 const filtered = allProducts.filter(
  p =>
    isInSeason(p.season) &&
    (
      activeTab === 'All' ||
      p.cat === activeTab ||
      (
        activeTab === 'Seasonal' &&
        p.cat === 'Seasonal'
      )
    ) &&
    (
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.cat.toLowerCase().includes(search.toLowerCase())
    )
)

  const handleAdd = (p: typeof allProducts[0]) => {
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      unitCost: p.unitCost,
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
