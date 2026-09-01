import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth.store'

interface ChatMessage {
    id: string
    roomId: string
    senderId: string
    content: string
    type: string
    createdAt: string
}

interface UseChatSocketOptions {
    roomId: string | null
    onMessage: (msg: ChatMessage) => void
    onTyping?: (data: { userId: string; isTyping: boolean }) => void
}

export function useChatSocket({ roomId, onMessage, onTyping }: UseChatSocketOptions) {
    const { accessToken } = useAuthStore()
    const socketRef = useRef<Socket | null>(null)
    const reconnectDelay = useRef(1000)

    const connect = useCallback(() => {
        if (!accessToken) return

        const socket = io(
            `${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'}/chat`,
            { auth: { token: accessToken }, transports: ['websocket'] },
        )

        socket.on('connect', () => {
            reconnectDelay.current = 1000
            if (roomId) socket.emit('chat:join', { roomId })
        })

        socket.on('chat:message', onMessage)

        if (onTyping) {
            socket.on('chat:typing', onTyping)
        }

        socket.on('disconnect', () => {
            setTimeout(() => {
                reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000)
                connect()
            }, reconnectDelay.current)
        })

        socketRef.current = socket
    }, [accessToken, roomId, onMessage, onTyping])

    useEffect(() => {
        connect()
        return () => {
            socketRef.current?.disconnect()
        }
    }, [connect])

    const sendMessage = useCallback(
        (content: string, type = 'text') => {
            if (socketRef.current && roomId) {
                socketRef.current.emit('chat:send', { roomId, content, type })
            }
        },
        [roomId],
    )

    const sendTyping = useCallback(
        (isTyping: boolean) => {
            if (socketRef.current && roomId) {
                socketRef.current.emit('chat:typing', { roomId, isTyping })
            }
        },
        [roomId],
    )

    return { sendMessage, sendTyping, socket: socketRef.current }
}
