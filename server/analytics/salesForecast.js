// Sales forecast and forecast-driven ingredient ordering, computed from the sales CSV.
//
// Method: a month is forecast as the same month last year, scaled by recent growth
// (the last 3 complete months vs the same 3 months a year earlier). The likely range
// comes from backtesting that method over the previous 12 complete months.
import { ingredientProducts } from "../../src/data/IngredientProducts.ts";
import { RECIPE_USAGE } from "./recipeUsage.js";
import {
  getSalesDataset,
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
} from "./salesAnalytics.js";

const GROWTH_WINDOW_MONTHS = 3;
const BACKTEST_MONTHS = 12;
const MIN_UNITS_FOR_PRODUCT_GROWTH = 20;
const GROWTH_MIN = 0.6;
const GROWTH_MAX = 1.6;
const MAX_MONTHS_AHEAD = 6;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const sumOver = (keys, fn) => keys.reduce((total, key) => total + fn(key), 0);

const summaryCache = new WeakMap();
const monthSummary = (dataset, key) => {
  let cache = summaryCache.get(dataset);
  if (!cache) summaryCache.set(dataset, (cache = new Map()));
  if (!cache.has(key)) cache.set(key, summarize(dataset, monthRows(dataset, key)));
  return cache.get(key);
};

const unitsOf = (summary, productId) => summary.products.find(p => p.productId === productId)?.units ?? 0;
const totalUnits = summary => summary.products.reduce((total, p) => total + p.units, 0);

/** Where the data ends, and the last month with a full set of days. */
const dataWindow = dataset => {
  const latest = [...dataset.monthRanges.keys()].sort().at(-1);
  const [year, month] = latest.split("-").map(Number);
  const lastDay = Number(dataset.lastDate.slice(8));
  const partial = lastDay < daysInMonth(year, month);
  return { latest, lastDay, partial, lastComplete: partial ? shiftMonth(latest, -1) : latest };
};

/** Growth of a metric over the 3 months ending at endKey vs the same months a year earlier. */
const growthRatio = (dataset, endKey, metric) => {
  const keys = Array.from({ length: GROWTH_WINDOW_MONTHS }, (_, i) => shiftMonth(endKey, -i));
  const recent = sumOver(keys, key => metric(monthSummary(dataset, key)));
  const prior = sumOver(keys, key => metric(monthSummary(dataset, shiftMonth(key, -12))));
  return prior > 0 ? clamp(recent / prior, GROWTH_MIN, GROWTH_MAX) : null;
};

const seasonalForecast = (dataset, targetKey, endKey, metric) => {
  const base = metric(monthSummary(dataset, shiftMonth(targetKey, -12)));
  const growth = growthRatio(dataset, endKey, metric);
  return base > 0 && growth !== null ? base * growth : null;
};

/** Average absolute error of the method over past months, with the same gap between data and target. */
const backtestError = (dataset, lastComplete, gapMonths, metric) => {
  const errors = [];
  for (let i = 0; i < BACKTEST_MONTHS; i++) {
    const target = shiftMonth(lastComplete, -i);
    const actual = metric(monthSummary(dataset, target));
    const predicted = seasonalForecast(dataset, target, shiftMonth(target, -gapMonths), metric);
    if (actual > 0 && predicted !== null) errors.push(Math.abs(predicted - actual) / actual);
  }
  return errors.length ? errors.reduce((a, b) => a + b, 0) / errors.length : null;
};

const withRange = (expected, error, digits = 2) => ({
  expected: round(expected, digits),
  low: round(expected * (1 - (error ?? 0)), digits),
  high: round(expected * (1 + (error ?? 0)), digits),
});

