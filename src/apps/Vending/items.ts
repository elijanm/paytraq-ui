export interface VendingItem {
  id: string
  name: string
  price: number       // KES × 100 (cents)
  emoji: string
  category: string
  stock: number
  ageRestricted?: boolean  // requires 18+ verification before purchase
}

export const ITEMS: VendingItem[] = [
  // Regular items
  { id: 'soda',    name: 'Soda',         price: 5000,  emoji: '🥤', category: 'Drinks', stock: 20 },
  { id: 'water',   name: 'Water',        price: 3000,  emoji: '💧', category: 'Drinks', stock: 30 },
  { id: 'juice',   name: 'Juice',        price: 8000,  emoji: '🧃', category: 'Drinks', stock: 15 },
  { id: 'milk',    name: 'Milk',         price: 6000,  emoji: '🥛', category: 'Drinks', stock: 12 },
  { id: 'crisps',  name: 'Crisps',       price: 4000,  emoji: '🍟', category: 'Snacks', stock: 25 },
  { id: 'choc',    name: 'Chocolate',    price: 7000,  emoji: '🍫', category: 'Snacks', stock: 18 },
  { id: 'biscuit', name: 'Biscuits',     price: 3500,  emoji: '🍪', category: 'Snacks', stock: 20 },
  { id: 'gum',     name: 'Gum',          price: 2000,  emoji: '🍬', category: 'Snacks', stock: 40 },
  { id: 'yogurt',  name: 'Yogurt',       price: 9000,  emoji: '🫙', category: 'Snacks', stock: 8  },
  { id: 'nuts',    name: 'Mixed Nuts',   price: 10000, emoji: '🥜', category: 'Snacks', stock: 15 },
  { id: 'bar',     name: 'Cereal Bar',   price: 5500,  emoji: '🍫', category: 'Snacks', stock: 22 },

  // Age-restricted (18 +) — shown with a badge in the grid
  { id: 'energy',  name: 'Energy Drink', price: 12000, emoji: '⚡', category: 'Drinks', stock: 10, ageRestricted: true },
  { id: 'beer',    name: 'Beer',         price: 15000, emoji: '🍺', category: 'Drinks', stock: 8,  ageRestricted: true },
  { id: 'wine',    name: 'Wine',         price: 22000, emoji: '🍷', category: 'Drinks', stock: 6,  ageRestricted: true },
  { id: 'whiskey', name: 'Whiskey',      price: 35000, emoji: '🥃', category: 'Drinks', stock: 4,  ageRestricted: true },
]
