export type MenuProduct = {
  id: number
  name: string
  desc: string
  price: number
  unitCost: number
  cat: 'Cookies' | 'Brownies' | 'Cupcakes' | 'Pastries' | 'Seasonal'
  image: string
  season: 'All Year' | 'Spring' | 'Summer' | 'Fall' | 'Winter'
}

export const menuProducts: MenuProduct[] = [
  { id: 1, name: '🍪 Chocolate Chip Cookie', desc: 'Fresh baked cookie loaded with chocolate chips', price: 2.99, unitCost: 0.32, cat: 'Cookies', image: 'photo-1499636136210-6f4ee915583e', season: 'All Year' },
  { id: 2, name: '✨ Snickerdoodle Cookie', desc: 'Classic cinnamon sugar cookie', price: 2.99, unitCost: 0.37, cat: 'Cookies', image: 'photo-1558961363-fa8fdf82db35', season: 'All Year' },
  { id: 3, name: '🥣 Oatmeal Cookie', desc: 'Soft oatmeal cookie with warm spice notes', price: 2.99, unitCost: 0.24, cat: 'Cookies', image: 'photo-1499636136210-6f4ee915583e', season: 'All Year' },
  { id: 4, name: '🌸 Almond Fudge Cookie', desc: 'Almond cookie loaded with fudge chunks', price: 2.99, unitCost: 0.41, cat: 'Seasonal', image: 'photo-1499636136210-6f4ee915583e', season: 'Spring' },
  { id: 5, name: '🍑 Peach Cobbler Sugar Cookie', desc: 'Peach filling and cinnamon sugar', price: 2.99, unitCost: 0.35, cat: 'Seasonal', image: 'photo-1499636136210-6f4ee915583e', season: 'Summer' },
  { id: 6, name: '🥨 Chocolate Chunk Pretzel Cookie', desc: 'Chocolate chunks with crunchy pretzel pieces', price: 2.99, unitCost: 0.38, cat: 'Seasonal', image: 'photo-1499636136210-6f4ee915583e', season: 'Fall' },
  { id: 7, name: '🎄 Gingerbread Cookie', desc: 'Classic holiday gingerbread spices', price: 2.99, unitCost: 0.26, cat: 'Seasonal', image: 'photo-1499636136210-6f4ee915583e', season: 'Winter' },

  { id: 20, name: '🍫 Chocolate Brownie', desc: 'Rich fudgy chocolate brownie', price: 3.50, unitCost: 0.48, cat: 'Brownies', image: 'photo-1606313564200-e75d5e30476c', season: 'All Year' },
  { id: 21, name: '🌰 Walnut Brownie', desc: 'Chocolate brownie with walnuts', price: 3.50, unitCost: 0.59, cat: 'Brownies', image: 'photo-1606313564200-e75d5e30476c', season: 'All Year' },
  { id: 22, name: '🍓 Strawberry Blondie', desc: 'Spring strawberry blondie', price: 3.50, unitCost: 0.56, cat: 'Seasonal', image: 'photo-1606313564200-e75d5e30476c', season: 'Spring' },
  { id: 23, name: '🔥 Smores Brownie', desc: 'Chocolate brownie topped with marshmallow and graham cracker', price: 3.50, unitCost: 0.62, cat: 'Seasonal', image: 'photo-1606313564200-e75d5e30476c', season: 'Summer' },
  { id: 24, name: '🎃 Pumpkin Brownie', desc: 'Pumpkin brownie with warm fall spices', price: 3.50, unitCost: 0.50, cat: 'Seasonal', image: 'photo-1606313564200-e75d5e30476c', season: 'Fall' },
  { id: 25, name: '❄️ Peppermint Mocha Brownie', desc: 'Peppermint brownie infused with espresso', price: 3.50, unitCost: 0.56, cat: 'Seasonal', image: 'photo-1606313564200-e75d5e30476c', season: 'Winter' },

  { id: 40, name: '🧁 Vanilla Cupcake', desc: 'Classic vanilla buttercream cupcake', price: 4.50, unitCost: 0.72, cat: 'Cupcakes', image: 'photo-1486427944299-d1955d23e34d', season: 'All Year' },
  { id: 41, name: '🍫 Chocolate Cupcake', desc: 'Chocolate cupcake with chocolate frosting', price: 4.50, unitCost: 0.79, cat: 'Cupcakes', image: 'photo-1486427944299-d1955d23e34d', season: 'All Year' },
  { id: 42, name: '🍋 Lemon Cupcake', desc: 'Fresh citrus cupcake with vanilla frosting', price: 4.50, unitCost: 0.76, cat: 'Cupcakes', image: 'photo-1486427944299-d1955d23e34d', season: 'All Year' },
  { id: 43, name: '🫐 Blueberry Cupcake', desc: 'Blueberry cupcake with vanilla frosting', price: 4.50, unitCost: 0.88, cat: 'Seasonal', image: 'photo-1486427944299-d1955d23e34d', season: 'Spring' },
  { id: 44, name: '🥥 Toasted Coconut Cupcake', desc: 'Toasted coconut cupcake', price: 4.50, unitCost: 0.86, cat: 'Seasonal', image: 'photo-1486427944299-d1955d23e34d', season: 'Summer' },
  { id: 45, name: '🥕 Carrot Cupcake', desc: 'Carrot cupcake with cream cheese frosting', price: 4.50, unitCost: 0.83, cat: 'Seasonal', image: 'photo-1486427944299-d1955d23e34d', season: 'Fall' },
  { id: 46, name: '🎄 Peppermint Chocolate Cupcake', desc: 'Chocolate cupcake with peppermint frosting', price: 4.50, unitCost: 0.84, cat: 'Seasonal', image: 'photo-1486427944299-d1955d23e34d', season: 'Winter' },

  { id: 60, name: '🥐 Cinnamon Roll', desc: 'Warm cinnamon roll with cream cheese frosting', price: 3.99, unitCost: 0.95, cat: 'Pastries', image: 'photo-1509365465985-25d11c17e812', season: 'All Year' },
  { id: 61, name: '🍌 Vegan Banana Bread Muffin', desc: 'Plant-based banana bread muffin', price: 2.99, unitCost: 0.81, cat: 'Pastries', image: 'photo-1587314168485-3236d6710814', season: 'All Year' },
]

export const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'Spring'
  if (month >= 6 && month <= 8) return 'Summer'
  if (month >= 9 && month <= 11) return 'Fall'
  return 'Winter'
}

export const isInSeason = (season: MenuProduct['season']) =>
  season === 'All Year' || season === getCurrentSeason()
