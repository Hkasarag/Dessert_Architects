import { customerOrderHistory, customerProfile, productCatalog } from './types'

function getTopPurchasedCategories() {
  const categoryTotals = new Map<string, number>()

  customerOrderHistory.forEach(item => {
    const current = categoryTotals.get(item.category) ?? 0
    categoryTotals.set(item.category, current + item.count)
  })

  return Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)
}

export function productRecommendationAgent(_userMessage: string) {
  const topCategories = getTopPurchasedCategories()
  const activeProducts = productCatalog.filter(item => item.active)

  const recommendations = activeProducts
    .filter(item => topCategories.includes(item.category) || item.category === 'Chocolate Lovers')
    .slice(0, 3)
    .map((item, index) => ({
      productId: item.id,
      productName: item.name,
      confidence: Number((0.9 - index * 0.08).toFixed(2)),
      reason: `Customer frequently purchases ${customerProfile.favoriteCategories[0] ?? topCategories[0] ?? 'favorite'} items and this matches their historical preference.`,
    }))

  return {
    recommendedProducts: recommendations,
  }
}
