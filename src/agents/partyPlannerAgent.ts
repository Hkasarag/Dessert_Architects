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
            : /holiday/.test(lower)
              ? 'Holiday Gathering'
              : 'Birthday'

  const guestCount = Number(guestCountMatch ? guestCountMatch[1] || guestCountMatch[2] || guestCountMatch[3] : 25)
  const budget = Number(budgetMatch ? budgetMatch[1] : 150)

  const recommendedOrder = {
    cakes: guestCount >= 20 ? 2 : 1,
    cupcakes: Math.max(12, guestCount),
    cookies: Math.max(20, guestCount * 2),
  }

  const estimatedTotal = Math.round((recommendedOrder.cakes * 42 + recommendedOrder.cupcakes * 3.99 + recommendedOrder.cookies * 2.99) * 100) / 100

  return {
    eventType,
    guestCount,
    budget,
    recommendedOrder,
    estimatedTotal: estimatedTotal > budget ? Number((budget * 0.92).toFixed(2)) : estimatedTotal,
  }
}
