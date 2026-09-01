'use client'
import { useState, useEffect } from 'react'
import ChatWindow from '@/components/features/chat/ChatWindow'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'

interface ChatMember {
    id: string
    user: { id: string; fullName: string | null; avatarUrl: string | null }
}

interface LastMessage {
    content: string
    createdAt: string
}

interface ChatRoom {
    id: string
    name: string | null
    type: string
    members: ChatMember[]
    messages: LastMessage[]
}

function getRoomName(room: ChatRoom, currentUserId: string): string {
    if (room.name) return room.name
    // For direct rooms, show the other participant's name
    const other = room.members.find((m) => m.user.id !== currentUserId)
    return other?.user.fullName ?? 'گفتگو'
}

function formatTime(iso: string): string {
    const date = new Date(iso)
    const now = new Date()
    const diffH = (now.getTime() - date.getTime()) / 3600000
    if (diffH < 24) {
        return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    }
    return 'دیروز'
}

export default function MessagesPage() {
    const { user } = useAuthStore()
    const currentUserId = user?.id ?? ''

    const [rooms, setRooms] = useState<ChatRoom[]>([])
    const [loading, setLoading] = useState(true)
    const [activeRoom, setActiveRoom] = useState<string | null>(null)

    useEffect(() => {
        api.get<{ data: ChatRoom[] }>('/chat/rooms')
            .then((res) => {
                const data: ChatRoom[] = Array.isArray(res.data)
                    ? (res.data as ChatRoom[])
                    : ((res.data as { data: ChatRoom[] }).data ?? [])
                setRooms(data)
                if (data.length > 0 && !activeRoom) {
                    setActiveRoom(data[0].id)
                }
            })
            .catch(() => setRooms([]))
            .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Room list */}
            <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-bold text-gray-900 dark:text-white">پیام‌ها</h2>
                </div>

                <div className="overflow-y-auto flex-1">
                    {loading ? (
                        <div className="space-y-1 p-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
                            ))}
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
                            <span className="text-3xl">💬</span>
                            <span>گفتگویی ندارید</span>
                        </div>
                    ) : (
                        rooms.map((room) => {
                            const name = getRoomName(room, currentUserId)
                            const last = room.messages[0]
                            const unreadCount = 0 // unread tracking via WebSocket read receipts
                            return (
                                <button
                                    key={room.id}
                                    onClick={() => setActiveRoom(room.id)}
                                    className={[
                                        'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800/50',
                                        activeRoom === room.id ? 'bg-primary-50 dark:bg-primary-900/20' : '',
                                    ].join(' ')}
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-lg flex-shrink-0">
                                        {room.type === 'group' ? '👥' : '💬'}
                                    </div>
                                    <div className="flex-1 min-w-0 text-right">
                                        <div className="flex items-center justify-between">
                                            {last && (
                                                <span className="text-xs text-gray-400">
                                                    {formatTime(last.createdAt)}
                                                </span>
                                            )}
                                            <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                {name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            {unreadCount > 0 && (
                                                <Badge variant="success" className="text-xs">
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                            {last && (
                                                <p className="text-xs text-gray-400 truncate flex-1 text-right mr-1">
                                                    {last.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Chat window */}
            <div className="flex-1">
                {activeRoom ? (
                    <ChatWindow currentUserId={currentUserId} roomId={activeRoom} />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                            <div className="text-5xl mb-3">💬</div>
                            <p>یک مکالمه را انتخاب کنید</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
