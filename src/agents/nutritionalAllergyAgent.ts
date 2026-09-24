import { safeOptions } from './menuDataset'

export function nutritionalAllergyAgent(message: string) {
  const lower = message.toLowerCase()
  const allergens = [] as string[]

  if (/peanut/.test(lower)) allergens.push('peanuts')
  if (/almond|nut/.test(lower)) allergens.push('almonds')
  if (/dairy|milk/.test(lower)) allergens.push('milk')
  if (/gluten|wheat/.test(lower)) allergens.push('wheat')
  if (/egg/.test(lower)) allergens.push('eggs')

  // If no allergen specified, ask for clarification
  if (allergens.length === 0) {
    return { message: 'Which allergen are you concerned about? For example: peanuts, dairy, gluten, eggs, or tree nuts.' }
  }

  const safe = safeOptions(allergens, 6)

  return {
    safeProducts: safe.map(p => ({ productName: p.name, reason: 'This item does not list the specified allergen and is commonly safe, but please verify with staff if you have severe allergies.' })),
  }
}
