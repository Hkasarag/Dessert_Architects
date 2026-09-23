import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CartItem } from '../App'
import { useAuth } from '../context/AuthContext'

type Props = {
  items: CartItem[]
  updateQty: (id: number, delta: number) => void
  removeItem: (id: number) => void
  clearCart: () => void
}

const PROMO_CODES: Record<string, { type: 'pct' | 'flat'; value: number; label: string }> = {
  COOKIE20: { type: 'pct', value: 0.20, label: '20% off — Weekend Cookie Bundle' },
  HOLIDAY10: { type: 'flat', value: 10, label: '$10 off — Holiday Dessert Special' },
  FAMILY15: { type: 'pct', value: 0.15, label: '15% off — Family Celebration Package' },
  WELCOME10: { type: 'pct', value: 0.10, label: '10% off — Welcome offer' },
}

export default function Cart({ items, updateQty, removeItem, clearCart }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<null | { code: string; type: 'pct' | 'flat'; value: number; label: string }>(null)
  const [promoError, setPromoError] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const promoDiscount = appliedPromo
    ? appliedPromo.type === 'pct'
      ? subtotal * appliedPromo.value
      : Math.min(appliedPromo.value, subtotal)
    : 0

  const tax = (subtotal - promoDiscount) * 0.08
  const total = subtotal - promoDiscount + tax

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    const promo = PROMO_CODES[code]
    if (!promo) {
      setPromoError('Invalid promo code. Try COOKIE20, HOLIDAY10, or FAMILY15.')
      return
    }
    setAppliedPromo({ code, ...promo })
    setPromoError('')
    setPromoInput('')
  }

  const submitOrder = async () => {
    setCheckoutError('')
    setIsSubmitting(true)

    const order = {
      orderId: '',
      customerId: user?.username ?? '',
      createdAt: new Date().toISOString(),
      status: 'Pending',
      subscriptionType: items.some(item => item.isSubscription) ? 'Subscription' : 'None',
      subtotal: subtotal - promoDiscount,
      tax,
      total,
      items: items.map(item => ({
        productId: String(item.id),
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        unitCost: item.unitCost,
      })),
    }

    try {
      const response = await fetch('http://localhost:5050/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Unable to create the order.')
      }

      clearCart()
      navigate('/thankyou')
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to create the order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Fraunces, serif' }}>Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-6xl mb-5">🧺</div>
          <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
          <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>Add some treats to get started!</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-2xl font-bold text-white"
            style={{ background: 'var(--primary)' }}
          >
            Browse Treats
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base">{item.name}</div>
                  <div className="font-semibold mt-1" style={{ color: 'var(--primary)' }}>
                    ${item.price.toFixed(2)} each
                  </div>
                </div>
                {item.isSubscription ? (
                  <span className="text-sm font-semibold px-3" style={{ color: 'var(--muted-foreground)' }}>1 membership</span>
                ) : (
                  <div className="flex items-center gap-1 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                    <button className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-[var(--muted)] transition" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-[var(--muted)] transition" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                )}
                <div className="text-right min-w-[70px]">
                  <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 rounded-xl hover:bg-red-50 transition text-red-400"
                  aria-label="Remove item"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div
              className="rounded-2xl border p-6 sticky top-24"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2">Promo Code</label>
                {appliedPromo ? (
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm"
                    style={{ background: '#F0FFF4', borderColor: '#4CAF5055' }}
                  >
                    <div>
                      <div className="font-bold text-green-700">✓ {appliedPromo.code}</div>
                      <div className="text-xs text-green-600">{appliedPromo.label}</div>
                    </div>
                    <button
                      onClick={() => setAppliedPromo(null)}
                      className="text-xs text-red-400 font-bold hover:underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value); setPromoError('') }}
                      onKeyDown={e => e.key === 'Enter' && applyPromo()}
                      placeholder="e.g. COOKIE20"
                      className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none"
                      style={{ background: 'var(--muted)', borderColor: promoError ? '#E74C3C' : 'var(--border)', color: 'var(--foreground)' }}
                    />
                    <button
                      onClick={applyPromo}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
                      style={{ background: 'var(--primary)' }}
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#E74C3C' }}>{promoError}</p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)' }}>Promo ({appliedPromo?.code})</span>
                    <span className="font-semibold text-green-600">−${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between text-base font-bold pt-3 border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={submitOrder}
                disabled={isSubmitting}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-lg text-white transition hover:opacity-90 shadow-md mb-3"
                style={{ background: 'var(--primary)' }}
              >
                {isSubmitting ? 'Submitting...' : 'Checkout'}
              </button>
              {checkoutError && <p className="mt-3 text-sm font-medium text-red-600">{checkoutError}</p>}
              <button
                className="w-full py-3 rounded-2xl font-bold text-base border-2 transition hover:bg-[var(--muted)]"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
