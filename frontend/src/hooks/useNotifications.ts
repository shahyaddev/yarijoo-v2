'use client'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'

export function useNotifications() {
    const { accessToken } = useAuthStore()
    const { addNotification, setUnreadCount } = useNotificationStore()

    useEffect(() => {
        if (!accessToken) return

        const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
            auth: { token: accessToken },
            transports: ['websocket'],
        })

        socket.on('notification:new', (data) => {
            addNotification({ ...data, isRead: false })
        })

        socket.on('notification:badge', ({ unreadCount }: { unreadCount: number }) => {
            setUnreadCount(unreadCount)
        })

        return () => {
            socket.disconnect()
        }
    }, [accessToken, addNotification, setUnreadCount])
}
