import { create } from 'zustand'

interface NotificationItem {
    id: string
    type: string
    title: string
    body: string
    isRead: boolean
    createdAt: string
}

interface NotificationStore {
    notifications: NotificationItem[]
    unreadCount: number
    addNotification: (n: NotificationItem) => void
    setUnreadCount: (count: number) => void
    markAllRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unreadCount: 0,
    addNotification: (n) =>
        set((state) => ({
            notifications: [n, ...state.notifications].slice(0, 50),
            unreadCount: state.unreadCount + (n.isRead ? 0 : 1),
        })),
    setUnreadCount: (count) => set({ unreadCount: count }),
    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
        })),
}))
