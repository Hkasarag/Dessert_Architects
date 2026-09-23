import {
  activePromotions,
  customerProfile,
  productCatalog,
  customerOrderHistory,
} from './types'

type SimulateParams = {
  promotionType?: string
  productId?: string
  durationDays?: number
}

function pickTopProductsForAudience(audienceCategories: string[], limit = 3) {
  const picks: string[] = []
  for (const cat of audienceCategories) {
    const found = productCatalog.filter(p => p.category === cat && p.active).slice(0, limit)
    for (const f of found) picks.push(f.name)
    if (picks.length >= limit) break
  }
  if (picks.length === 0) {
    // fallback to popular order history
    const popular = customerOrderHistory.slice(0, limit).map(h => h.productName)
    return popular
  }
  return picks.slice(0, limit)
}

function simpleConfidence(score: number) {
  if (score > 0.85) return 'High'
  if (score > 0.6) return 'Medium'
  return 'Low'
}

export function promotionRecommendationAgent(input?: string | { simulate?: SimulateParams }) {
  // Build a baseline recommendation from active promotions and customer profile
  const audience = customerProfile.favoriteCategories || ['Chocolate Lovers']
  const recommendedProducts = pickTopProductsForAudience(audience, 3)

  const defaultPromotion = {
    promotionName: 'Seasonal Bundle Boost',
    targetAudience: `Customers who purchased ${audience.join(', ')} products recently`,
    recommendedProducts,
    promotionType: 'Bundle Promotions',
    expectedRevenueImpact: '+8%',
    confidenceScore: 'Medium',
    businessReasoning:
      'Customers with repeat purchases in these categories tend to respond well to bundled upsells; bundling increases AOV while reducing marketing friction.',
    estimatedROI: '12%',
  }

  // If there are active promotions that match customer preferences, prefer one
  const match = activePromotions.find(p => audience.some(a => p.category.includes(a.split(' ')[0])))
  const recommendation = match
    ? {
        promotionName: match.title,
        targetAudience: `Customers who buy ${match.category}`,
        recommendedProducts: pickTopProductsForAudience([match.category], 3),
        promotionType: 'Limited Time Offer',
        expectedRevenueImpact: `+${Math.round(match.estimatedSavings)}%`,
        confidenceScore: 'High',
        businessReasoning: match.reason,
        estimatedROI: `${Math.max(8, Math.round(match.estimatedSavings))}%`,
      }
    : defaultPromotion

  // Simulation support
  const simulate = (params: SimulateParams = {}) => {
    const { promotionType = 'Buy One Get One', productId, durationDays = 3 } = params
    const product = productId ? productCatalog.find(p => p.id === productId) : productCatalog.find(p => p.active)
    const baselineSales = product ? 100 * (1 + (product.price / 10)) : 100
    // Naive lift models per type
    const liftByType: Record<string, number> = {
      'Buy One Get One': 0.22,
      'Bundle Promotions': 0.12,
      'Family Packs': 0.15,
      'Loyalty Rewards': 0.08,
      'Limited Time Offers': 0.10,
      'Weekend Specials': 0.09,
      'Seasonal Campaigns': 0.11,
      'Holiday Campaigns': 0.14,
      'Subscription Promotions': 0.07,
      'Inventory Clearance Promotions': 0.18,
    }

    const lift = liftByType[promotionType] ?? 0.1
    const expectedSales = Math.round(baselineSales * (1 + lift))
    const revenueImpactPercent = Math.round(lift * 100)
    const avgPrice = product ? product.price : 5
    const revenueImpact = Math.round((expectedSales - baselineSales) * avgPrice)
    const profitImpact = Math.round(revenueImpact * 0.35)
    const inventoryConsumption = Math.round(expectedSales * 0.6)

    return {
      promotionType,
      product: product ? product.name : null,
      durationDays,
      expectedSales,
      revenueImpactPercent: `+${revenueImpactPercent}%`,
      revenueImpact: `$${revenueImpact}`,
      profitImpact: `$${profitImpact}`,
      inventoryConsumption: `${inventoryConsumption} units`,
      additionalIngredientsNeeded: inventoryConsumption > 200 ? ['Flour', 'Butter', 'Sugar'] : ['Butter'],
      promotionRiskLevel: revenueImpactPercent > 15 ? 'Medium' : 'Low',
      expectedParticipationRate: `${Math.round(lift * 100)}%`,
    }
  }

  // If input asks for simulation, attempt to detect
  if (typeof input === 'object' && input?.simulate) {
    return {
      recommendation,
      simulation: simulate(input.simulate),
    }
  }

  if (typeof input === 'string' && /what happens if|simulate|if I run|simulation|what if/i.test(input)) {
    // basic parse: look for product names or promo keywords
    return {
      recommendation,
      simulation: simulate({ promotionType: 'Buy One Get One' }),
    }
  }

  return { recommendation }
}
