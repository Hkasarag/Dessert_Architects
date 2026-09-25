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
  { id: 1, name: '🍪 Chocolate Chip Cookie', desc: 'Fresh baked cookie loaded with chocolate chips', price: 2.99, unitCost: 0.32, cat: 'Cookies', image: 'photo-1597733153203-a54d0fbc47de', season: 'All Year' },
  { id: 2, name: '✨ Snickerdoodle Cookie', desc: 'Classic cinnamon sugar cookie', price: 2.99, unitCost: 0.37, cat: 'Cookies', image: 'photo-1703187839559-3ae0b51bd4f1', season: 'All Year' },
  { id: 3, name: '🥣 Oatmeal Cookie', desc: 'Soft oatmeal cookie with warm spice notes', price: 2.99, unitCost: 0.24, cat: 'Cookies', image: 'photo-1631311253861-52eaf0337adb', season: 'All Year' },
  { id: 4, name: '🌸 Almond Fudge Cookie', desc: 'Almond cookie loaded with fudge chunks', price: 2.99, unitCost: 0.41, cat: 'Seasonal', image: 'photo-1593759608179-014a7dec4e7f', season: 'Spring' },
  { id: 5, name: '🍑 Peach Cobbler Sugar Cookie', desc: 'Peach filling and cinnamon sugar', price: 2.99, unitCost: 0.35, cat: 'Seasonal', image: 'photo-1611082191524-1c049443f288', season: 'Summer' },
  { id: 6, name: '🥨 Chocolate Chunk Pretzel Cookie', desc: 'Chocolate chunks with crunchy pretzel pieces', price: 2.99, unitCost: 0.38, cat: 'Seasonal', image: 'photo-1743623173762-46642b3c00f9', season: 'Fall' },
  { id: 7, name: '🎄 Gingerbread Cookie', desc: 'Classic holiday gingerbread spices', price: 2.99, unitCost: 0.26, cat: 'Seasonal', image: 'photo-1698672362756-14375dbb571c', season: 'Winter' },

  { id: 20, name: '🍫 Chocolate Brownie', desc: 'Rich fudgy chocolate brownie', price: 3.50, unitCost: 0.48, cat: 'Brownies', image: 'photo-1636743715220-d8f8dd900b87', season: 'All Year' },
  { id: 21, name: '🌰 Walnut Brownie', desc: 'Chocolate brownie with walnuts', price: 3.50, unitCost: 0.59, cat: 'Brownies', image: 'photo-1789776377594-74b97c6302b0', season: 'All Year' },
  { id: 22, name: '🍓 Strawberry Blondie', desc: 'Spring strawberry blondie', price: 3.50, unitCost: 0.56, cat: 'Seasonal', image: 'photo-1702650719239-2cf87efce9bc', season: 'Spring' },
  { id: 23, name: '🔥 Smores Brownie', desc: 'Chocolate brownie topped with marshmallow and graham cracker', price: 3.50, unitCost: 0.62, cat: 'Seasonal', image: 'photo-1690976991784-517d7763e0fa', season: 'Summer' },
  { id: 24, name: '🎃 Pumpkin Brownie', desc: 'Pumpkin brownie with warm fall spices', price: 3.50, unitCost: 0.50, cat: 'Seasonal', image: 'photo-1583516867196-ea9a73ecdc13', season: 'Fall' },
  { id: 25, name: '❄️ Peppermint Mocha Brownie', desc: 'Peppermint brownie infused with espresso', price: 3.50, unitCost: 0.56, cat: 'Seasonal', image: 'photo-1770376638822-355afa537d47', season: 'Winter' },

  { id: 40, name: '🧁 Vanilla Cupcake', desc: 'Classic vanilla buttercream cupcake', price: 4.50, unitCost: 0.72, cat: 'Cupcakes', image: 'photo-1519869325930-281384150729', season: 'All Year' },
  { id: 41, name: '🍫 Chocolate Cupcake', desc: 'Chocolate cupcake with chocolate frosting', price: 4.50, unitCost: 0.79, cat: 'Cupcakes', image: 'photo-1640806353257-6c408529d822', season: 'All Year' },
  { id: 42, name: '🍋 Lemon Cupcake', desc: 'Fresh citrus cupcake with vanilla frosting', price: 4.50, unitCost: 0.76, cat: 'Cupcakes', image: 'photo-1732966283172-033d29bf02ca', season: 'All Year' },
  { id: 43, name: '🫐 Blueberry Cupcake', desc: 'Blueberry cupcake with vanilla frosting', price: 4.50, unitCost: 0.88, cat: 'Seasonal', image: 'photo-1722251172786-68db185b4986', season: 'Spring' },
  { id: 44, name: '🥥 Toasted Coconut Cupcake', desc: 'Toasted coconut cupcake', price: 4.50, unitCost: 0.86, cat: 'Seasonal', image: 'photo-1771416073862-a62bbea9c154', season: 'Summer' },
  { id: 45, name: '🥕 Carrot Cupcake', desc: 'Carrot cupcake with cream cheese frosting', price: 4.50, unitCost: 0.83, cat: 'Seasonal', image: 'photo-1487124504955-e42a39e11aaf', season: 'Fall' },
  { id: 46, name: '🎄 Peppermint Chocolate Cupcake', desc: 'Chocolate cupcake with peppermint frosting', price: 4.50, unitCost: 0.84, cat: 'Seasonal', image: 'photo-1641255483475-e39bee9ec3ba', season: 'Winter' },

  { id: 60, name: '🥐 Cinnamon Roll', desc: 'Warm cinnamon roll with cream cheese frosting', price: 3.99, unitCost: 0.95, cat: 'Pastries', image: 'photo-1686207855146-c3ffe2166d40', season: 'All Year' },
  { id: 61, name: '🍌 Vegan Banana Bread Muffin', desc: 'Plant-based banana bread muffin', price: 2.99, unitCost: 0.81, cat: 'Pastries', image: 'photo-1702234694004-8103bc2f7cff', season: 'All Year' },
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
