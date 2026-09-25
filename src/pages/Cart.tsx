import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CartItem } from '../App'
import { useAuth } from '../context/AuthContext'
import { promoCodes as PROMO_CODES } from '../data/promotions'
import { LOYALTY, maxPointsFor, pointsEarnedFor } from '../data/loyalty'
import { fetchLoyaltyBalance } from '../lib/loyaltyApi'

type Props = {
  items: CartItem[]
  updateQty: (id: number, delta: number) => void
  removeItem: (id: number) => void
  clearCart: () => void
}

export default function Cart({ items, updateQty, removeItem, clearCart }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<null | { code: string; type: 'pct' | 'flat'; value: number; label: string }>(null)
  const [promoError, setPromoError] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null)
  const [loyaltyLoadError, setLoyaltyLoadError] = useState('')
  const [pointsInput, setPointsInput] = useState('')
  const [appliedPoints, setAppliedPoints] = useState(0)
  const [pointsError, setPointsError] = useState('')

  useEffect(() => {
    if (!user?.username) return
    const controller = new AbortController()
    fetchLoyaltyBalance(user.username, controller.signal)
      .then(summary => setLoyaltyBalance(summary.balance))
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLoyaltyLoadError('Loyalty points are unavailable right now.')
      })
    return () => controller.abort()
  }, [user?.username])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const promoDiscount = appliedPromo
    ? appliedPromo.type === 'pct'
      ? subtotal * appliedPromo.value
      : Math.min(appliedPromo.value, subtotal)
    : 0

  // Loyalty points apply after promo codes and before tax; they can't exceed that amount.
  const afterPromo = subtotal - promoDiscount
  const maxPointsForOrder = maxPointsFor(afterPromo)
  const pointsDiscount = appliedPoints * LOYALTY.pointValue
  const pointsOverLimit = appliedPoints > maxPointsForOrder || (loyaltyBalance !== null && appliedPoints > loyaltyBalance)

  const tax = Math.max(0, afterPromo - pointsDiscount) * 0.08
  const total = Math.max(0, afterPromo - pointsDiscount) + tax
  const pointsToEarn = appliedPoints > 0 ? 0 : pointsEarnedFor(total)

  const formatPoints = (points: number) => points.toLocaleString('en-US')

  const applyPoints = (requested: string) => {
    const trimmed = requested.trim()
    if (!/^\d+$/.test(trimmed)) {
      setPointsError('Enter a whole number of points.')
      return
    }
    const points = Number(trimmed)
    if (points <= 0) {
      setPointsError('Enter at least 1 point.')
      return
    }
    if (loyaltyBalance === null) {
      setPointsError('Your points balance is still loading. Please try again.')
      return
    }
    if (points > loyaltyBalance) {
      setPointsError(`You only have ${formatPoints(loyaltyBalance)} points.`)
      return
    }
    if (points > maxPointsForOrder) {
      setPointsError(`This order can use at most ${formatPoints(maxPointsForOrder)} points ($${(maxPointsForOrder * LOYALTY.pointValue).toFixed(2)}).`)
      return
    }
    setAppliedPoints(points)
    setPointsInput('')
    setPointsError('')
  }

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
    if (pointsOverLimit) {
      setCheckoutError('Adjust the loyalty points applied to this order before checking out.')
      return
    }
    setCheckoutError('')
    setIsSubmitting(true)

    const order = {
      orderId: '',
      customerId: user?.username ?? '',
      createdAt: new Date().toISOString(),
      status: 'Pending',
      subscriptionType: items.some(item => item.isSubscription) ? 'Subscription' : 'None',
      subtotal: afterPromo,
      tax,
      total,
      loyaltyPointsRedeemed: appliedPoints,
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
      navigate('/thankyou', {
        state: {
          pointsEarned: result.loyaltyPointsEarned ?? 0,
          pointsRedeemed: result.loyaltyPointsRedeemed ?? 0,
          pointsBalance: result.loyaltyBalance ?? null,
        },
      })
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

              {/* Loyalty Points */}
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <label htmlFor="loyalty-points" className="text-sm font-semibold">Loyalty Points</label>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {loyaltyBalance === null
                      ? (loyaltyLoadError || 'Loading balance…')
                      : `You have ${formatPoints(loyaltyBalance)} pts ($${(loyaltyBalance * LOYALTY.pointValue).toFixed(2)})`}
                  </span>
                </div>
                {appliedPoints > 0 ? (
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm"
                    style={pointsOverLimit
                      ? { background: '#FFF0F0', borderColor: '#E74C3C55' }
                      : { background: '#F0FFF4', borderColor: '#4CAF5055' }}
                  >
                    <div>
                      <div className={`font-bold ${pointsOverLimit ? 'text-red-700' : 'text-green-700'}`}>
                        {pointsOverLimit ? '⚠' : '✓'} {formatPoints(appliedPoints)} points applied
                      </div>
                      <div className={`text-xs ${pointsOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                        −${pointsDiscount.toFixed(2)} off this order
                      </div>
                    </div>
                    <button
                      onClick={() => { setAppliedPoints(0); setPointsError('') }}
                      className="text-xs text-red-400 font-bold hover:underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      id="loyalty-points"
                      type="text"
                      inputMode="numeric"
                      value={pointsInput}
                      onChange={e => { setPointsInput(e.target.value); setPointsError('') }}
                      onKeyDown={e => e.key === 'Enter' && applyPoints(pointsInput)}
                      placeholder="Points to use"
                      disabled={!loyaltyBalance}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border text-sm outline-none disabled:opacity-60"
                      style={{ background: 'var(--muted)', borderColor: pointsError ? '#E74C3C' : 'var(--border)', color: 'var(--foreground)' }}
                    />
                    <button
                      onClick={() => applyPoints(pointsInput)}
                      disabled={!loyaltyBalance}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition hover:opacity-90 disabled:opacity-40"
                      style={{ background: 'var(--primary)' }}
                    >
                      Use
                    </button>
                  </div>
                )}
                {appliedPoints === 0 && !!loyaltyBalance && maxPointsForOrder > 0 && (
                  <button
                    className="text-xs font-semibold mt-1.5 hover:underline"
                    style={{ color: 'var(--primary)' }}
                    onClick={() => applyPoints(String(Math.min(loyaltyBalance, maxPointsForOrder)))}
                  >
                    Use max ({formatPoints(Math.min(loyaltyBalance, maxPointsForOrder))} pts)
                  </button>
                )}
                {pointsError && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#E74C3C' }} role="alert">{pointsError}</p>
                )}
                {pointsOverLimit && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#E74C3C' }} role="alert">
                    {loyaltyBalance !== null && appliedPoints > loyaltyBalance
                      ? `You only have ${formatPoints(loyaltyBalance)} points.`
                      : `Your order total changed. This order can now use at most ${formatPoints(maxPointsForOrder)} points.`}
                  </p>
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
                {appliedPoints > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)' }}>Loyalty points ({formatPoints(appliedPoints)})</span>
                    <span className="font-semibold text-green-600">−${pointsDiscount.toFixed(2)}</span>
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
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {appliedPoints > 0
                    ? 'Orders paid with loyalty points don’t earn new points.'
                    : `You’ll earn ${formatPoints(pointsToEarn)} loyalty points with this order.`}
                </p>
              </div>

              <button
                onClick={submitOrder}
                disabled={isSubmitting || pointsOverLimit}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-lg text-white transition hover:opacity-90 shadow-md mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
