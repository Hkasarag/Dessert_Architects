import { useState } from 'react'
import type { CartItem } from '../App'
import { subscriptionPlans as plans } from '../data/subscriptionPlans'

type Props = {
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
}

export default function Subscriptions({ addToCart }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)

  const handleAdd = (plan: typeof plans[number]) => {
    addToCart({
      id: plan.cartId,
      name: `${plan.name} Membership`,
      price: plan.price,
      unitCost: plan.unitCost,
      image: '',
      isSubscription: true,
    })
    setAdded(plan.id)
    setTimeout(() => setAdded(null), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">
          Frosted Bakery Memberships
        </h1>
        <p className="text-lg">
          Enjoy free treats every month, exclusive surprises, and bakery savings that pay for themselves.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-md md:max-w-none mx-auto">
        {plans.map(plan => (
          <div
            key={plan.id}
            onClick={() => setSelected(plan.id === selected ? null : plan.id)}
            className="relative rounded-3xl border-2 p-6 flex flex-col gap-4 cursor-pointer transition-all"
            style={{
              background: plan.color,
              borderColor: selected === plan.id ? plan.accent : plan.popular ? plan.accent + '88' : 'var(--border)',
              transform: selected === plan.id ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selected === plan.id ? `0 8px 30px ${plan.accent}33` : undefined,
            }}
          >
            {plan.popular && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                style={{ background: plan.accent }}
              >
                ⭐ Most Popular
              </div>
            )}

            <div className="text-4xl mt-2">{plan.emoji}</div>

            <div>
              <div className="font-bold text-xl" style={{ fontFamily: 'Fraunces, serif' }}>{plan.name}</div>
              <div className="text-3xl font-bold mt-2" style={{ color: plan.accent }}>
                ${plan.price}
                <span className="text-base font-semibold text-[var(--muted-foreground)]">/{plan.period}</span>
              </div>
            </div>

            <div
              className="text-xs font-bold px-3 py-1.5 rounded-lg self-start"
              style={{ background: plan.accent + '22', color: plan.accent }}
            >
              {plan.savings}
            </div>

            <ul className="space-y-2 flex-1">
              {plan.perks.map(perk => (
                <li key={perk} className="flex items-start gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
                  <span style={{ color: plan.accent }} className="mt-0.5 flex-shrink-0">✓</span>
                  {perk}
                </li>
              ))}
            </ul>

            <button
              onClick={e => { e.stopPropagation(); handleAdd(plan) }}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white transition hover:opacity-90 mt-2"
              style={{ background: added === plan.id ? '#4CAF50' : plan.accent }}
            >
              {added === plan.id ? '✓ Added to Cart!' : 'Start Membership'}
            </button>
          </div>
        ))}
      </div>

      <div
        className="mt-10 rounded-2xl p-6 text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="text-2xl mb-3">🤝</div>
        <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Need help choosing?</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
          Our Dessert Concierge can recommend the membership that gives you the most value based on your favorite treats and shopping habits.
        </p>
        <a
          href="/concierge"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition hover:opacity-90"
          style={{ background: 'var(--primary)' }}
        >
          Ask the Concierge
        </a>
      </div>
    </div>
  )
}
