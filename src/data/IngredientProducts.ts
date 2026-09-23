export type IngredientProduct = {
  id: number
  name: string
  category: string
  unit: string
  currentStock: number
  parLevel: number
  maxLevel: number
  unitCost: number
  supplier: string
  lastRestocked: string
  expiryDays: number | null
}

export const ingredientProducts: IngredientProduct[] = [
  { id: 1, name: 'Cake Flour', category: 'Flour', unit: 'lbs', currentStock: 125, parLevel: 80, maxLevel: 300, unitCost: 1.85, supplier: 'BakeMark Atlanta', lastRestocked: 'Sep 20, 2026', expiryDays: null },
  { id: 2, name: 'All-Purpose Flour', category: 'Flour', unit: 'lbs', currentStock: 95, parLevel: 75, maxLevel: 250, unitCost: 1.72, supplier: 'BakeMark Atlanta', lastRestocked: 'Sep 20, 2026', expiryDays: null },
  { id: 3, name: 'Bread Flour', category: 'Flour', unit: 'lbs', currentStock: 68, parLevel: 50, maxLevel: 180, unitCost: 1.94, supplier: 'BakeMark Atlanta', lastRestocked: 'Sep 18, 2026', expiryDays: null },
  { id: 4, name: 'Rolled Oats', category: 'Flour', unit: 'lbs', currentStock: 42, parLevel: 30, maxLevel: 120, unitCost: 1.73, supplier: 'Performance Foodservice', lastRestocked: 'Sep 18, 2026', expiryDays: null },
  { id: 5, name: 'Unsalted Butter', category: 'Dairy', unit: 'lbs', currentStock: 46, parLevel: 50, maxLevel: 180, unitCost: 4.35, supplier: 'Georgia Dairy Supply', lastRestocked: 'Sep 21, 2026', expiryDays: 10 },
  { id: 6, name: 'Cream Cheese', category: 'Dairy', unit: 'lbs', currentStock: 16, parLevel: 20, maxLevel: 75, unitCost: 4.28, supplier: 'Georgia Dairy Supply', lastRestocked: 'Sep 19, 2026', expiryDays: 8 },
  { id: 7, name: 'Whole Milk', category: 'Dairy', unit: 'gallons', currentStock: 12, parLevel: 12, maxLevel: 35, unitCost: 8.25, supplier: 'Sysco Atlanta', lastRestocked: 'Sep 22, 2026', expiryDays: 6 },
  { id: 8, name: 'Large Eggs', category: 'Dairy', unit: 'dozen', currentStock: 72, parLevel: 60, maxLevel: 180, unitCost: 2.88, supplier: 'US Foods Atlanta', lastRestocked: 'Sep 22, 2026', expiryDays: 18 },
  { id: 9, name: 'Granulated Sugar', category: 'Sweetener', unit: 'lbs', currentStock: 140, parLevel: 100, maxLevel: 350, unitCost: 1.75, supplier: 'Southeastern Mills Distribution', lastRestocked: 'Sep 18, 2026', expiryDays: null },
  { id: 10, name: 'Brown Sugar', category: 'Sweetener', unit: 'lbs', currentStock: 58, parLevel: 60, maxLevel: 200, unitCost: 1.72, supplier: 'Southeastern Mills Distribution', lastRestocked: 'Sep 18, 2026', expiryDays: null },
  { id: 11, name: 'Molasses', category: 'Sweetener', unit: 'gallons', currentStock: 4, parLevel: 4, maxLevel: 12, unitCost: 8.20, supplier: 'Performance Foodservice', lastRestocked: 'Sep 05, 2026', expiryDays: null },
  { id: 12, name: 'Caramel Sauce', category: 'Sweetener', unit: 'gallons', currentStock: 3, parLevel: 3, maxLevel: 10, unitCost: 8.40, supplier: 'Sysco Atlanta', lastRestocked: 'Sep 12, 2026', expiryDays: 60 },
  { id: 13, name: 'Cocoa Powder', category: 'Chocolate', unit: 'lbs', currentStock: 28, parLevel: 25, maxLevel: 80, unitCost: 3.85, supplier: 'Georgia Dairy Supply', lastRestocked: 'Sep 16, 2026', expiryDays: null },
  { id: 14, name: 'Chocolate Chips', category: 'Chocolate', unit: 'lbs', currentStock: 65, parLevel: 50, maxLevel: 180, unitCost: 3.89, supplier: 'Southeastern Mills Distribution', lastRestocked: 'Sep 16, 2026', expiryDays: null },
  { id: 15, name: 'Chocolate Chunks', category: 'Chocolate', unit: 'lbs', currentStock: 34, parLevel: 30, maxLevel: 120, unitCost: 4.02, supplier: 'Southeastern Mills Distribution', lastRestocked: 'Sep 16, 2026', expiryDays: null },
  { id: 16, name: 'White Chocolate Chips', category: 'Chocolate', unit: 'lbs', currentStock: 12, parLevel: 15, maxLevel: 60, unitCost: 3.95, supplier: 'Georgia Dairy Supply', lastRestocked: 'Sep 11, 2026', expiryDays: null },
  { id: 17, name: 'Cinnamon', category: 'Spice', unit: 'oz', currentStock: 48, parLevel: 40, maxLevel: 150, unitCost: 0.82, supplier: 'US Foods Atlanta', lastRestocked: 'Sep 17, 2026', expiryDays: null },
  { id: 18, name: 'Nutmeg', category: 'Spice', unit: 'oz', currentStock: 18, parLevel: 15, maxLevel: 50, unitCost: 0.69, supplier: 'Restaurant Depot Atlanta', lastRestocked: 'Sep 17, 2026', expiryDays: null },
  { id: 19, name: 'Ginger', category: 'Spice', unit: 'oz', currentStock: 21, parLevel: 15, maxLevel: 60, unitCost: 0.78, supplier: 'Restaurant Depot Atlanta', lastRestocked: 'Sep 17, 2026', expiryDays: null },
  { id: 20, name: 'Blueberries', category: 'Fruit', unit: 'lbs', currentStock: 18, parLevel: 20, maxLevel: 60, unitCost: 4.10, supplier: 'Atlanta Produce Dealers', lastRestocked: 'Sep 21, 2026', expiryDays: 5 },
  { id: 21, name: 'Strawberries', category: 'Fruit', unit: 'lbs', currentStock: 15, parLevel: 20, maxLevel: 60, unitCost: 3.95, supplier: 'Atlanta Produce Dealers', lastRestocked: 'Sep 21, 2026', expiryDays: 4 },
  { id: 22, name: 'Peach Filling', category: 'Fruit', unit: 'lbs', currentStock: 18, parLevel: 15, maxLevel: 40, unitCost: 3.25, supplier: 'Restaurant Depot Atlanta', lastRestocked: 'Sep 10, 2026', expiryDays: 30 },
  { id: 23, name: 'Pumpkin Puree', category: 'Fruit', unit: 'lbs', currentStock: 40, parLevel: 25, maxLevel: 80, unitCost: 1.85, supplier: 'Restaurant Depot Atlanta', lastRestocked: 'Sep 01, 2026', expiryDays: 120 },
  { id: 24, name: 'Vanilla Extract', category: 'Flavoring', unit: 'oz', currentStock: 96, parLevel: 64, maxLevel: 256, unitCost: 3.05, supplier: 'Georgia Dairy Supply', lastRestocked: 'Sep 14, 2026', expiryDays: null },
  { id: 25, name: 'Almond Extract', category: 'Flavoring', unit: 'oz', currentStock: 18, parLevel: 12, maxLevel: 48, unitCost: 3.12, supplier: 'Georgia Dairy Supply', lastRestocked: 'Sep 14, 2026', expiryDays: null },
  { id: 26, name: 'Peppermint Extract', category: 'Flavoring', unit: 'oz', currentStock: 6, parLevel: 8, maxLevel: 30, unitCost: 2.95, supplier: 'Georgia Dairy Supply', lastRestocked: 'Aug 30, 2026', expiryDays: null },
  { id: 27, name: 'Matcha Powder', category: 'Flavoring', unit: 'oz', currentStock: 10, parLevel: 12, maxLevel: 40, unitCost: 3.35, supplier: 'Performance Foodservice', lastRestocked: 'Sep 04, 2026', expiryDays: null },
  { id: 28, name: 'Ube Extract', category: 'Specialty', unit: 'oz', currentStock: 8, parLevel: 10, maxLevel: 36, unitCost: 4.25, supplier: 'Specialty Imports USA', lastRestocked: 'Sep 01, 2026', expiryDays: null },
  { id: 29, name: 'Ube Powder', category: 'Specialty', unit: 'oz', currentStock: 14, parLevel: 12, maxLevel: 48, unitCost: 4.85, supplier: 'Specialty Imports USA', lastRestocked: 'Sep 01, 2026', expiryDays: null },
  { id: 30, name: 'Mascarpone Cheese', category: 'Specialty Dairy', unit: 'lbs', currentStock: 9, parLevel: 10, maxLevel: 35, unitCost: 5.25, supplier: 'Restaurant Depot Atlanta', lastRestocked: 'Sep 18, 2026', expiryDays: 7 },
  { id: 31, name: 'Rosemary', category: 'Specialty', unit: 'oz', currentStock: 16, parLevel: 8, maxLevel: 30, unitCost: 1.10, supplier: 'Atlanta Produce Dealers', lastRestocked: 'Sep 20, 2026', expiryDays: 14 },
  { id: 32, name: 'Cookie Crumbs', category: 'Specialty', unit: 'lbs', currentStock: 24, parLevel: 15, maxLevel: 60, unitCost: 1.85, supplier: 'HQ Wholesale', lastRestocked: 'Sep 14, 2026', expiryDays: 60 },
]

export const getIngredientProduct = (id: number) =>
  ingredientProducts.find(ingredient => ingredient.id === id)
