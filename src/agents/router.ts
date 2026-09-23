import { type AgentIntent, type AgentRoute } from './types'
import { productRecommendationAgent } from './productRecommendationAgent'
import { promotionRecommendationAgent } from './promotionRecommendationAgent'
import { partyPlannerAgent } from './partyPlannerAgent'
import { franchiseReorderingAgent } from './franchiseReorderingAgent'
import { customerServiceAgent } from './customerServiceAgent'
import { cartOptimizationAgent } from './cartOptimizationAgent'
import { nutritionalAllergyAgent } from './nutritionalAllergyAgent'

export function routeUserIntent(message: string): AgentRoute {
  const lower = message.toLowerCase()

  if (/reorder|restock|inventory|stockout|what should i reorder|low stock/.test(lower)) {
    return {
      intent: 'franchise_reordering',
      agentName: 'FranchiseReorderingAgent',
      confidence: 0.97,
      rationale: 'The request is focused on stock and restocking decisions.',
    }
  }

  if (/deal|discount|promo|sale|special offer|coupon/.test(lower)) {
    return {
      intent: 'promotion_recommendation',
      agentName: 'PromotionRecommendationAgent',
      confidence: 0.96,
      rationale: 'The user is asking for active offers or discounts.',
    }
  }

  if (/birthday|wedding|corporate|baby shower|graduation|holiday|event|guest|party/.test(lower)) {
    return {
      intent: 'party_planning',
      agentName: 'PartyPlannerAgent',
      confidence: 0.95,
      rationale: 'The request is for an event-based dessert recommendation.',
    }
  }

  if (/where is my order|track my order|order status|cancel my order|refund|shipping|store hours|return/.test(lower)) {
    return {
      intent: 'customer_service',
      agentName: 'CustomerServiceAgent',
      confidence: 0.98,
      rationale: 'The request is about order fulfillment, support, or policy questions.',
    }
  }

  if (/cart|bundle|pair|upsell|add on|cross-sell|complementary/.test(lower)) {
    return {
      intent: 'cart_optimization',
      agentName: 'CartOptimizationAgent',
      confidence: 0.91,
      rationale: 'The user wants cart additions or complementary items.',
    }
  }

  if (/allergy|allergen|nut|peanut|dairy|gluten|vegan|dietary|avoid|restrictions/.test(lower)) {
    return {
      intent: 'nutritional_allergy',
      agentName: 'NutritionalAllergyAgent',
      confidence: 0.96,
      rationale: 'The request is about ingredient safety or dietary restrictions.',
    }
  }

  if (/recommend|what desserts|what should i get|suggest|favorite|similar|dessert/.test(lower)) {
    return {
      intent: 'product_recommendation',
      agentName: 'ProductRecommendationAgent',
      confidence: 0.93,
      rationale: 'The request is about dessert discovery and product recommendations.',
    }
  }

  return {
    intent: 'clarification_required',
    agentName: 'OrchestratorAgent',
    confidence: 0.5,
    rationale: 'The message is ambiguous and needs a clarifying question.',
    followUpQuestion: 'I can help with product recommendations, promotions, events, order support, or inventory. What would you like help with?',
  }
}

export function executeAgentByIntent(intent: AgentIntent, message: string) {
  switch (intent) {
    case 'product_recommendation':
      return productRecommendationAgent(message)
    case 'promotion_recommendation':
      return promotionRecommendationAgent()
    case 'party_planning':
      return partyPlannerAgent(message)
    case 'franchise_reordering':
      return franchiseReorderingAgent()
    case 'customer_service':
      return customerServiceAgent(message)
    case 'cart_optimization':
      return cartOptimizationAgent()
    case 'nutritional_allergy':
      return nutritionalAllergyAgent(message)
    default:
      return {
        message: 'I need a little more detail to help with that request.',
      }
  }
}
export { AgentIntent }

