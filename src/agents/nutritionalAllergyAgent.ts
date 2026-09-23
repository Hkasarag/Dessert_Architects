import { productCatalog } from './types'

export function nutritionalAllergyAgent(message: string) {
  const lower = message.toLowerCase()
  const allergens = [] as string[]

  if (/peanut/.test(lower)) allergens.push('peanuts')
  if (/almond|nut/.test(lower)) allergens.push('almonds')
  if (/dairy|milk/.test(lower)) allergens.push('milk')
  if (/gluten|wheat/.test(lower)) allergens.push('wheat')
  if (/egg/.test(lower)) allergens.push('eggs')

  const safeProducts = productCatalog.filter(item => {
    if (allergens.length === 0) return true
    return !item.allergens.some(allergen => allergens.includes(allergen))
  })

  return {
    safeProducts: safeProducts.slice(0, 3).map(item => ({
      productName: item.name,
      reason: 'Contains no restricted allergens and is suitable for a cautious dietary review.',
    })),
  }
}
