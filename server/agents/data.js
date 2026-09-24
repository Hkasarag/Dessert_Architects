// Grounding data for the AI agents.
//
// The frontend's data modules are the single source of truth for the menu, ingredients,
// and subscription plans. Node imports these .ts files directly (type stripping, Node 22.18+).
// Each agent only receives the slices it is allowed to see: customer agents never get
// costs, sales, or inventory.
import { menuProducts, getCurrentSeason, isInSeason } from "../../src/data/menuProducts.ts";
import { ingredientProducts } from "../../src/data/IngredientProducts.ts";
import { subscriptionPlans } from "../../src/data/subscriptionPlans.ts";
import { featuredPromotions, promoCodes } from "../../src/data/promotions.ts";
import { menuDataset } from "../../src/agents/menuDataset.ts";
import { activePromotions } from "../../src/agents/types.ts";
import db from "../db/connection.js";

const DB_TIMEOUT_MS = 4000;

/** Strips the decorative emoji the UI puts in front of product names. */
export const cleanProductName = name => name.replace(/[^\p{L}\p{N}\s'&-]/gu, "").replace(/\s+/g, " ").trim();

const normalize = name => cleanProductName(name).toLowerCase();

// Allergen and dietary details come from the agent menu dataset, matched by product name.
const allergenInfoByName = new Map(menuDataset.map(item => [normalize(item.name), item]));

const MENU = menuProducts.map(product => {
  const info = allergenInfoByName.get(normalize(product.name));
  return {
    productId: product.id,
    name: cleanProductName(product.name),
    category: product.cat,
    // Cookies, Brownies, Cupcakes, or Other. Seasonal items keep their underlying type here.
    productType: info ? info.category : null,
    description: product.desc,
    price: product.price,
    unitCost: product.unitCost,
    season: product.season,
    // null means "no allergen data on file", which is different from "no allergens".
    allergens: info ? info.allergens : null,
    dietary: info ? info.dietary : [],
  };
});

export const currentSeason = () => getCurrentSeason();

export const today = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

export const roundMoney = value => Math.round(value * 100) / 100;

/** Menu as customers see it: no costs or margins. */
export const customerMenu = () =>
  MENU.map(({ unitCost, ...item }) => ({ ...item, availableNow: isInSeason(item.season) }));

/** Menu with cost and margin data for franchise admins. */
export const adminMenu = () =>
  MENU.map(item => ({
    ...item,
    availableNow: isInSeason(item.season),
    unitMargin: roundMoney(item.price - item.unitCost),
    marginPercent: Math.round(((item.price - item.unitCost) / item.price) * 100),
  }));

export const findMenuItem = name => {
  const target = normalize(name);
  return MENU.find(item => normalize(item.name) === target)
    ?? MENU.find(item => normalize(item.name).includes(target) || target.includes(normalize(item.name)));
};

export const subscriptionPlanSummaries = () =>
  subscriptionPlans.map(plan => ({
    name: plan.name,
    pricePerMonth: plan.price,
    tagline: plan.savings,
    perks: plan.perks,
    mostPopular: plan.popular,
  }));

export const configuredPromotions = () => activePromotions;

/** Promotions customers can see and redeem: Home page bundles plus checkout promo codes. */
export const customerPromotions = () => {
  const featuredCodes = new Set(featuredPromotions.map(promo => promo.code));
  return {
    featuredBundles: featuredPromotions.map(promo => ({
      name: promo.name,
      description: promo.description,
      bundlePrice: promo.price,
      discount: promo.discount,
      promoCode: promo.code,
      howToGet: "Add it from the Featured Promotions section on the Home page, then enter the code at checkout.",
    })),
    otherPromoCodes: Object.entries(promoCodes)
      .filter(([code]) => !featuredCodes.has(code))
      .map(([code, promo]) => ({ promoCode: code, offer: promo.label })),
  };
};

// Same thresholds as the Inventory page's stockStatus().
const stockStatus = item => {
  const ratio = item.currentStock / item.parLevel;
  if (ratio <= 0.3) return "Critical";
  if (ratio < 1) return "Low";
  return "Good";
};

/** Current ingredient stock plus a deterministic reorder plan (restock to max level). */
export const inventorySnapshot = () => {
  const items = ingredientProducts.map(item => ({
    ingredient: item.name,
    category: item.category,
    unit: item.unit,
    currentStock: item.currentStock,
    parLevel: item.parLevel,
    maxLevel: item.maxLevel,
    status: stockStatus(item),
    unitCost: item.unitCost,
    supplier: item.supplier,
    lastRestocked: item.lastRestocked,
    shelfLifeDays: item.expiryDays,
  }));

  const statusRank = { Critical: 0, Low: 1 };
  const reorderLines = items
    .filter(item => item.status !== "Good")
    .sort((a, b) => statusRank[a.status] - statusRank[b.status] || a.currentStock / a.parLevel - b.currentStock / b.parLevel)
    .map(item => {
      const quantity = item.maxLevel - item.currentStock;
      return {
        ingredient: item.ingredient,
        status: item.status,
        currentStock: item.currentStock,
        parLevel: item.parLevel,
        suggestedQuantity: quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        estimatedCost: roundMoney(quantity * item.unitCost),
        supplier: item.supplier,
        shelfLifeDays: item.shelfLifeDays,
      };
    });

  const bySupplier = new Map();
  for (const line of reorderLines) {
    const entry = bySupplier.get(line.supplier) ?? { supplier: line.supplier, lines: 0, estimatedCost: 0 };
    entry.lines += 1;
    entry.estimatedCost = roundMoney(entry.estimatedCost + line.estimatedCost);
    bySupplier.set(line.supplier, entry);
  }

  return {
    reorderPlan: {
      method: "Items below par level, restocked up to max level.",
      lines: reorderLines,
      totalsBySupplier: [...bySupplier.values()],
      grandTotal: roundMoney(reorderLines.reduce((sum, line) => sum + line.estimatedCost, 0)),
    },
    inventory: items,
  };
};

/** Resolves to `fallback` if MongoDB is unreachable or slow, so chat never hangs on the database. */
const safeQuery = async (label, query, fallback) => {
  let timer;
  try {
    return await Promise.race([
      query(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("timed out")), DB_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    console.warn(`Agent data: could not load ${label}:`, error.message);
    return fallback;
  } finally {
    clearTimeout(timer);
  }
};

/** The signed-in customer's most recent orders (customerId is the username). */
export const getCustomerOrders = async (customerId, limit = 10) => {
  if (!customerId) return [];
  return safeQuery("customer orders", async () => {
    const orders = await db.collection("orders")
      .find({ customerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return orders.map(order => ({
      orderId: order.orderId,
      placedOn: order.createdAt,
      status: order.status,
      total: order.total,
      subscriptionType: order.subscriptionType,
      items: (order.items ?? []).map(item => ({
        productName: cleanProductName(item.productName ?? ""),
        quantity: item.quantity,
      })),
    }));
  }, []);
};

/**
 * The customer's order history plus a per-product summary, so the model can see
 * favorites and buying patterns without tallying orders itself.
 */
export const getCustomerPurchaseHistory = async (customerId, limit = 50) => {
  const empty = { totalOrders: 0, productsPurchased: [], productTypeTotals: [], recentOrders: [] };
  if (!customerId) return empty;

  return safeQuery("customer purchase history", async () => {
    const orders = await db.collection("orders")
      .find({ customerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    if (orders.length === 0) return empty;

    const products = new Map();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const name = cleanProductName(item.productName ?? "");
        if (!name) continue;
        const menuItem = findMenuItem(name);
        const entry = products.get(name) ?? {
          productName: name,
          onMenu: Boolean(menuItem),
          productType: menuItem?.productType ?? "Bundle or subscription",
          totalQuantity: 0,
          timesOrdered: 0,
          lastOrderedAt: order.createdAt,
        };
        entry.totalQuantity += Number(item.quantity) || 0;
        entry.timesOrdered += 1;
        if (order.createdAt > entry.lastOrderedAt) entry.lastOrderedAt = order.createdAt;
        products.set(name, entry);
      }
    }

    const productsPurchased = [...products.values()].sort((a, b) => b.totalQuantity - a.totalQuantity);
    const typeTotals = new Map();
    for (const product of productsPurchased) {
      typeTotals.set(product.productType, (typeTotals.get(product.productType) ?? 0) + product.totalQuantity);
    }

    return {
      totalOrders: orders.length,
      firstOrderAt: orders.at(-1).createdAt,
      lastOrderAt: orders[0].createdAt,
      productsPurchased,
      productTypeTotals: [...typeTotals.entries()]
        .map(([productType, totalQuantity]) => ({ productType, totalQuantity }))
        .sort((a, b) => b.totalQuantity - a.totalQuantity),
      recentOrders: orders.slice(0, 5).map(order => ({
        placedOn: order.createdAt,
        items: (order.items ?? []).map(item => ({ productName: cleanProductName(item.productName ?? ""), quantity: item.quantity })),
      })),
    };
  }, { ...empty, note: "Order history could not be loaded right now." });
};

/** Sales totals per product across recorded customer orders. */
export const getSalesSummary = async () =>
  safeQuery("sales summary", async () => {
    const [products, totals] = await Promise.all([
      db.collection("orders").aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productName",
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] } },
            cost: { $sum: { $multiply: ["$items.quantity", "$items.unitCost"] } },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 25 },
      ]).toArray(),
      db.collection("orders").aggregate([
        { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: "$total" }, first: { $min: "$createdAt" }, last: { $max: "$createdAt" } } },
      ]).toArray(),
    ]);
    const summary = totals[0];
    return {
      orderCount: summary?.orders ?? 0,
      totalRevenue: roundMoney(summary?.revenue ?? 0),
      firstOrderAt: summary?.first ?? null,
      lastOrderAt: summary?.last ?? null,
      productsByUnitsSold: products.map(p => ({
        productName: cleanProductName(p._id ?? ""),
        unitsSold: p.unitsSold,
        revenue: roundMoney(p.revenue),
        grossProfit: roundMoney(p.revenue - p.cost),
      })),
    };
  }, { unavailable: true, note: "Sales data could not be loaded from the database." });

/** Latest ingredient purchase orders already submitted to HQ. */
export const getRecentPurchaseOrders = async (limit = 5) =>
  safeQuery("recent purchase orders", async () => {
    const transactions = await db.collection("inventory")
      .find({ transactionType: "Purchase" })
      .sort({ transactionDate: -1 })
      .limit(limit)
      .toArray();
    return transactions.map(tx => ({
      transactionId: tx.inventoryTransactionId,
      date: tx.transactionDate,
      totalCost: tx.totalCost,
      items: (tx.lineItems ?? []).map(line => ({ ingredient: line.ingredientName, quantity: line.quantity, unit: line.unitOfMeasure })),
    }));
  }, []);
