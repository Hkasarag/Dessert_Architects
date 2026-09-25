const API_BASE_URL = 'http://localhost:5050'

export type KpiChange = { value: number; change: number | null }

export type InventoryRow = {
  ingredient: string
  currentStock: number
  unit: string
  parLevel: number
  dailyUsage: number
  daysOfCover: number | null
  runoutDate: string | null
  usageNote: string | null
  status: 'Good' | 'Low' | 'Critical'
  needsReorder: boolean
}

export type Insight = {
  icon: string
  type: 'positive' | 'warning' | 'forecast'
  text: string
}

export type SalesAnalytics = {
  source: { fileName: string; transactions: number; firstDate: string; lastDate: string }
  months: { key: string; label: string }[]
  selected: {
    key: string
    label: string
    partial: boolean
    throughDate: string | null
    comparisonLabel: string
    firstYearOfData: boolean
  }
  kpis: {
    revenue: KpiChange
    orders: KpiChange
    newCustomers: KpiChange
    popularProduct: { name: string; units: number } | null
    subscribers: KpiChange
    inventory: { health: 'Good' | 'Fair' | 'At Risk'; alerts: number }
  }
  salesTrend: { key: string; label: string; revenue: number; orders: number }[]
  customerGrowth: { key: string; label: string; new: number; returning: number }[]
  productPopularity: { name: string; units: number; revenue: number }[]
  subscriptionMix: {
    plans: { name: string; customers: number; color: string }[]
    subscribers: number
    totalCustomers: number
  }
  insights: Insight[]
  inventory: {
    asOf: string
    usageWindowDays: number
    health: 'Good' | 'Fair' | 'At Risk'
    alerts: number
    rows: InventoryRow[]
  }
}

/** Monthly analytics built by the server from the sales CSV. Omit month for the latest month. */
export async function fetchSalesAnalytics(month?: string, signal?: AbortSignal): Promise<SalesAnalytics> {
  const query = month ? `?month=${encodeURIComponent(month)}` : ''
  const response = await fetch(`${API_BASE_URL}/analytics/sales${query}`, { signal })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result) {
    throw new Error(result?.error || 'Unable to load sales analytics. Is the API server running?')
  }
  return result as SalesAnalytics
}
