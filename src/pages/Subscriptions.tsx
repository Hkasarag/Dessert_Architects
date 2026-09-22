import { useState } from 'react'

const plans = [
  {
    id: 'starter',
    name: 'Sweet Starter',
    price: 24,
    period: 'month',
    treats: 4,
    emoji: '🧁',
    color: '#E8F5FF',
    accent: '#6BBFD8',
    popular: false,
    discount: '10% off all orders',
    perks: [
      '4 freshly baked treats per week',
      '10% discount on additional orders',
      'Early access to new items',
      'Monthly personalized recipe card',
    ],
  },
  {
    id: 'monthly',
    name: 'Monthly Dessert Box',
    price: 36,
    period: 'month',
    treats: 6,
    emoji: '📦',
    color: '#FFF8E0',
    accent: '#F4A361',
    popular: false,
    discount: '12% off all orders',
    perks: [
      '6 curated desserts delivered monthly',
      '12% discount on all orders',
      'Seasonal exclusive items included',
      'Personalized flavor curation',
      'Free delivery every week',
    ],
  },
  {
    id: 'family',
    name: 'Family Favorites Plan',
    price: 49,
    period: 'month',
    treats: 8,
    emoji: '🏡',
    color: '#F0FFF4',
    accent: '#4CAF50',
    popular: true,
    discount: '15% off all orders',
    perks: [
      '8 family-sized treats per week',
      '15% discount on all orders',
      'Free customization on cakes',
      'Priority ordering for celebrations',
      'Free delivery, always',
      'Dedicated family concierge',
    ],
  },
  {
    id: 'vip',
    name: 'Bakery VIP Club',
    price: 79,
    period: 'month',
    treats: 12,
    emoji: '👑',
    color: '#F5F0FF',
    accent: '#9C27B0',
    popular: false,
    discount: '20% off all orders',
    perks: [
      '12 premium treats per week',
      '20% discount on everything',
      'First access to ALL seasonal launches',
      'Monthly private tasting event invite',
      'Custom celebration cake (1/quarter)',
      'White-glove delivery service',
      'Direct baker phone line',
    ],
  },
]

export default function Subscriptions() {
  const [selected, setSelected] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)

  const handleAdd = (id: string) => {
    setAdded(id)
    setTimeout(() => setAdded(null), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Fraunces, serif' }}>Bakery Subscription Plans</h1>
        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
          Fresh treats delivered regularly. Cancel or pause anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
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
              <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {plan.treats} treats per week
              </div>
            </div>

            <div
              className="text-xs font-bold px-3 py-1.5 rounded-lg self-start"
              style={{ background: plan.accent + '22', color: plan.accent }}
            >
              {plan.discount}
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
              onClick={e => { e.stopPropagation(); handleAdd(plan.id) }}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white transition hover:opacity-90 mt-2"
              style={{ background: added === plan.id ? '#4CAF50' : plan.accent }}
            >
              {added === plan.id ? '✓ Added to Cart!' : 'Add Subscription to Cart'}
            </button>
          </div>
        ))}
      </div>

      <div
        className="mt-10 rounded-2xl p-6 text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="text-2xl mb-3">🤝</div>
        <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Not sure which plan is right for you?</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
          Our Bakery Concierge can review your order history and recommend the best plan for your family.
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
