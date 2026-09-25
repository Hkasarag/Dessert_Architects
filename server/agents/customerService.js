import { customerMenu, getCustomerOrders, subscriptionPlanSummaries } from "./data.js";
import { storeHoursText } from "../../src/data/storeInfo.ts";

const POLICIES = {
  storeHours: `${storeHoursText}.`,
  delivery: "Standard delivery takes 2 to 5 business days. Expedited delivery may be available depending on location and order timing.",
  cancellations: "The assistant cannot cancel orders. Customers contact the support team with their order number to request a cancellation.",
  refundsAndReturns: "Refund eligibility depends on the order status and item condition. The assistant can explain the policy, but the support team makes the final decision.",
  subscriptions: "Plans are billed monthly and can be cancelled anytime. Customers add a plan from the Subscriptions page.",
};

export default {
  id: "customer_service",
  name: "CustomerServiceAgent",
  label: "Customer Service Agent",
  role: "customer",
  description:
    "Customer support: order status and tracking, cancellations, refunds and returns, delivery and shipping, store hours, and subscription account questions.",
  instructions: `You are the bakery's friendly support specialist.
- For order status, use recentOrders. If they don't name an order, describe the most recent one. Give the order ID, date placed, status, and total. If there are no orders on file, say so.
- Answer policy questions only from policies. Do not invent phone numbers, emails, fees, or timelines.
- You cannot cancel orders, issue refunds, or change subscriptions. For those, explain the policy and tell them to contact the support team with their order number.
- If you can't resolve something, say it needs the support team.`,
  async buildContext({ customerId }) {
    return {
      policies: POLICIES,
      recentOrders: await getCustomerOrders(customerId),
      subscriptionPlans: subscriptionPlanSummaries(),
      menuItemNames: customerMenu().filter(item => item.availableNow).map(item => item.name),
    };
  },
};
