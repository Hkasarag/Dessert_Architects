import db from "./db/connection.js";
import { LOYALTY, maxPointsFor, pointsEarnedFor } from "../src/data/loyalty.ts";

export { LOYALTY, maxPointsFor, pointsEarnedFor };

// Orders placed before loyalty tracking have no loyalty fields; they earned points on their total.
const earnedFor = order =>
  Number.isFinite(order.loyaltyPointsEarned)
    ? order.loyaltyPointsEarned
    : (order.loyaltyPointsRedeemed ?? 0) > 0 ? 0 : pointsEarnedFor(Number(order.total) || 0);

/** A customer's point balance, derived from their order history. */
export async function getLoyaltySummary(customerId) {
  if (!customerId) return { customerId, balance: 0, earned: 0, redeemed: 0 };
  const orders = await db.collection("orders")
    .find({ customerId }, { projection: { total: 1, loyaltyPointsEarned: 1, loyaltyPointsRedeemed: 1 } })
    .toArray();

  let earned = 0;
  let redeemed = 0;
  for (const order of orders) {
    earned += earnedFor(order);
    redeemed += Number(order.loyaltyPointsRedeemed) || 0;
  }
  return { customerId, balance: Math.max(0, earned - redeemed), earned, redeemed };
}
