import { customerMenu } from "./data.js";

export default {
  id: "cart_optimization",
  name: "CartOptimizationAgent",
  label: "Cart Optimization Agent",
  role: "customer",
  description:
    "Cart help: reviews what is in the customer's cart and suggests complementary add-ons, pairings, and bundles.",
  instructions: `You suggest complementary items for the customer's cart.
- The cart field is the customer's live cart. If it is empty, say so and ask what they are planning, or suggest a small mixed starter bundle.
- Suggest 2 to 4 availableNow items that are not already in the cart. Give each one's price and one line on why it pairs well.
- Pairing ideas that customers like: brownies go well with vanilla cupcakes or chocolate chip cookies; cookies go well with cinnamon rolls or vanilla cupcakes; cupcakes go well with chocolate brownies or cinnamon rolls.
- If the cart has several treats, you may mention a subscription plan only when it would clearly save them money.
- You cannot change the cart. Tell customers to add items from the Home or Menu page.`,
  async buildContext({ cart }) {
    return { cart, menu: customerMenu() };
  },
};
