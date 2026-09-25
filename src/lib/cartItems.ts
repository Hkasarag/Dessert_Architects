import type { CartItem } from '../App'
import type { MenuProduct } from '../data/menuProducts'
import type { featuredPromotions } from '../data/promotions'

export const menuImageUrl = (image: string, width: number, height: number) =>
  `https://images.unsplash.com/${image}?w=${width}&h=${height}&fit=crop&auto=format`

/** The cart entry for a menu product, at its current menu price. */
export const cartItemFromMenuProduct = (product: MenuProduct): Omit<CartItem, 'quantity'> => ({
  id: product.id,
  name: product.name,
  price: product.price,
  unitCost: product.unitCost,
  image: menuImageUrl(product.image, 200, 200),
})

type FeaturedPromotion = (typeof featuredPromotions)[number]

/** Featured bundles use cart ids 91, 92, 93 for promotions p1, p2, p3. */
export const bundleCartId = (promo: FeaturedPromotion) => parseInt('9' + promo.id.replace('p', ''))

export const cartItemFromBundle = (promo: FeaturedPromotion): Omit<CartItem, 'quantity'> => ({
  id: bundleCartId(promo),
  name: promo.name,
  price: promo.price,
  unitCost: promo.unitCost,
  image: '',
})
