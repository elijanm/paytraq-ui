import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, delta: number) => void
  clearCart: () => void
  total: () => number
  totalItems: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const existing = get().items.find(i => i.id === item.id)
    if (existing) {
      set(s => ({ items: s.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }))
    } else {
      set(s => ({ items: [...s.items, { ...item, quantity: 1 }] }))
    }
  },

  removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),

  updateQty: (id, delta) => {
    set(s => ({
      items: s.items
        .map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0),
    }))
  },

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
