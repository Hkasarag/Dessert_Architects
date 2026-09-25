const API_BASE_URL = 'http://localhost:5050'

export type LoyaltySummary = {
  customerId: string
  balance: number
  earned: number
  redeemed: number
}

/** The customer's current loyalty point balance, computed by the server from their orders. */
export async function fetchLoyaltyBalance(customerId: string, signal?: AbortSignal): Promise<LoyaltySummary> {
  const response = await fetch(`${API_BASE_URL}/loyalty?customerId=${encodeURIComponent(customerId)}`, { signal })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result) throw new Error(result?.error || 'Unable to load loyalty points.')
  return result as LoyaltySummary
}
