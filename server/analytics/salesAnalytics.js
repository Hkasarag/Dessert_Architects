// Monthly business analytics computed from the store's sales CSV (server/sales_data).
// The CSV is parsed once on first use and kept in memory. Month details are cached.
import fs from "node:fs";
import csv from "csv-parser";
import { menuProducts } from "../../src/data/menuProducts.ts";
import { ingredientProducts } from "../../src/data/IngredientProducts.ts";
import { subscriptionPlans } from "../../src/data/subscriptionPlans.ts";
import { RECIPE_USAGE } from "./recipeUsage.js";

const SALES_DIR = new URL("../sales_data/", import.meta.url);
const TREND_MONTHS = 12;
const USAGE_WINDOW_DAYS = 28;
const LOW_COVER_DAYS = 14;
const MYSTERY_BOX_ID = "MYS-001";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Clean display names for the CSV's ProductIDs (the CSV has typos and plural names).
const PRODUCT_NAMES = {
  "BR-001": "Chocolate Brownie", "BR-002": "Walnut Brownie", "BR-003": "Peppermint Mocha Brownie",
  "BR-004": "Pumpkin Brownie", "BR-005": "Strawberry Blondie", "BR-006": "Smores Brownie",
  "CK-001": "Chocolate Chip Cookie", "CK-002": "Snickerdoodle Cookie", "CK-003": "Oatmeal Cookie",
  "CK-004": "Chocolate Chunk Pretzel Cookie", "CK-005": "Gingerbread Cookie", "CK-006": "Almond Fudge Cookie",
  "CK-007": "Peach Cobbler Sugar Cookie", "CP-001": "Vanilla Cupcake", "CP-002": "Chocolate Cupcake",
  "CP-003": "Lemon Cupcake", "CP-004": "Carrot Cupcake", "CP-005": "Peppermint Chocolate Cupcake",
  "CP-006": "Toasted Coconut Cupcake", "CP-007": "Blueberry Cupcake", "CR-001": "Cinnamon Roll",
  "MF-001": "Vegan Banana Bread Muffin", "MYS-001": "Mystery Box Item",
};

// The CSV's "Subscription Member" values mapped to the app's plan names.
const PLAN_BY_TIER = {
  Basic: subscriptionPlans.find(p => p.id === "basic"),
  "Mystery Box": subscriptionPlans.find(p => p.id === "mystery"),
  Family: subscriptionPlans.find(p => p.id === "family"),
};

