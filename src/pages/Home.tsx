import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CartItem } from '../App'
import { isInSeason, menuProducts, type MenuProduct } from '../data/menuProducts'
import { featuredPromotions as promotions } from '../data/promotions'
import { cartItemFromBundle, cartItemFromMenuProduct, menuImageUrl } from '../lib/cartItems'

type Props = {
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  searchQuery: string
}

const allProducts = menuProducts.filter(product => isInSeason(product.season))

const categories = [
  { label: 'Cookies', bg: '#FFF0E0' },
  { label: 'Brownies', bg: '#FFF8E8' },
  { label: 'Cupcakes', bg: '#F0E8FF' },
  { label: 'Pastries', bg: '#E8F8F0' },
  { label: 'Seasonal', bg: '#FFF4E0' },
]

function ProductCard({ product, addToCart }: {
  product: MenuProduct
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
}) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(cartItemFromMenuProduct(product), qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border flex flex-col" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="h-40 overflow-hidden bg-amber-50">
        <img
          src={menuImageUrl(product.image, 400, 300)}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="font-bold text-base leading-tight">{product.name}</div>
        <div className="text-sm flex-1" style={{ color: 'var(--muted-foreground)' }}>{product.desc}</div>
        <div className="font-bold text-lg">${product.price.toFixed(2)}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button className="w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-[var(--muted)] transition" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span className="w-7 text-center font-semibold text-sm">{qty}</span>
            <button className="w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-[var(--muted)] transition" onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition"
            style={{ background: added ? '#4CAF50' : 'var(--primary)' }}
          >
            {added ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home({ addToCart, searchQuery }: Props) {
  const navigate = useNavigate()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const isSearching = searchQuery.trim().length > 0
  const searchResults = isSearching
    ? allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  if (isSearching) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
            Search results for "{searchQuery}"
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {searchResults.length} item{searchResults.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {searchResults.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold mb-2">No treats found for "{searchQuery}"</p>
            <p style={{ color: 'var(--muted-foreground)' }}>Try searching for "brownies", "cookies", or "cupcakes"</p>
            <button onClick={() => navigate('/menu')} className="mt-6 px-6 py-3 rounded-2xl font-bold text-white" style={{ background: 'var(--primary)' }}>
              Browse Full Menu
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
      {/* Hero */}
      <section
        className="relative rounded-3xl overflow-hidden min-h-[320px] flex items-center"
        style={{ background: 'var(--primary)' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&h=500&fit=crop&auto=format"
            alt="Fresh baked goods in a warm bakery"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 px-10 py-12 max-w-xl">
          <div
            className="inline-flex items-center gap-2 text-sm font-bold px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
          >
            ✨ AI Personalized For You
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Freshly Recommended<br />Just For You
          </h1>
          <p className="text-lg text-white/85 leading-relaxed mb-8">
            Our AI learns your favorite treats and helps you discover new bakery items you'll love.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-3 rounded-2xl font-bold text-base transition hover:scale-105"
              style={{ background: 'white', color: 'var(--primary)' }}
              onClick={() => navigate('/menu')}
            >
              Shop Now
            </button>
            <button
              className="px-6 py-3 rounded-2xl font-bold text-base border-2 border-white text-white transition hover:bg-white/10"
              onClick={() => navigate('/concierge')}
            >
              Ask Our Concierge
            </button>
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section>
        <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: 'Fraunces, serif' }}>🏷️ Featured Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {promotions.map(p => (
            <div
              key={p.id}
              className="rounded-2xl p-5 border flex flex-col gap-3"
              style={{ background: p.color, borderColor: p.accent + '44' }}
            >
              <div className="text-3xl">{p.emoji}</div>
              <div>
                <div className="font-bold text-lg leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>{p.name}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{p.description}</div>
              </div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold self-start"
                style={{ background: p.accent, color: 'white' }}
              >
                {p.discount}
              </div>
              <div className="flex items-center gap-2">
                <code
                  className="text-sm font-bold px-3 py-1.5 rounded-xl border cursor-pointer select-all transition hover:opacity-80"
                  style={{ background: 'white', borderColor: p.accent + '55', color: p.accent }}
                  onClick={() => copyCode(p.code)}
                  title="Click to copy"
                >
                  {p.code}
                </code>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {copiedCode === p.code ? '✓ Copied!' : 'click to copy'}
                </span>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-white/50"
                  style={{ borderColor: p.accent, color: p.accent }}
                  onClick={() => copyCode(p.code)}
                >
                  Apply Promo
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: p.accent }}
                  onClick={() => addToCart(cartItemFromBundle(p))}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Categories */}
      {categories.map(cat => {
        const products = allProducts.filter(p => p.cat === cat.label)
        return (
          <section key={cat.label}>
            <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: 'Fraunces, serif' }}>{cat.label}</h2>
            <div className="rounded-3xl p-6" style={{ background: cat.bg }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(prod => (
                  <ProductCard key={prod.id} product={prod} addToCart={addToCart} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* Browse Full Menu CTA */}
      <section className="text-center py-10">
        <div className="text-4xl mb-4">🍰</div>
        <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Fraunces, serif' }}>Discover Everything We Bake</h2>
        <p className="text-lg mb-8" style={{ color: 'var(--muted-foreground)' }}>
          Browse our full menu — from morning pastries to celebration cakes.
        </p>
        <button
          className="px-10 py-4 rounded-2xl font-bold text-lg text-white transition hover:opacity-90 hover:scale-105 shadow-md"
          style={{ background: 'var(--primary)' }}
          onClick={() => navigate('/menu')}
        >
          Browse Full Bakery Menu
        </button>
      </section>
    </div>
  )
}
