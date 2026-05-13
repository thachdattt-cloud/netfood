import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(persist(
  (set, get) => ({
    items: [],
    tableId: null,
    setTable: (tableId) => set({ tableId }),
    addItem: (item) => {
      const items = get().items
      const exists = items.find(i => i.menuItemId === item.menuItemId)
      if (exists) {
        set({ items: items.map(i => i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i) })
      } else {
        set({ items: [...items, { ...item, quantity: 1 }] })
      }
    },
    removeItem: (menuItemId) => set({ items: get().items.filter(i => i.menuItemId !== menuItemId) }),
    updateQty: (menuItemId, quantity) => {
      if (quantity <= 0) {
        set({ items: get().items.filter(i => i.menuItemId !== menuItemId) })
        return
      }
      set({ items: get().items.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i) })
    },
    clearCart: () => set({ items: [], tableId: null }),
    getTotal: () => get().items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
  }),
  { name: 'cart-storage' }
))