const cleanName = name => name.replace(/[^\p{L}\p{N}\s'&-]/gu, "").trim();
const PRODUCT_SEASON = new Map(menuProducts.map(p => [cleanName(p.name), p.season]));

const round = (value, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;
const pctChange = (current, previous) => (previous > 0 ? round(((current - previous) / previous) * 100, 1) : null);
const pad = n => String(n).padStart(2, "0");
const monthKey = (year, month) => `${year}-${pad(month)}`;
const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
const shiftMonth = (key, delta) => {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return monthKey(date.getFullYear(), date.getMonth() + 1);
};
const monthLabel = key => {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
};
const shortMonthLabel = key => {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${String(y).slice(2)}`;
};
const seasonOfMonth = month => (month >= 3 && month <= 5 ? "Spring" : month >= 6 && month <= 8 ? "Summer" : month >= 9 && month <= 11 ? "Fall" : "Winter");
const formatMoney = value => `$${Math.round(value).toLocaleString("en-US")}`;
const formatDate = iso => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y}`;
};
const addDays = (iso, days) => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** Picks the newest sales CSV in server/sales_data (file names end with the export date). */
const latestSalesFile = () => {
  const files = fs.readdirSync(SALES_DIR).filter(name => name.toLowerCase().endsWith(".csv")).sort();
  if (files.length === 0) throw new Error("No sales CSV found in server/sales_data.");
  return { name: files.at(-1), url: new URL(files.at(-1), SALES_DIR) };
};

const parseRow = row => {
  const [month, day, year] = row.TransactionDate.split("/").map(Number);
  return {
    date: `${year}-${pad(month)}-${pad(day)}`,
    month: monthKey(year, month),
    orderId: row.OrderID,
    customerId: row.CustomerID,
    tier: row["Subscription Member"],
    productId: row.ProductID,
    productName: PRODUCT_NAMES[row.ProductID] ?? cleanName(row.ProductName),
    quantity: Number(row.QuantitySold),
    revenue: Number(row.Revenue),
    profit: Number(row.Profit),
  };
};

const loadDataset = () =>
  new Promise((resolve, reject) => {
    const file = latestSalesFile();
    const rows = [];
    fs.createReadStream(file.url)
      .pipe(csv())
      .on("data", row => rows.push(parseRow(row)))
      .on("error", reject)
      .on("end", () => {
        rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

        const firstPurchase = new Map();
        const monthRanges = new Map();
        rows.forEach((row, index) => {
          if (!firstPurchase.has(row.customerId)) firstPurchase.set(row.customerId, row.date);
          const range = monthRanges.get(row.month) ?? { start: index, end: index };
          range.end = index;
          monthRanges.set(row.month, range);
        });

        resolve({
          fileName: file.name,
          rows,
          firstPurchase,
          monthRanges,
          firstDate: rows[0].date,
          lastDate: rows.at(-1).date,
        });
      });
  });

let datasetPromise = null;
const getDataset = () => {
  datasetPromise ??= loadDataset().catch(error => {
    datasetPromise = null;
    throw error;
  });
  return datasetPromise;
};

/** Rows for a month, optionally limited to days 1..throughDay. */
const monthRows = (dataset, key, throughDay = 31) => {
  const range = dataset.monthRanges.get(key);
  if (!range) return [];
  const limit = `${key}-${pad(throughDay)}`;
  return dataset.rows.slice(range.start, range.end + 1).filter(row => row.date <= limit);
};

const summarize = (dataset, rows) => {
  const orders = new Set();
  const customers = new Set();
  const newCustomers = new Set();
  const products = new Map();
  const subscribersByTier = new Map();
  let revenue = 0;
  let profit = 0;
  let subscriberRevenue = 0;

  const start = rows[0]?.date;
  const end = rows.at(-1)?.date;
  for (const row of rows) {
    revenue += row.revenue;
    profit += row.profit;
    orders.add(row.orderId);
    customers.add(row.customerId);
    const first = dataset.firstPurchase.get(row.customerId);
    if (first >= start && first <= end) newCustomers.add(row.customerId);

    if (row.tier !== "None") {
      subscriberRevenue += row.revenue;
      const set = subscribersByTier.get(row.tier) ?? new Set();
      set.add(row.customerId);
      subscribersByTier.set(row.tier, set);
    }

    const product = products.get(row.productId) ?? { productId: row.productId, name: row.productName, units: 0, revenue: 0 };
    product.units += row.quantity;
    product.revenue += row.revenue;
    products.set(row.productId, product);
  }

  const subscriberCount = [...subscribersByTier.values()].reduce((sum, set) => sum + set.size, 0);
  return {
    revenue: round(revenue),
    profit: round(profit),
    orders: orders.size,
    customers: customers.size,
    newCustomers: newCustomers.size,
    returningCustomers: customers.size - newCustomers.size,
    subscribers: subscriberCount,
    subscriberRevenue: round(subscriberRevenue),
    subscribersByTier: new Map([...subscribersByTier].map(([tier, set]) => [tier, set.size])),
    // The Mystery Box Item is a free subscription perk, not a menu product.
    products: [...products.values()]
      .filter(p => p.productId !== MYSTERY_BOX_ID)
      .map(p => ({ ...p, revenue: round(p.revenue) }))
      .sort((a, b) => b.units - a.units),
  };
};

/** Estimated ingredient runout from the last 28 days of sales and the recipe assumptions. */
const buildInventory = dataset => {
  const windowStart = addDays(dataset.lastDate, -(USAGE_WINDOW_DAYS - 1));
  const usage = new Map();
  for (const row of dataset.rows) {
    if (row.date < windowStart) continue;
    for (const [ingredient, perUnit] of Object.entries(RECIPE_USAGE[row.productId] ?? {})) {
      usage.set(ingredient, (usage.get(ingredient) ?? 0) + perUnit * row.quantity);
    }
  }

  const inRecipes = new Set(Object.values(RECIPE_USAGE).flatMap(Object.keys));
  const rows = ingredientProducts.map(item => {
    const ratio = item.currentStock / item.parLevel;
    const status = ratio <= 0.3 ? "Critical" : ratio < 1 ? "Low" : "Good";
    const dailyUsage = (usage.get(item.name) ?? 0) / USAGE_WINDOW_DAYS;
    // null cover: nothing using this ingredient sold recently (seasonal) or no product uses it.
    const daysOfCover = dailyUsage > 0 ? Math.floor(item.currentStock / dailyUsage) : null;
    return {
      ingredient: item.name,
      currentStock: item.currentStock,
      unit: item.unit,
      parLevel: item.parLevel,
      dailyUsage: round(dailyUsage, 2),
      daysOfCover,
      runoutDate: daysOfCover === null ? null : addDays(dataset.lastDate, daysOfCover),
      usageNote: daysOfCover !== null ? null : inRecipes.has(item.name) ? "No sales using it in the last 28 days" : "Not used by products in the sales data",
      status,
      needsReorder: status !== "Good" || (daysOfCover !== null && daysOfCover < LOW_COVER_DAYS),
    };
  });

  const statusRank = { Critical: 0, Low: 1, Good: 2 };
  const cover = row => row.daysOfCover ?? Number.POSITIVE_INFINITY;
  rows.sort((a, b) => statusRank[a.status] - statusRank[b.status] || cover(a) - cover(b));

  const alerts = rows.filter(r => r.needsReorder).length;
  const critical = rows.some(r => r.status === "Critical" || (r.daysOfCover !== null && r.daysOfCover < 7));
  return {
    asOf: dataset.lastDate,
    usageWindowDays: USAGE_WINDOW_DAYS,
    health: critical ? "At Risk" : alerts > 0 ? "Fair" : "Good",
    alerts,
    rows,
  };
};

const buildInsights = ({ key, current, comparison, comparisonLabel, lastYear, partial, dataset, inventory, throughDay }) => {
  const [year, month] = key.split("-").map(Number);
  const insights = [];

  // 1. Revenue versus the same period last year (or last month for the first year of data).
  const yoy = lastYear ? pctChange(current.revenue, lastYear.revenue) : null;
  if (yoy !== null) {
    insights.push({
      icon: yoy >= 0 ? "📈" : "📉",
      type: yoy >= 0 ? "positive" : "warning",
      text: `Revenue of ${formatMoney(current.revenue)} is ${yoy >= 0 ? "up" : "down"} ${Math.abs(yoy)}% from ${partial ? "the same days of " : ""}${monthLabel(shiftMonth(key, -12))} (${formatMoney(lastYear.revenue)}).`,
    });
  } else {
    const mom = pctChange(current.revenue, comparison.revenue);
    if (mom !== null) {
      insights.push({
        icon: mom >= 0 ? "📈" : "📉",
        type: mom >= 0 ? "positive" : "warning",
        text: `Revenue of ${formatMoney(current.revenue)} is ${mom >= 0 ? "up" : "down"} ${Math.abs(mom)}% ${comparisonLabel}.`,
      });
    }
  }

  // 2. Top product momentum.
  const top = current.products[0];
  if (top) {
    const before = comparison.products.find(p => p.productId === top.productId)?.units ?? 0;
    const change = pctChange(top.units, before);
    insights.push({
      icon: "🏆",
      type: change === null || change >= 0 ? "positive" : "warning",
      text: change === null
        ? `${top.name} was the best seller with ${top.units} sold.`
        : `${top.name} led sales with ${top.units} sold, ${change >= 0 ? "up" : "down"} ${Math.abs(change)}% ${comparisonLabel}.`,
    });
  }

  // 3. Seasonal items for this month's season.
  const season = seasonOfMonth(month);
  const seasonal = current.products.filter(p => PRODUCT_SEASON.get(p.name) === season);
  if (seasonal.length > 0 && current.revenue > 0) {
    const seasonalRevenue = seasonal.reduce((sum, p) => sum + p.revenue, 0);
    insights.push({
      icon: { Spring: "🌸", Summer: "☀️", Fall: "🍂", Winter: "❄️" }[season],
      type: "positive",
      text: `${season} seasonal items brought in ${Math.round((seasonalRevenue / current.revenue) * 100)}% of revenue, led by ${seasonal[0].name} (${seasonal[0].units} sold).`,
    });
  }

  // 4. Subscribers.
  if (current.customers > 0) {
    const share = Math.round((current.subscriberRevenue / current.revenue) * 100);
    const topTier = [...current.subscribersByTier.entries()].sort((a, b) => b[1] - a[1])[0];
    const change = pctChange(current.subscribers, comparison.subscribers);
    insights.push({
      icon: "📦",
      type: change === null || change >= 0 ? "positive" : "warning",
      text: `${current.subscribers} subscribers ordered (${change === null ? "no prior data" : `${change >= 0 ? "+" : ""}${change}% ${comparisonLabel}`}), driving ${share}% of revenue.${topTier ? ` ${PLAN_BY_TIER[topTier[0]]?.name ?? topTier[0]} is the most popular plan.` : ""}`,
    });
  }

  // 5. Inventory: the soonest estimated runout.
  const soonest = inventory.rows.filter(r => r.daysOfCover !== null).sort((a, b) => a.daysOfCover - b.daysOfCover)[0];
  if (soonest) {
    const urgent = soonest.daysOfCover < 21;
    insights.push({
      icon: urgent ? "⚠️" : "✅",
      type: urgent ? "warning" : "positive",
      text: urgent
        ? `${soonest.ingredient} may run out in about ${soonest.daysOfCover} days (${formatDate(soonest.runoutDate)}) at the current pace. Reorder soon.`
        : `Current stock covers recent demand for at least ${soonest.daysOfCover} days. ${soonest.ingredient} will run out first, around ${formatDate(soonest.runoutDate)}.`,
    });
  }

  // 6. Next month: a seasonal forecast for the latest month, or the actual result for past months.
  const nextKey = shiftMonth(key, 1);
  if (dataset.monthRanges.has(nextKey)) {
    const next = summarize(dataset, monthRows(dataset, nextKey));
    const change = pctChange(next.revenue, current.revenue);
    insights.push({
      icon: "🔮",
      type: "forecast",
      text: `What happened next: ${monthLabel(nextKey)} revenue came in at ${formatMoney(next.revenue)}${change === null ? "" : `, ${change >= 0 ? "up" : "down"} ${Math.abs(change)}% from this month`}.`,
    });
  } else {
    const fullMonthRevenue = partial ? (current.revenue / throughDay) * daysInMonth(year, month) : current.revenue;
    const lastYearThis = summarize(dataset, monthRows(dataset, shiftMonth(key, -12))).revenue;
    const lastYearNext = summarize(dataset, monthRows(dataset, shiftMonth(key, -11))).revenue;
    if (lastYearThis > 0 && lastYearNext > 0) {
      const forecast = fullMonthRevenue * (lastYearNext / lastYearThis);
      const change = pctChange(forecast, fullMonthRevenue);
      insights.push({
        icon: "🔮",
        type: "forecast",
        text: `Forecast: about ${formatMoney(forecast)} in ${monthLabel(nextKey)} (${change >= 0 ? "+" : ""}${change}% vs this month${partial ? "'s projected total" : ""}), based on last year's seasonal pattern. Plan staffing and stock accordingly.`,
      });
    }
  }

  return insights;
};

const detailCache = new Map();

/** Analytics for one month (YYYY-MM). Defaults to the latest month in the data. */
export async function getSalesAnalytics(requestedKey) {
  const dataset = await getDataset();
  const monthKeys = [...dataset.monthRanges.keys()].sort();
  const key = requestedKey && dataset.monthRanges.has(requestedKey) ? requestedKey : monthKeys.at(-1);
  if (detailCache.has(key)) return detailCache.get(key);

  const [year, month] = key.split("-").map(Number);
  const isLatest = key === monthKeys.at(-1);
  const lastDay = Number(monthRows(dataset, key).at(-1).date.slice(8));
  const partial = isLatest && lastDay < daysInMonth(year, month);
  const throughDay = partial ? lastDay : 31;

  // A partial month is compared with the same days of the previous month.
  const prevKey = shiftMonth(key, -1);
  const current = summarize(dataset, monthRows(dataset, key));
  const comparison = summarize(dataset, monthRows(dataset, prevKey, throughDay));
  const lastYearRows = monthRows(dataset, shiftMonth(key, -12), throughDay);
  const lastYear = lastYearRows.length > 0 ? summarize(dataset, lastYearRows) : null;
  const comparisonLabel = dataset.monthRanges.has(prevKey)
    ? partial ? `vs ${MONTH_NAMES[Number(prevKey.slice(5)) - 1].slice(0, 3)} 1–${throughDay}` : `vs ${monthLabel(prevKey)}`
    : "";

  const trendKeys = Array.from({ length: TREND_MONTHS }, (_, i) => shiftMonth(key, i - (TREND_MONTHS - 1)))
    .filter(k => dataset.monthRanges.has(k));
  const trend = trendKeys.map(k => ({ key: k, label: shortMonthLabel(k), ...summarize(dataset, monthRows(dataset, k)) }));

  const inventory = buildInventory(dataset);
  const popular = current.products[0];

  const result = {
    source: {
      fileName: dataset.fileName,
      transactions: dataset.rows.length,
      firstDate: dataset.firstDate,
      lastDate: dataset.lastDate,
    },
    months: monthKeys.slice().reverse().map(k => ({ key: k, label: monthLabel(k) })),
    selected: {
      key,
      label: monthLabel(key),
      partial,
      throughDate: partial ? `${key}-${pad(lastDay)}` : null,
      comparisonLabel,
      firstYearOfData: year === Number(dataset.firstDate.slice(0, 4)),
    },
    kpis: {
      revenue: { value: current.revenue, change: pctChange(current.revenue, comparison.revenue) },
      orders: { value: current.orders, change: pctChange(current.orders, comparison.orders) },
      newCustomers: { value: current.newCustomers, change: pctChange(current.newCustomers, comparison.newCustomers) },
      popularProduct: popular ? { name: popular.name, units: popular.units } : null,
      subscribers: { value: current.subscribers, change: pctChange(current.subscribers, comparison.subscribers) },
      inventory: { health: inventory.health, alerts: inventory.alerts },
    },
    salesTrend: trend.map(t => ({ key: t.key, label: t.label, revenue: t.revenue, orders: t.orders })),
    customerGrowth: trend.map(t => ({ key: t.key, label: t.label, new: t.newCustomers, returning: t.returningCustomers })),
    productPopularity: current.products.slice(0, 8).map(p => ({ name: p.name, units: p.units, revenue: p.revenue })),
    subscriptionMix: {
      plans: Object.entries(PLAN_BY_TIER).map(([tier, plan]) => ({
        name: plan.name,
        customers: current.subscribersByTier.get(tier) ?? 0,
        color: plan.accent,
      })),
      subscribers: current.subscribers,
      totalCustomers: current.customers,
    },
    insights: buildInsights({ key, current, comparison, comparisonLabel, lastYear, partial, dataset, inventory, throughDay }),
    inventory,
  };

  detailCache.set(key, result);
  return result;
}

// Shared with the sales forecast (salesForecast.js).
export {
  getDataset as getSalesDataset,
  monthRows,
  summarize,
  shiftMonth,
  monthLabel,
  daysInMonth,
  seasonOfMonth,
  addDays,
  round,
  pctChange,
  PRODUCT_SEASON,
  USAGE_WINDOW_DAYS,
};
