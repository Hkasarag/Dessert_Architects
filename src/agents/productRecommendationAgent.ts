import { customerOrderHistory, customerProfile } from './types'
import { menuDataset, searchFuzzy, MenuItem } from './menuDataset'

const responseTemplates = [
  (item: MenuItem, why: string) => `I recommend the ${item.name}. ${why} It pairs well with coffee and is a crowd favorite.`,
  (item: MenuItem, why: string) => `Try the ${item.name} — ${why}. Customers often add it to their order for an extra treat.`,
  (item: MenuItem, why: string) => `The ${item.name} is a great pick. ${why} It's one of our most-loved items in this category.`,
]

function shuffle<T>(arr: T[]) {
  return arr
    .map(v => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(x => x.v)
}

function getPopularityHints() {
  // lightweight heuristic from order history
  const counts = new Map<string, number>()
  for (const h of customerOrderHistory) counts.set(h.productName, (counts.get(h.productName) || 0) + h.count)
  return counts
}

export function productRecommendationAgent(userMessage: string) {
  const lower = userMessage.toLowerCase()
  const popularity = getPopularityHints()

  // intent signals
  const wantsChocolate = /chocolate|cocoa|choco/.test(lower)
  const wantsFruity = /fruit|berry|peach|strawberry|blueberry|lemon/.test(lower)
  const wantsBirthday = /birthday|celebrat|cake|party/.test(lower)
  const wantsSeason = /spring|summer|fall|autumn|winter|seasonal/.test(lower)
  const wantsKids = /kids|children|child|school|kids birthday/.test(lower)

  let candidates: MenuItem[] = []

  if (wantsChocolate) candidates = menuDataset.filter(m => /chocolate|brownie|choc/i.test(m.name))
  else if (wantsFruity) candidates = menuDataset.filter(m => /strawberry|blueberry|peach|lemon|berry/i.test(m.name))
  else if (wantsBirthday) candidates = menuDataset.filter(m => /cupcake|cake|party|funfetti|birthday/i.test(m.name))
  else if (wantsKids) candidates = menuDataset.filter(m => /fun|sprinkle|cupcake|cookies/i.test(m.name))
  else if (wantsSeason) {
    const now = new Date()
    const month = now.getMonth() + 1
    const season = month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'fall' : 'winter'
    candidates = menuDataset.filter(m => (m.seasonal || []).includes(season as any))
  } else {
    candidates = [...menuDataset]
  }

  // rank by popularity and price (slight preference for popular)
  candidates = shuffle(candidates).sort((a, b) => (popularity.get(b.name) || 0) - (popularity.get(a.name) || 0))

  const picks = candidates.slice(0, 5)

  const recommendations = picks.map((p, i) => {
    const why = wantsChocolate
      ? 'It’s rich in chocolate and very popular among chocoholics.'
      : wantsFruity
        ? 'Bright, fruity notes make it a refreshing choice.'
        : wantsBirthday
          ? 'Perfect for celebrations and easy to serve to guests.'
          : 'Consistently well-reviewed by customers.'

    const template = responseTemplates[i % responseTemplates.length]
    return {
      productId: p.id,
      productName: p.name,
      price: `$${p.price.toFixed(2)}`,
      confidence: Number((0.9 - i * 0.08).toFixed(2)),
      message: template(p, why),
      reason: why,
    }
  })

  return { recommendedProducts: recommendations }
}
