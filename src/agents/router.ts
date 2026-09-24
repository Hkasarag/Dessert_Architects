import { type AgentIntent, type AgentRoute } from './types'
import { productRecommendationAgent } from './productRecommendationAgent'
import { promotionRecommendationAgent } from './promotionRecommendationAgent'
import { partyPlannerAgent } from './partyPlannerAgent'
import { franchiseReorderingAgent } from './franchiseReorderingAgent'
import { customerServiceAgent } from './customerServiceAgent'
import { cartOptimizationAgent } from './cartOptimizationAgent'
import { nutritionalAllergyAgent } from './nutritionalAllergyAgent'

export type UserRole = 'customer' | 'admin'

export function routeCustomerIntent(message: string): AgentRoute {
  const lower = message.toLowerCase()

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

  if (/cart|bundle|pair|upsell|add on|cross-sell|complementary|optimi[sz]e my cart|optimize my cart/.test(lower)) {
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

  if (/recommend|what desserts|what should i get|suggest|favorite|similar|dessert|recommend.*subscription|suggest.*subscription|reorder my last order|reorder my last/.test(lower)) {
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
    followUpQuestion: 'I can help with product recommendations, events, cart help, or dietary guidance. What would you like help with?',
  }
}

export function routeAdminIntent(message: string): AgentRoute {
  const lower = message.toLowerCase()

  if (/reorder|restock|inventory|stockout|what should i reorder|low stock|ingredients|purchase order|po|generate a purchase order/.test(lower)) {
    return {
      intent: 'franchise_reordering',
      agentName: 'FranchiseReorderingAgent',
      confidence: 0.97,
      rationale: 'The request is focused on stock and restocking decisions.',
    }
  }

  if (/deal|discount|promo|sale|special offer|coupon|forecast|roi|promotion|promote|promotion simulation/.test(lower)) {
    return {
      intent: 'promotion_recommendation',
      agentName: 'PromotionRecommendationAgent',
      confidence: 0.96,
      rationale: 'The admin is asking about promotions, forecasts, or ROI.',
    }
  }

  return {
    intent: 'clarification_required',
    agentName: 'OrchestratorAgent',
    confidence: 0.5,
    rationale: 'The admin message is ambiguous and needs a clarifying question.',
    followUpQuestion: 'I can help with inventory forecasting, promotions, or purchase orders. What would you like?',
  }
}

export function executeAgentByIntent(intent: AgentIntent, message: string, role: UserRole = 'customer') {
  // Define allowed intents per role
  const customerAllowed: AgentIntent[] = [
    'product_recommendation',
    'party_planning',
    'customer_service',
    'cart_optimization',
    'nutritional_allergy',
    'clarification_required',
  ]

  const adminAllowed: AgentIntent[] = ['franchise_reordering', 'promotion_recommendation', 'clarification_required']

  const isAllowed = role === 'admin' ? adminAllowed.includes(intent) : customerAllowed.includes(intent)

  if (!isAllowed) {
    if (role === 'customer') {
      return { message: 'This capability is only available in the Franchise Operations Assistant.' }
    }
    return { message: 'This capability is available in the Customer Dessert Concierge.' }
  }

  switch (intent) {
    case 'product_recommendation':
      return productRecommendationAgent(message)
    case 'promotion_recommendation':
      return promotionRecommendationAgent(message)
    case 'party_planning':
      return partyPlannerAgent(message)
    case 'franchise_reordering':
      return franchiseReorderingAgent(message)
    case 'customer_service':
      return customerServiceAgent(message)
    case 'cart_optimization':
      return cartOptimizationAgent(message)
    case 'nutritional_allergy':
      return nutritionalAllergyAgent(message)
    default:
      return {
        message: 'I need a little more detail to help with that request.',
      }
  }
}
export { AgentIntent }

