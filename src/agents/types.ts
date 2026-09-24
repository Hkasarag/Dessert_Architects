export type AgentIntent =
  | 'product_recommendation'
  | 'promotion_recommendation'
  | 'party_planning'
  | 'franchise_reordering'
  | 'customer_service'
  | 'cart_optimization'
  | 'nutritional_allergy'
  | 'clarification_required'

export type AgentRoute = {
  intent: AgentIntent
  agentName: string
  confidence: number
  rationale: string
  followUpQuestion?: string
}

export type ProductCatalogItem = {
  id: string
  name: string
  category: string
  price: number
  active: boolean
  allergens: string[]
  dietary: string[]
  description: string
}

export type Promotion = {
  id: string
  title: string
  status: 'active' | 'inactive'
  category: string
  estimatedSavings: number
  reason: string
}

export type InventoryItem = {
  itemName: string
  currentStock: number
  reorderThreshold: number
  salesVelocityPerDay: number
  leadDays: number
  supplier: string
}

export type OrderStatusEntry = {
  orderId: string
  status: string
  updatedAt: string
}

export const productCatalog: ProductCatalogItem[] = [
  { id: 'prod-101', name: 'Dark Chocolate Brownie', category: 'Chocolate Lovers', price: 4.5, active: true, allergens: ['wheat', 'eggs'], dietary: ['vegetarian'], description: 'Dense, fudgy, baked fresh daily' },
  { id: 'prod-102', name: 'Triple Choc Cookie', category: 'Chocolate Lovers', price: 2.99, active: true, allergens: ['wheat', 'milk', 'eggs'], dietary: ['vegetarian'], description: 'White, milk & dark chips in every bite' },
  { id: 'prod-103', name: 'Chocolate Cupcake', category: 'Chocolate Lovers', price: 3.99, active: true, allergens: ['wheat', 'milk', 'eggs'], dietary: ['vegetarian'], description: 'Silky ganache top, moist crumb' },
  { id: 'prod-104', name: 'Butter Croissant', category: 'Fresh From The Oven', price: 3.25, active: true, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], description: 'Flaky buttery pastry' },
  { id: 'prod-105', name: 'Cinnamon Roll', category: 'Fresh From The Oven', price: 4.75, active: true, allergens: ['wheat', 'milk', 'eggs'], dietary: ['vegetarian'], description: 'Cream cheese frosting, served warm' },
  { id: 'prod-106', name: 'Blueberry Muffin', category: 'Fresh From The Oven', price: 3.5, active: true, allergens: ['wheat', 'milk', 'eggs'], dietary: ['vegetarian'], description: 'Bursting with fresh blueberries' },
  { id: 'prod-107', name: 'Funfetti Cupcake', category: 'Birthday Favorites', price: 3.99, active: true, allergens: ['wheat', 'milk', 'eggs'], dietary: ['vegetarian'], description: 'Rainbow sprinkles & vanilla buttercream' },
  { id: 'prod-108', name: 'Classic Birthday Cake', category: 'Birthday Favorites', price: 42, active: true, allergens: ['wheat', 'milk', 'eggs'], dietary: ['vegetarian'], description: 'Serves 12–16' },
  { id: 'prod-109', name: 'Macarons (6 pack)', category: 'Birthday Favorites', price: 14, active: true, allergens: ['almonds', 'wheat', 'egg'], dietary: ['vegetarian'], description: 'Assorted French macarons' },
  { id: 'prod-110', name: 'Almond Danish', category: 'Weekend Brunch Picks', price: 4.25, active: true, allergens: ['wheat', 'milk', 'almonds'], dietary: ['vegetarian'], description: 'Flaky pastry with almond cream filling' },
  { id: 'prod-111', name: 'Lemon Scone', category: 'Weekend Brunch Picks', price: 3.5, active: true, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], description: 'Zesty, crumbly, perfect with tea' },
  { id: 'prod-112', name: 'Banana Bread Slice', category: 'Weekend Brunch Picks', price: 3.75, active: true, allergens: ['wheat', 'milk', 'eggs'], dietary: ['vegetarian'], description: 'Moist, walnut-studded house recipe' },
]

export const customerOrderHistory = [
  { productId: 'prod-103', productName: 'Chocolate Cupcake', category: 'Chocolate Lovers', count: 4 },
  { productId: 'prod-108', productName: 'Classic Birthday Cake', category: 'Birthday Favorites', count: 2 },
  { productId: 'prod-104', productName: 'Butter Croissant', category: 'Fresh From The Oven', count: 3 },
  { productId: 'prod-102', productName: 'Triple Choc Cookie', category: 'Chocolate Lovers', count: 5 },
]

export const customerProfile = {
  customerId: 'cust-1042',
  favoriteCategories: ['Chocolate Lovers', 'Birthday Favorites'],
  dietaryRestrictions: [],
}

export const activePromotions: Promotion[] = [
  { id: 'promo-15', title: '15% Off Cupcakes', status: 'active', category: 'Chocolate Lovers', estimatedSavings: 8.5, reason: 'Best match for cupcake purchase history.' },
  { id: 'promo-10', title: '10% Off Cakes', status: 'active', category: 'Birthday Favorites', estimatedSavings: 6.5, reason: 'Applies to celebratory and event-based orders.' },
  { id: 'promo-20', title: '20% Off Holiday Dessert Tray', status: 'active', category: 'Seasonal', estimatedSavings: 10, reason: 'Great for family gatherings and seasonal bundles.' },
  { id: 'promo-inactive', title: 'Spring Picnic Pack', status: 'inactive', category: 'Seasonal', estimatedSavings: 7, reason: 'Not currently active.' },
]

export const inventoryItems: InventoryItem[] = [
  { itemName: 'Chocolate Mix', currentStock: 10, reorderThreshold: 20, salesVelocityPerDay: 2.5, leadDays: 5, supplier: 'HQ Wholesale' },
  { itemName: 'Flour', currentStock: 35, reorderThreshold: 25, salesVelocityPerDay: 1.5, leadDays: 4, supplier: 'Northline Foods' },
  { itemName: 'Butter', currentStock: 14, reorderThreshold: 18, salesVelocityPerDay: 2.2, leadDays: 3, supplier: 'Dairy Works' },
  { itemName: 'Eggs', currentStock: 22, reorderThreshold: 30, salesVelocityPerDay: 1.8, leadDays: 6, supplier: 'Field Fresh' },
]

export const orderStatusData: OrderStatusEntry[] = [
  { orderId: 'ORD-8891', status: 'in_transit', updatedAt: '2026-09-20' },
  { orderId: 'ORD-4442', status: 'pending', updatedAt: '2026-09-21' },
]