/** Ingredient needs for the forecast month, starting from today's stock. */
const buildInventoryPlan = (dataset, window, targetKey, productForecasts) => {
  // Current pace: the last 28 days of sales, used for the rest of this month.
  const windowStart = addDays(dataset.lastDate, -(USAGE_WINDOW_DAYS - 1));
  const recentUsage = new Map();
  for (const row of dataset.rows) {
    if (row.date < windowStart) continue;
    for (const [ingredient, perUnit] of Object.entries(RECIPE_USAGE[row.productId] ?? {})) {
      recentUsage.set(ingredient, (recentUsage.get(ingredient) ?? 0) + perUnit * row.quantity);
    }
  }
  const [year, month] = window.latest.split("-").map(Number);
  const bridgeDays = window.partial ? daysInMonth(year, month) - window.lastDay : 0;

  const forecastUsage = new Map();
  for (const product of productForecasts) {
    for (const [ingredient, perUnit] of Object.entries(RECIPE_USAGE[product.productId] ?? {})) {
      forecastUsage.set(ingredient, (forecastUsage.get(ingredient) ?? 0) + perUnit * product.forecastUnits);
    }
  }

  const lines = [];
  const belowParButNotNeeded = [];
  for (const item of ingredientProducts) {
    const ratio = item.currentStock / item.parLevel;
    const status = ratio <= 0.3 ? "Critical" : ratio < 1 ? "Low" : "Good";
    const useBeforeMonth = ((recentUsage.get(item.name) ?? 0) / USAGE_WINDOW_DAYS) * bridgeDays;
    const useInMonth = forecastUsage.get(item.name) ?? 0;

    if (useInMonth === 0) {
      if (status !== "Good") belowParButNotNeeded.push({ ingredient: item.name, currentStock: item.currentStock, parLevel: item.parLevel, unit: item.unit });
      continue;
    }

    const stockAtMonthStart = item.currentStock - useBeforeMonth;
    const endStockWithoutOrder = stockAtMonthStart - useInMonth;
    if (endStockWithoutOrder >= item.parLevel) continue;

    // Order enough to finish the month at par, without going over the max shelf level.
    const needed = Math.ceil(item.parLevel - endStockWithoutOrder);
    const room = Math.max(0, Math.floor(item.maxLevel - stockAtMonthStart));
    const orderQuantity = Math.min(needed, room);
    lines.push({
      ingredient: item.name,
      unit: item.unit,
      currentStock: item.currentStock,
      parLevel: item.parLevel,
      status,
      projectedUseBeforeMonth: round(useBeforeMonth, 1),
      projectedUseInMonth: round(useInMonth, 1),
      projectedEndStockWithoutOrder: round(endStockWithoutOrder, 1),
      orderQuantity,
      estimatedCost: round(orderQuantity * item.unitCost),
      supplier: item.supplier,
      cappedByMaxLevel: orderQuantity < needed,
    });
  }
  lines.sort((a, b) => a.projectedEndStockWithoutOrder / a.parLevel - b.projectedEndStockWithoutOrder / b.parLevel);

  const bySupplier = new Map();
  for (const line of lines) {
    const entry = bySupplier.get(line.supplier) ?? { supplier: line.supplier, items: 0, estimatedCost: 0 };
    entry.items += 1;
    entry.estimatedCost = round(entry.estimatedCost + line.estimatedCost);
    bySupplier.set(line.supplier, entry);
  }

  return {
    stockAsOf: dataset.lastDate,
    daysBeforeMonthStarts: bridgeDays,
    method: `Stock on hand, minus ${bridgeDays} more days at the last ${USAGE_WINDOW_DAYS} days' pace, minus the forecast month's usage. Order enough to end ${monthLabel(targetKey)} at par level.`,
    orderLines: lines,
    totalsBySupplier: [...bySupplier.values()].sort((a, b) => b.estimatedCost - a.estimatedCost),
    grandTotal: round(lines.reduce((total, line) => total + line.estimatedCost, 0)),
    belowParButNotNeeded,
    assumption: "Ingredient amounts per item are planning estimates, not measured recipes.",
  };
};

/**
 * Forecast for the month `monthsAhead` after the latest month in the sales data
 * (1 = next month). The inventory plan is included for next month only.
 */
