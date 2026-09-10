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
    const other = room.members.find(m => m.user.id !== currentUserId)
    return other?.user.fullName ?? 'گفتگو'
}

function formatTime(iso: string): string {
    const date = new Date(iso)
    const diffH = (Date.now() - date.getTime()) / 3600000
    if (diffH < 24) return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    return 'دیروز'
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoMessage({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}

function IcoUsers({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
    const { user } = useAuthStore()
    const currentUserId = user?.id ?? ''

    const [rooms,      setRooms]      = useState<ChatRoom[]>([])
    const [loading,    setLoading]    = useState(true)
    const [activeRoom, setActiveRoom] = useState<string | null>(null)

    useEffect(() => {
        api.get<{ data: ChatRoom[] }>('/chat/rooms')
            .then(res => {
                const data: ChatRoom[] = Array.isArray(res.data)
                    ? (res.data as ChatRoom[])
                    : ((res.data as { data: ChatRoom[] }).data ?? [])
                setRooms(data)
                if (data.length > 0 && !activeRoom) setActiveRoom(data[0].id)
            })
            .catch(() => setRooms([]))
            .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">

            {/* ── Room list ────────────────────────────── */}
            <div className="w-72 flex-shrink-0 rounded-2xl flex flex-col overflow-hidden"
                style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 12px rgba(27,67,50,0.06)' }}>

                {/* Header */}
                <div className="px-4 py-4 flex items-center gap-2.5"
                    style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#E8F5E9' }}>
                        <IcoMessage size={15} color="#1B4332" />
                    </div>
                    <h2 className="font-black text-sm" style={{ color: '#1C1C1E' }}>پیام‌ها</h2>
                    {rooms.length > 0 && (
                        <span className="mr-auto text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: '#E8F5E9', color: '#1B4332' }}>
                            {rooms.length.toLocaleString('fa-IR')}
                        </span>
                    )}
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1">
                    {loading ? (
                        <div className="space-y-2 p-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#F3EDE3' }} />
                            ))}
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 px-4 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#F3EDE3' }}>
                                <IcoMessage size={22} color="#C4B8A8" />
                            </div>
                            <p className="text-sm" style={{ color: '#8C8C8E' }}>گفتگویی ندارید</p>
                        </div>
                    ) : (
                        rooms.map(room => {
                            const name    = getRoomName(room, currentUserId)
                            const last    = room.messages[0]
                            const isActive = activeRoom === room.id
                            const initial = name.charAt(0).toUpperCase()

                            return (
                                <button key={room.id} onClick={() => setActiveRoom(room.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-right"
                                    style={{
                                        borderBottom: '1px solid #F9F6F1',
                                        background: isActive ? '#E8F5E9' : 'transparent',
                                    }}
                                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#FDFBF8' }}
                                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
                                        style={{ background: isActive ? '#1B4332' : '#2D6A4F' }}>
                                        {room.type === 'group'
                                            ? <IcoUsers size={16} color="white" />
                                            : initial}
                                    </div>

                                    <div className="flex-1 min-w-0 text-right">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-xs" style={{ color: '#8C8C8E' }}>
                                                {last ? formatTime(last.createdAt) : ''}
                                            </span>
                                            <span className="text-sm font-bold truncate" style={{ color: '#1C1C1E' }}>
                                                {name}
                                            </span>
                                        </div>
                                        {last && (
                                            <p className="text-xs truncate mt-0.5 text-right" style={{ color: '#8C8C8E' }}>
                                                {last.content}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* ── Chat window ──────────────────────────── */}
            <div className="flex-1 rounded-2xl overflow-hidden"
                style={{ border: '1px solid #EDE6D6', boxShadow: '0 2px 12px rgba(27,67,50,0.06)' }}>
                {activeRoom ? (
                    <ChatWindow currentUserId={currentUserId} roomId={activeRoom} />
                ) : (
                    <div className="h-full flex items-center justify-center"
                        style={{ background: 'white' }}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                style={{ background: '#E8F5E9' }}>
                                <IcoMessage size={28} color="#1B4332" />
                            </div>
                            <p className="font-semibold text-sm" style={{ color: '#1C1C1E' }}>یک مکالمه را انتخاب کنید</p>
                            <p className="text-xs mt-1" style={{ color: '#8C8C8E' }}>از لیست سمت راست یک گفتگو را انتخاب کنید</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
