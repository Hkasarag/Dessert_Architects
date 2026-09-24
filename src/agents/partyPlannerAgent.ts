import { menuDataset, MenuItem, seasonalItems, searchFuzzy } from './menuDataset'

function plural(n: number, label: string) { return `${n} ${label}${n>1?'s':''}` }

export function partyPlannerAgent(message: string) {
  const lower = message.toLowerCase()
  const guestCountMatch = lower.match(/(\d+) guests?|for (\d+) people|for (\d+)/)
  const budgetMatch = lower.match(/budget of \$?(\d+(?:\.\d+)?)/i)
  const eventType = /birthday/.test(lower)
    ? 'Birthday'
    : /wedding/.test(lower)
      ? 'Wedding'
      : /corporate/.test(lower)
        ? 'Corporate Event'
        : /baby shower/.test(lower)
          ? 'Baby Shower'
          : /graduation/.test(lower)
            ? 'Graduation'
            : /movie night/.test(lower)
              ? 'Movie Night'
              : /holiday/.test(lower)
                ? 'Holiday Gathering'
                : 'Birthday'

  const guestCount = Number(guestCountMatch ? guestCountMatch[1] || guestCountMatch[2] || guestCountMatch[3] : 12)
  const budget = Number(budgetMatch ? budgetMatch[1] : 150)

  // Build suggestions using dataset
  const suggestions: { label: string; items: { name: string; qty: string }[] }[] = []

  // Small/large group splits
  const small = guestCount <= 12
  const large = guestCount > 30

  // Helper to pick items by category or seasonal
  const pickByCategory = (cat: string, count = 2) => menuDataset.filter(m => m.category.toLowerCase() === cat.toLowerCase()).slice(0, count)

  if (eventType === 'Movie Night') {
    suggestions.push({ label: 'Small Group', items: pickByCategory('Brownies', 3).map(i => ({ name: i.name, qty: `${Math.max(6, Math.ceil(guestCount / 2))} pcs` })) })
    suggestions.push({ label: 'Large Group', items: pickByCategory('Cookies', 3).map(i => ({ name: i.name, qty: `${Math.max(24, guestCount * 2)} pcs` })) })
  } else if (eventType === 'Birthday' || eventType === 'Graduation') {
    suggestions.push({ label: 'Budget Option', items: [
      { name: 'Vanilla Cupcake', qty: plural(Math.max(12, Math.ceil(guestCount)), 'cupcake') },
      { name: 'Chocolate Chip Cookie', qty: plural(Math.max(24, Math.ceil(guestCount*2)), 'cookie') },
    ] })

    suggestions.push({ label: 'Premium Option', items: [
      { name: 'Tiramisu Cupcake', qty: plural(Math.max(12, Math.ceil(guestCount/2)), 'cupcake') },
      { name: 'Maple Pecan Brownie', qty: plural(Math.max(12, Math.ceil(guestCount/2)), 'brownie') },
    ] })
  } else if (eventType === 'Corporate Event' || eventType === 'Wedding') {
    suggestions.push({ label: 'Assorted Trays', items: [
      { name: 'Chocolate Brownie', qty: plural(Math.max(30, Math.ceil(guestCount*1.5)), 'piece') },
      { name: 'Cookies and Cream Cupcake', qty: plural(Math.max(24, Math.ceil(guestCount)), 'cupcake') },
    ] })
  } else if (eventType === 'Holiday Gathering') {
    // season-aware picks
    const now = new Date()
    const month = now.getMonth() + 1
    const season = month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'fall' : 'winter'
    const seasonal = seasonalItems(season as any)
    suggestions.push({ label: 'Seasonal Picks', items: seasonal.slice(0, 4).map(i => ({ name: i.name, qty: plural(Math.max(12, Math.ceil(guestCount/2)), 'unit') })) })
  }

  // Estimate totals conservatively using dataset prices
  let estimatedTotal = 0
  for (const s of suggestions) for (const it of s.items) {
    const found = menuDataset.find(m => m.name === it.name)
    if (found) estimatedTotal += found.price * (parseInt(it.qty.toString()) || 1)
  }

  // If no suggestions (edge case), fallback to crowd-pleasers
  if (suggestions.length === 0) {
    const fallback = pickByCategory('Cookies', 3)
    suggestions.push({ label: 'Popular Picks', items: fallback.map(i => ({ name: i.name, qty: plural(Math.max(12, guestCount), 'unit') })) })
  }

  return {
    eventType,
    guestCount,
    budget,
    suggestions,
    estimatedTotal: Number(estimatedTotal.toFixed(2)),
    followUp: 'Would you like a printable order summary or a suggested add-on drinks package?',
  }
}
