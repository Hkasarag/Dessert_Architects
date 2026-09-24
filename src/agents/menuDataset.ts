export type MenuItem = {
  id: string
  name: string
  category: string
  price: number
  allergens: string[]
  dietary: string[]
  seasonal?: ('spring' | 'summer' | 'fall' | 'winter')[]
  description?: string
}

const menu: MenuItem[] = [
  // Cookies
  { id: 'm-001', name: 'Chocolate Chip Cookie', category: 'Cookies', price: 2.5, allergens: ['wheat', 'eggs', 'milk'], dietary: ['vegetarian'], seasonal: [], description: 'Classic chewy cookie with rich chips.' },
  { id: 'm-002', name: 'Snickerdoodle Cookie', category: 'Cookies', price: 2.5, allergens: ['wheat', 'eggs', 'milk'], dietary: ['vegetarian'], seasonal: ['fall'], description: 'Cinnamon-sugared soft cookie.' },
  { id: 'm-003', name: 'Oatmeal Cookie', category: 'Cookies', price: 2.75, allergens: ['wheat', 'eggs'], dietary: ['vegetarian'], seasonal: [], description: 'Hearty oats with a homey flavor.' },
  { id: 'm-004', name: 'Almond Fudge Cookie', category: 'Cookies', price: 3.0, allergens: ['almonds', 'wheat'], dietary: ['vegetarian'], seasonal: ['spring'], description: 'Almond-forward fudge cookie.' },
  { id: 'm-005', name: 'Peach Cobbler Sugar Cookie', category: 'Cookies', price: 2.8, allergens: ['wheat', 'eggs'], dietary: ['vegetarian'], seasonal: ['summer'], description: 'Summer peach notes in sugar cookie.' },
  { id: 'm-006', name: 'Chocolate Chunk Pretzel Cookie', category: 'Cookies', price: 3.0, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], seasonal: ['fall'], description: 'Sweet & salty chocolate with pretzel crunch.' },
  { id: 'm-007', name: 'Gingerbread Cookie', category: 'Cookies', price: 2.9, allergens: ['wheat', 'eggs'], dietary: ['vegetarian'], seasonal: ['winter'], description: 'Warm spice classic for winter.' },
  { id: 'm-008', name: 'Matcha White Chocolate Cookie', category: 'Cookies', price: 3.25, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], seasonal: ['spring'], description: 'Green tea and white chocolate harmony.' },
  { id: 'm-009', name: 'Red White and Blue Sugar Cookie', category: 'Cookies', price: 3.0, allergens: ['wheat', 'eggs'], dietary: ['vegetarian'], seasonal: ['summer'], description: 'Festive patriotic sugar cookie.' },
  { id: 'm-010', name: 'Rosemary Shortbread Cookie', category: 'Cookies', price: 3.25, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], seasonal: ['fall'], description: 'Savory-sweet rosemary shortbread.' },

  // Brownies
  { id: 'm-101', name: 'Chocolate Brownie', category: 'Brownies', price: 3.5, allergens: ['wheat', 'eggs', 'milk'], dietary: ['vegetarian'], seasonal: [] , description: 'Rich chocolate brownie.'},
  { id: 'm-102', name: 'Walnut Brownie', category: 'Brownies', price: 3.75, allergens: ['wheat', 'eggs', 'walnuts'], dietary: ['vegetarian'], seasonal: [] , description: 'Brownie with walnut crunch.'},
  { id: 'm-103', name: 'Strawberry Blondie', category: 'Brownies', price: 3.5, allergens: ['wheat', 'eggs'], dietary: ['vegetarian'], seasonal: ['spring'], description: 'Bright strawberry blondie.'},
  { id: 'm-104', name: 'Smores Brownie', category: 'Brownies', price: 3.75, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], seasonal: ['summer'], description: 'Campfire-inspired brownie.'},
  { id: 'm-105', name: 'Pumpkin Brownie', category: 'Brownies', price: 3.6, allergens: ['wheat', 'eggs'], dietary: ['vegetarian'], seasonal: ['fall'], description: 'Pumpkin-spiced brownie.'},
  { id: 'm-106', name: 'Peppermint Mocha Brownie', category: 'Brownies', price: 3.9, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], seasonal: ['winter'], description: 'Peppermint and mocha flavors.'},
  { id: 'm-107', name: 'Peanut Butter Explosion Brownie', category: 'Brownies', price: 3.9, allergens: ['wheat', 'peanuts'], dietary: [], seasonal: [], description: 'Peanut butter-packed brownie.'},
  { id: 'm-108', name: 'Caramel Espresso Brownie', category: 'Brownies', price: 4.0, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], seasonal: ['winter'], description: 'Caramel and espresso layers.'},
  { id: 'm-109', name: 'Maple Pecan Brownie', category: 'Brownies', price: 4.0, allergens: ['wheat', 'pecans'], dietary: ['vegetarian'], seasonal: ['fall'], description: 'Maple-sweetened brownie with pecans.'},
  { id: 'm-110', name: 'Mint Chocolate Brownie', category: 'Brownies', price: 3.9, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], seasonal: ['winter'], description: 'Refreshing mint and chocolate.'},

  // Cupcakes
  { id: 'm-201', name: 'Vanilla Cupcake', category: 'Cupcakes', price: 3.5, allergens: ['wheat', 'eggs', 'milk'], dietary: ['vegetarian'], seasonal: [] , description: 'Light vanilla cupcake.'},
  { id: 'm-202', name: 'Chocolate Cupcake', category: 'Cupcakes', price: 3.75, allergens: ['wheat', 'eggs', 'milk'], dietary: ['vegetarian'], seasonal: [] , description: 'Classic chocolate cupcake.'},
  { id: 'm-203', name: 'Lemon Cupcake', category: 'Cupcakes', price: 3.6, allergens: ['wheat', 'eggs', 'milk'], dietary: ['vegetarian'], seasonal: [] , description: 'Zesty lemon cupcake.'},
  { id: 'm-204', name: 'Blueberry Cupcake', category: 'Cupcakes', price: 3.75, allergens: ['wheat', 'eggs', 'milk'], dietary: ['vegetarian'], seasonal: ['spring'], description: 'Blueberry-studded cupcake.'},
  { id: 'm-205', name: 'Toasted Coconut Cupcake', category: 'Cupcakes', price: 3.9, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], seasonal: ['summer'], description: 'Tropical coconut cupcake.'},
  { id: 'm-206', name: 'Carrot Cupcake', category: 'Cupcakes', price: 3.85, allergens: ['wheat', 'eggs', 'milk'], dietary: ['vegetarian'], seasonal: ['fall'], description: 'Spiced carrot cupcake with cream cheese.'},
  { id: 'm-207', name: 'Peppermint Chocolate Cupcake', category: 'Cupcakes', price: 3.95, allergens: ['wheat', 'milk'], dietary: ['vegetarian'], seasonal: ['winter'], description: 'Holiday peppermint chocolate.'},
  { id: 'm-208', name: 'Ube Dream Cupcake', category: 'Cupcakes', price: 4.2, allergens: ['wheat', 'eggs'], dietary: ['vegetarian'], seasonal: ['spring'], description: 'Purple yam flavored cupcake.'},
  { id: 'm-209', name: 'Cookies and Cream Cupcake', category: 'Cupcakes', price: 4.0, allergens: ['wheat', 'milk', 'eggs'], dietary: ['vegetarian'], seasonal: [] , description: 'Oreo-inspired cupcake.'},
  { id: 'm-210', name: 'Tiramisu Cupcake', category: 'Cupcakes', price: 4.25, allergens: ['wheat', 'eggs', 'milk'], dietary: ['vegetarian'], seasonal: [] , description: 'Coffee-flavored cupcake.'},

  // Other bakery items
  { id: 'm-301', name: 'Cinnamon Roll', category: 'Other', price: 4.5, allergens: ['wheat', 'milk', 'eggs'], dietary: ['vegetarian'], seasonal: [] , description: 'Warm cinnamon roll with cream cheese frosting.'},
  { id: 'm-302', name: 'Vegan Banana Bread Muffin', category: 'Other', price: 3.5, allergens: ['banana'], dietary: ['vegan'], seasonal: [] , description: 'Moist vegan banana muffin.'},
]

export const menuDataset = menu

export function findByName(name: string) {
  const lower = name.toLowerCase()
  return menu.find(m => m.name.toLowerCase().includes(lower) || m.id.toLowerCase() === lower)
}

export function findByCategory(category: string) {
  const lower = category.toLowerCase()
  return menu.filter(m => m.category.toLowerCase() === lower || m.category.toLowerCase().includes(lower))
}

export function seasonalItems(season: 'spring' | 'summer' | 'fall' | 'winter') {
  return menu.filter(m => (m.seasonal || []).includes(season))
}

export function searchFuzzy(term: string, limit = 6) {
  const lower = term.toLowerCase()
  const exact = menu.filter(m => m.name.toLowerCase().includes(lower))
  if (exact.length) return exact.slice(0, limit)
  // fallback: match by token
  const tokens = lower.split(/\s+/)
  return menu.filter(m => tokens.some(t => m.name.toLowerCase().includes(t))).slice(0, limit)
}

export function safeOptions(excludeAllergens: string[], limit = 6) {
  return menu.filter(m => !m.allergens.some(a => excludeAllergens.includes(a))).slice(0, limit)
}

export default menu
