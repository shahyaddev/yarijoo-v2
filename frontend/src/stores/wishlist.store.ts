import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

interface WishlistItem {
    productId: string
    bookmarkId: string
}

interface WishlistStore {
    items: WishlistItem[]
    // optimistic helpers
    isSaved: (productId: string) => boolean
    bookmarkId: (productId: string) => string | null
    // server actions
    toggle: (productId: string) => Promise<void>
    fetchStatus: (productId: string) => Promise<void>
}

interface WishlistResponse {
    data?: { saved: boolean; bookmarkId: string | null }
    saved?: boolean
    bookmarkId?: string | null
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            isSaved: (productId) =>
                get().items.some((i) => i.productId === productId),

            bookmarkId: (productId) =>
                get().items.find((i) => i.productId === productId)?.bookmarkId ?? null,

            fetchStatus: async (productId) => {
                try {
                    const res = await api.get<WishlistResponse>(
                        `/shop/products/${productId}/wishlist`,
                    )
                    const payload = res.data?.data ?? res.data
                    if (payload?.saved && payload.bookmarkId) {
                        set((s) => ({
                            items: [
                                ...s.items.filter((i) => i.productId !== productId),
                                { productId, bookmarkId: payload.bookmarkId! },
                            ],
                        }))
                    } else {
                        set((s) => ({
                            items: s.items.filter((i) => i.productId !== productId),
                        }))
                    }
                } catch {
                    // unauthenticated → leave local state as-is
                }
            },

            toggle: async (productId) => {
                const saved = get().isSaved(productId)

                // --- optimistic update ---
                if (saved) {
                    set((s) => ({
                        items: s.items.filter((i) => i.productId !== productId),
                    }))
                } else {
                    set((s) => ({
                        items: [...s.items, { productId, bookmarkId: '__pending__' }],
                    }))
                }

                try {
                    if (saved) {
                        await api.delete(`/shop/products/${productId}/wishlist`)
                    } else {
                        const res = await api.post<WishlistResponse>(
                            `/shop/products/${productId}/wishlist`,
                        )
                        const payload = res.data?.data ?? res.data
                        const id = payload?.bookmarkId ?? '__ok__'
                        // replace pending with real bookmarkId
                        set((s) => ({
                            items: [
                                ...s.items.filter((i) => i.productId !== productId),
                                { productId, bookmarkId: id },
                            ],
                        }))
                    }
                } catch {
                    // rollback optimistic update
                    if (saved) {
                        const id = get().bookmarkId(productId) ?? '__rollback__'
                        set((s) => ({
                            items: [...s.items, { productId, bookmarkId: id }],
                        }))
                    } else {
                        set((s) => ({
                            items: s.items.filter((i) => i.productId !== productId),
                        }))
                    }
                }
            },
        }),
        {
            name: 'yarijoo-wishlist',
            partialize: (s) => ({ items: s.items }),
        },
    ),
)
