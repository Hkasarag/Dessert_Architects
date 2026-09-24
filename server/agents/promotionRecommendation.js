import { adminMenu, configuredPromotions, findMenuItem, getSalesSummary } from "./data.js";

// Naive sales-lift assumptions per promotion type (carried over from the original rule-based agent).
const LIFT_BY_TYPE = {
  "Buy One Get One": 0.22,
  "Bundle Promotions": 0.12,
  "Family Packs": 0.15,
  "Loyalty Rewards": 0.08,
  "Limited Time Offers": 0.1,
  "Weekend Specials": 0.09,
  "Seasonal Campaigns": 0.11,
  "Holiday Campaigns": 0.14,
  "Subscription Promotions": 0.07,
  "Inventory Clearance Promotions": 0.18,
};

const simulatePromotion = ({ promotionType, productName, durationDays }) => {
  const product = findMenuItem(productName);
  if (!product) {
    return { error: `"${productName}" is not on the menu.` };
  }

  const lift = LIFT_BY_TYPE[promotionType] ?? 0.1;
  const baselineUnits = Math.round(100 * (1 + product.price / 10));
  const expectedUnits = Math.round(baselineUnits * (1 + lift));
  const extraUnits = expectedUnits - baselineUnits;
  const revenueImpact = Math.round(extraUnits * product.price);
  const profitImpact = Math.round(extraUnits * (product.price - product.unitCost));
  const inventoryConsumption = Math.round(expectedUnits * 0.6);

  return {
    model: "Rough planning estimate from fixed lift assumptions, not a forecast from sales history.",
    promotionType,
    product: product.name,
    durationDays,
    baselineUnits,
    expectedUnits,
    revenueImpactPercent: `+${Math.round(lift * 100)}%`,
    revenueImpact: `$${revenueImpact}`,
    profitImpact: `$${profitImpact}`,
    inventoryConsumption: `${inventoryConsumption} units`,
    additionalIngredientsNeeded: inventoryConsumption > 200 ? ["Flour", "Butter", "Sugar"] : ["Butter"],
    riskLevel: lift > 0.15 ? "Medium" : "Low",
  };
};

export default {
  id: "promotion_recommendation",
  name: "PromotionRecommendationAgent",
  label: "Promotion Recommendation Agent",
  role: "admin",
  description:
    "Promotions and revenue: recommends deals, discounts, bundles, and seasonal campaigns, simulates what-if promotion outcomes, and estimates ROI.",
  instructions: `You help the franchise owner plan profitable promotions.
- When recommending a promotion, give its name, the target audience, 1 to 3 products, the promotion type, and the business reasoning.
- Base recommendations on the data: marginPercent (higher margin can absorb a discount), salesSummary (best and slow sellers), what is availableNow, and the current season.
- Prefer building on an existing active promotion in configuredPromotions when one fits.
- For any expected impact, ROI, or what-if question, call simulate_promotion and use its numbers. Never invent figures. Always say they are rough estimates.
- If salesSummary is unavailable or has few orders, say the recommendation relies on margins and seasonality rather than sales history.`,
  async buildContext() {
    return {
      menu: adminMenu(),
      configuredPromotions: configuredPromotions(),
      salesSummary: await getSalesSummary(),
    };
  },
  tools: [
    {
      name: "simulate_promotion",
      description: "Estimates sales, revenue, profit, and ingredient impact of running a promotion on one menu item.",
      parameters: {
        type: "object",
        properties: {
          promotionType: { type: "string", enum: Object.keys(LIFT_BY_TYPE) },
          productName: { type: "string", description: "Exact menu item name." },
          durationDays: { type: "integer", description: "Length of the promotion in days. Use 7 if not specified." },
        },
        required: ["promotionType", "productName", "durationDays"],
        additionalProperties: false,
      },
      handler: simulatePromotion,
    },
  ],
};
