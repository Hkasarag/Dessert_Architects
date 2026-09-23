import { activePromotions, customerProfile } from './types'

export function promotionRecommendationAgent() {
  const relevant = activePromotions.filter(promo => {
    const customerCategories = customerProfile.favoriteCategories
    return customerCategories.some(category =>
      category.toLowerCase().includes(promo.category.toLowerCase().split(' ')[0].toLowerCase())
    ) || promo.category === 'Chocolate Lovers'
  })

  const selected = relevant[0] ?? activePromotions.find(p => p.status === 'active')

  return {
    recommendedPromotion: selected
      ? {
          promotionId: selected.id,
          title: selected.title,
          reason: selected.reason,
          estimatedSavings: `$${selected.estimatedSavings.toFixed(2)}`,
        }
      : null,
  }
}
