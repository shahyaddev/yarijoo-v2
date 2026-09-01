import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    title: string
    price: number
    quantity: number
    image?: string
}

interface CartStore {
    items: CartItem[]
    isOpen: boolean
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, qty: number) => void
    clearCart: () => void
    openCart: () => void
    closeCart: () => void
    total: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id)
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i,
                            ),
                        }
                    }
                    return { items: [...state.items, item] }
                }),
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                })),
            updateQuantity: (id, qty) =>
                set((state) => ({
                    items:
                        qty === 0
                            ? state.items.filter((i) => i.id !== id)
                            : state.items.map((i) =>
                                i.id === id ? { ...i, quantity: qty } : i,
                            ),
                })),
            clearCart: () => set({ items: [] }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            total: () =>
                get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        {
            name: 'yarijoo-cart',
            partialize: (state) => ({ items: state.items }),
        },
    ),
)
