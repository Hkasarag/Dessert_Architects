import { menuDataset, searchFuzzy } from './menuDataset'

const phrasingPool = [
  (p: string, r: string) => `You might also like ${p}. ${r}`,
  (p: string, r: string) => `Consider adding ${p} — ${r}`,
  (p: string, r: string) => `${p} is a great complement. ${r}`,
]

function uniqByName(arr: any[]) { return arr.filter((v,i,a)=>a.findIndex(x=>x.name===v.name)===i) }

export function cartOptimizationAgent(message: string) {
  const lower = message.toLowerCase()

  // Attempt to parse items mentioned in the user's message
  const mentioned = [] as string[]
  for (const item of menuDataset) {
    if (lower.includes(item.name.toLowerCase().split(' ')[0])) mentioned.push(item.name)
  }

  // If no explicit items mentioned, check for general categories
  if (mentioned.length === 0) {
    if (/brownie|brownies/.test(lower)) mentioned.push('Chocolate Brownie')
    if (/cookie|cookies/.test(lower)) mentioned.push('Chocolate Chip Cookie')
    if (/cupcake|cupcakes/.test(lower)) mentioned.push('Vanilla Cupcake')
  }

  // Build suggestions: complementary items and bundles
  const suggestions: { name: string; reason: string }[] = []

  for (const name of mentioned.slice(0, 3)) {
    const found = searchFuzzy(name, 4)[0]
    if (!found) continue
    // simple category-based complements
    if (found.category === 'Brownies') {
      suggestions.push({ name: 'Vanilla Cupcake', reason: 'Great for variety and pairs well with rich brownies.' })
      suggestions.push({ name: 'Chocolate Chip Cookie', reason: 'Popular add-on that increases average order value.' })
    }
    if (found.category === 'Cookies') {
      suggestions.push({ name: 'Cinnamon Roll', reason: 'A breakfast add-on that customers love.' })
      suggestions.push({ name: 'Vanilla Cupcake', reason: 'Makes for a nice mixed-dessert selection.' })
    }
    if (found.category === 'Cupcakes') {
      suggestions.push({ name: 'Chocolate Brownie', reason: 'Adds a richer option for chocolate lovers.' })
      suggestions.push({ name: 'Cinnamon Roll', reason: 'Good for morning pickup and coffee pairings.' })
    }
  }

  const uniq = uniqByName(suggestions).slice(0, 4)

  const recommendations = uniq.map((s, i) => ({ productName: s.name, message: phrasingPool[i % phrasingPool.length](s.name, s.reason) }))

  return { recommendations }
}
