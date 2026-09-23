import { inventoryItems } from './types'

export function franchiseReorderingAgent(message: string) {
  const reorderItems = inventoryItems
    .filter(item => item.currentStock <= item.reorderThreshold)
    .map(item => ({
      itemName: item.itemName,
      currentStock: item.currentStock,
      recommendedQuantity: Math.max(item.reorderThreshold * 2, Math.ceil(item.salesVelocityPerDay * item.leadDays * 2)),
      reason: `Projected stockout within ${item.leadDays} days based on sales velocity and supplier lead time.`,
    }))

  return {
    reorderItems,
    cartReady: reorderItems.length > 0,
  }
}
