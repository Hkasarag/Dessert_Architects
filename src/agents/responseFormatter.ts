import type { AgentRoute } from './types'

function joinLines(lines: string[]) { return lines.filter(Boolean).join('\n') }

export function formatAgentResponse(route: AgentRoute, result: any) {
  const intent = route.intent
  const lines: string[] = []

  if (intent === 'product_recommendation') {
    lines.push('Here are some desserts I recommend:')
    const items = result?.recommendedProducts ?? []
    for (const it of items) {
      lines.push(`• ${it.productName} — ${it.price ?? ''} ${it.message ? `\n  ${it.message}` : ''}`)
    }
    if (items.length === 0) lines.push('No strong matches found — try asking for a flavor or occasion.')
    return joinLines(lines)
  }

  if (intent === 'party_planning') {
    lines.push(`${result.eventType} plan for ${result.guestCount} guests.`)
    lines.push(`Budget: $${result.budget}`)
    if (result.suggestions && Array.isArray(result.suggestions)) {
      for (const s of result.suggestions) {
        lines.push(`\n${s.label}:`)
        for (const it of s.items) lines.push(`• ${it.name} — ${it.qty}`)
      }
    }
    if (result.estimatedTotal) lines.push(`\nEstimated total: $${result.estimatedTotal}`)
    if (result.followUp) lines.push(`\n${result.followUp}`)
    return joinLines(lines)
  }

  if (intent === 'cart_optimization') {
    lines.push('Cart optimization suggestions:')
    const recs = result?.recommendations ?? []
    for (const r of recs) lines.push(`• ${r.productName} — ${r.message}`)
    if (recs.length === 0) lines.push('No add-ons to suggest right now.')
    return joinLines(lines)
  }

  if (intent === 'nutritional_allergy') {
    if (result?.message) return result.message
    const safe = result?.safeProducts ?? []
    if (safe.length === 0) return 'No safe items found; please check with store staff.'
    lines.push('Safe options based on your specified allergen:')
    for (const s of safe) lines.push(`• ${s.productName} — ${s.reason}`)
    return joinLines(lines)
  }

  if (intent === 'customer_service') {
    if (result?.response) lines.push(result.response)
    if (result?.suggestions) {
      lines.push('\nSuggestions:')
      for (const s of result.suggestions) lines.push(`• ${s.name} — ${s.price} — ${s.description}`)
    }
    return joinLines(lines) || 'I can help with orders, shipping, returns, subscriptions, and store info.'
  }

  if (intent === 'promotion_recommendation') {
    const rec = result?.recommendation ?? result?.recommendedPromotion ?? result
    if (!rec) return 'No promotion recommendation available.'
    lines.push(`Promotion: ${rec.promotionName ?? rec.title ?? rec.promotionId ?? ''}`)
    if (rec.targetAudience) lines.push(`Target: ${rec.targetAudience}`)
    if (rec.recommendedProducts) lines.push(`Products: ${Array.isArray(rec.recommendedProducts) ? rec.recommendedProducts.join(', ') : rec.recommendedProducts}`)
    if (rec.promotionType) lines.push(`Type: ${rec.promotionType}`)
    if (rec.expectedRevenueImpact) lines.push(`Expected revenue impact: ${rec.expectedRevenueImpact}`)
    if (rec.estimatedROI) lines.push(`Estimated ROI: ${rec.estimatedROI}`)
    if (result.simulation) {
      lines.push('\nSimulation Results:')
      const sim = result.simulation
      lines.push(`• Expected sales: ${sim.expectedSales}`)
      lines.push(`• Revenue impact: ${sim.revenueImpact} (${sim.revenueImpactPercent})`)
      lines.push(`• Profit impact: ${sim.profitImpact}`)
      lines.push(`• Inventory consumption: ${sim.inventoryConsumption}`)
    }
    if (rec.businessReasoning) lines.push(`\nReasoning: ${rec.businessReasoning}`)
    return joinLines(lines)
  }

  // fallback
  if (typeof result === 'string') return result
  if (result && result.message) return result.message
  return 'I need a bit more detail to help with that — can you clarify your request?'
}

export default formatAgentResponse
