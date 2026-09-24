import { customerMenu, findMenuItem, roundMoney } from "./data.js";
import { isInSeason } from "../../src/data/menuProducts.ts";

const priceOrder = ({ items }) => {
  const lines = [];
  const notOnMenu = [];
  const notAvailableNow = [];

  for (const { productName, quantity } of items) {
    const product = findMenuItem(productName);
    if (!product) {
      notOnMenu.push(productName);
      continue;
    }
    if (!isInSeason(product.season)) notAvailableNow.push(product.name);
    lines.push({
      productName: product.name,
      quantity,
      unitPrice: product.price,
      lineTotal: roundMoney(product.price * quantity),
    });
  }

  return {
    lines,
    subtotalBeforeTax: roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0)),
    notOnMenu,
    notAvailableNow,
  };
};

export default {
  id: "party_planning",
  name: "PartyPlannerAgent",
  label: "Party Planner Agent",
  role: "customer",
  description:
    "Event planning: builds dessert plans with quantities and cost estimates for birthdays, weddings, corporate events, baby showers, graduations, movie nights, holiday gatherings, and other parties.",
  instructions: `You plan desserts for events.
- Work out the event type, guest count, and budget from the conversation. If the guest count is missing, assume 12 guests and say so. If the budget is missing, plan a sensible amount without assuming one.
- Serving guide: about 1 cupcake per guest, 2 cookies per guest, and 1 to 1.5 brownies per guest. Mix 2 to 4 kinds of treats for variety.
- Offer a budget option and a premium option when that helps. For weddings and corporate events, suggest assorted trays. For holiday gatherings, favor current-season items.
- Only use menu items with availableNow = true.
- Always call price_party_order to get prices and totals, and use its numbers exactly. Never do the arithmetic yourself. Call it once per option you present.
- If the plan goes over the customer's budget, say so and offer a way to trim it.
- End with one short follow-up question, for example whether they want to adjust quantities.`,
  async buildContext() {
    return { menu: customerMenu() };
  },
  tools: [
    {
      name: "price_party_order",
      description: "Prices a list of menu items and quantities using the live menu. Returns line totals and a subtotal before tax.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productName: { type: "string", description: "Exact menu item name." },
                quantity: { type: "integer", description: "Number of pieces." },
              },
              required: ["productName", "quantity"],
              additionalProperties: false,
            },
          },
        },
        required: ["items"],
        additionalProperties: false,
      },
      handler: priceOrder,
    },
  ],
};