export async function getSalesForecast(monthsAhead = 1) {
  const ahead = clamp(Math.round(Number(monthsAhead) || 1), 1, MAX_MONTHS_AHEAD);
  const dataset = await getSalesDataset();
  const window = dataWindow(dataset);
  const targetKey = shiftMonth(window.latest, ahead);
  const gapMonths = Number(targetKey.slice(0, 4)) * 12 + Number(targetKey.slice(5)) - (Number(window.lastComplete.slice(0, 4)) * 12 + Number(window.lastComplete.slice(5)));

  const revenueMetric = s => s.revenue;
  const ordersMetric = s => s.orders;
  const revenue = seasonalForecast(dataset, targetKey, window.lastComplete, revenueMetric);
  const orders = seasonalForecast(dataset, targetKey, window.lastComplete, ordersMetric);
  if (revenue === null || orders === null) {
    return { error: `Not enough sales history to forecast ${monthLabel(targetKey)}.` };
  }
  const revenueError = backtestError(dataset, window.lastComplete, gapMonths, revenueMetric);
  const ordersError = backtestError(dataset, window.lastComplete, gapMonths, ordersMetric);

  // Per-product units: last year's same month, scaled by that product's growth
  // (or overall unit growth when the product sells too little to measure).
  const overallUnitGrowth = growthRatio(dataset, window.lastComplete, totalUnits) ?? 1;
  const lastYearTarget = monthSummary(dataset, shiftMonth(targetKey, -12));
  const growthKeys = Array.from({ length: GROWTH_WINDOW_MONTHS }, (_, i) => shiftMonth(window.lastComplete, -i));
  const [, targetMonth] = targetKey.split("-").map(Number);
  const season = seasonOfMonth(targetMonth);

  const productForecasts = lastYearTarget.products.map(product => {
    const recent = sumOver(growthKeys, key => unitsOf(monthSummary(dataset, key), product.productId));
    const prior = sumOver(growthKeys, key => unitsOf(monthSummary(dataset, shiftMonth(key, -12)), product.productId));
    const growth = prior >= MIN_UNITS_FOR_PRODUCT_GROWTH ? clamp(recent / prior, GROWTH_MIN, GROWTH_MAX) : overallUnitGrowth;
    return {
      productId: product.productId,
      name: product.name,
      forecastUnits: Math.round(product.units * growth),
      lastYearUnits: product.units,
      seasonal: PRODUCT_SEASON.get(product.name) === season,
    };
  }).filter(p => p.forecastUnits > 0).sort((a, b) => b.forecastUnits - a.forecastUnits);

  // Comparisons: the same month last year, and the current month (projected if partial).
  const [latestYear, latestMonth] = window.latest.split("-").map(Number);
  const latestSummary = monthSummary(dataset, window.latest);
  const currentRevenue = window.partial
    ? (latestSummary.revenue / window.lastDay) * daysInMonth(latestYear, latestMonth)
    : latestSummary.revenue;
  const growthLabel = `${monthLabel(growthKeys.at(-1))} – ${monthLabel(window.lastComplete)}`;
  // How the current month is pacing against the same days last year: a sign the forecast may run high or low.
  const sameDaysLastYear = summarize(dataset, monthRows(dataset, shiftMonth(window.latest, -12), window.partial ? window.lastDay : 31));

  return {
    targetMonth: { key: targetKey, label: monthLabel(targetKey), season },
    basedOn: {
      salesDataThrough: dataset.lastDate,
      method: "Same month last year, adjusted for recent growth.",
      growthWindow: `${growthLabel} vs a year earlier`,
      revenueGrowthPct: round((growthRatio(dataset, window.lastComplete, revenueMetric) - 1) * 100, 1),
      typicalErrorPct: revenueError === null ? null : round(revenueError * 100, 1),
      backtestedMonths: BACKTEST_MONTHS,
    },
    forecast: {
      revenue: withRange(revenue, revenueError),
      orders: withRange(orders, ordersError, 0),
      unitsSold: productForecasts.reduce((total, p) => total + p.forecastUnits, 0),
      averageOrderValue: round(revenue / orders),
    },
    comparisons: {
      sameMonthLastYear: {
        label: monthLabel(shiftMonth(targetKey, -12)),
        revenue: round(lastYearTarget.revenue),
        orders: lastYearTarget.orders,
        revenueChangePct: pctChange(revenue, lastYearTarget.revenue),
      },
      currentMonth: {
        label: monthLabel(window.latest),
        revenue: round(currentRevenue),
        isProjection: window.partial,
        note: window.partial ? `Projected full month from sales through day ${window.lastDay}.` : "Actual.",
        revenueChangePct: pctChange(revenue, currentRevenue),
        paceVsSameDaysLastYearPct: pctChange(latestSummary.revenue, sameDaysLastYear.revenue),
      },
    },
    topProducts: productForecasts.slice(0, 8).map(({ productId, ...p }) => p),
    seasonalItems: productForecasts.filter(p => p.seasonal).map(({ productId, ...p }) => p),
    inventoryPlan: ahead === 1 ? buildInventoryPlan(dataset, window, targetKey, productForecasts) : null,
  };
}
