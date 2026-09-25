// Loyalty program rules, shared by the checkout page and the server.
export const LOYALTY = {
  /** Points earned per $1 of order total. Orders that redeem points earn none. */
  pointsPerDollar: 10,
  /** Dollar value of one point at checkout (100 points = $1.00). */
  pointValue: 0.01,
}

export const pointsEarnedFor = (orderTotal: number) => Math.floor(orderTotal * LOYALTY.pointsPerDollar)

/** Most points an amount can absorb, e.g. $12.34 -> 1234 points. */
export const maxPointsFor = (amount: number) => Math.max(0, Math.floor(Math.round(amount * 100) / 100 / LOYALTY.pointValue + 1e-9))
