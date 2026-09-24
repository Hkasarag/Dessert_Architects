// Customer-facing promotions: featured on the Home page, redeemable at checkout,
// and used by the AI concierge when recommending products.

export type PromoCode = { type: 'pct' | 'flat'; value: number; label: string }

export const promoCodes: Record<string, PromoCode> = {
  COOKIE20: { type: 'pct', value: 0.20, label: '20% off — Weekend Cookie Bundle' },
  HOLIDAY10: { type: 'flat', value: 10, label: '$10 off — Holiday Dessert Special' },
  FAMILY15: { type: 'pct', value: 0.15, label: '15% off — Family Celebration Package' },
  WELCOME10: { type: 'pct', value: 0.10, label: '10% off — Welcome offer' },
}

export const featuredPromotions = [
  {
    id: 'p1',
    emoji: '🍪',
    name: 'Weekend Cookie Bundle',
    description: '1 dozen assorted cookies — chocolate chip, snickerdoodle & oatmeal raisin',
    discount: 'Save 20%',
    code: 'COOKIE20',
    color: '#FFF4E0',
    accent: '#F4A361',
    price: 18.00,
    unitCost: 5.76,
  },
  {
    id: 'p2',
    emoji: '🎄',
    name: 'Holiday Dessert Special',
    description: 'Seasonal holiday dessert tray with peppermint bark, gingerbread & yule log',
    discount: 'Save $10',
    code: 'HOLIDAY10',
    color: '#E8F5E9',
    accent: '#4CAF50',
    price: 42.00,
    unitCost: 13.20,
  },
  {
    id: 'p3',
    emoji: '🎉',
    name: 'Family Celebration Package',
    description: 'Custom celebration cake + 2 dozen mini cupcakes, perfect for 20–30 guests',
    discount: '15% Discount',
    code: 'FAMILY15',
    color: '#EDE7F6',
    accent: '#9C27B0',
    price: 68.00,
    unitCost: 23.80,
  },
]
