'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface Notification {
    id: string
    title: string
    body: string
    type: string
    isRead: boolean
    createdAt: string
    data?: Record<string, unknown>
}

const TYPE_ICONS: Record<string, string> = {
    appointment: '📅', system: '📢', ticket: '🎫',
    payment: '💳', test: '🧠', order: '🛍️',
}

export default function NotificationsPage() {
    const [notifs, setNotifs] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [marking, setMarking] = useState(false)

    const load = () => {
        api.get('/notifications?limit=50')
            .then(r => setNotifs((r.data as any)?.data ?? []))
            .catch(() => setNotifs([]))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const markAllRead = async () => {
        setMarking(true)
        try {
            await api.patch('/notifications/read')
            setNotifs(n => n.map(x => ({ ...x, isRead: true })))
        } catch { }
        finally { setMarking(false) }
    }

    const markOne = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`)
            setNotifs(n => n.map(x => x.id === id ? { ...x, isRead: true } : x))
        } catch { }
    }

    const unread = notifs.filter(n => !n.isRead).length

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>اعلان‌ها</h1>
                    {unread > 0 && <p className="text-sm mt-0.5" style={{ color: '#8C8C8E' }}>{unread} اعلان خوانده نشده</p>}
                </div>
                {unread > 0 && (
                    <button onClick={markAllRead} disabled={marking}
                        className="text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-70 disabled:opacity-50"
                        style={{ color: '#1B4332', background: '#E8F5E9' }}>
                        {marking ? '...' : 'همه را خواندم'}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />)}</div>
            ) : notifs.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="text-5xl mb-3">🔔</div>
                    <p className="font-semibold" style={{ color: '#1C1C1E' }}>اعلانی ندارید</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifs.map(n => (
                        <div key={n.id}
                            className="flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer"
                            style={{
                                background: n.isRead ? 'white' : '#F0F9F4',
                                borderColor: n.isRead ? '#EDE6D6' : '#B2DFCB',
                            }}
                            onClick={() => !n.isRead && markOne(n.id)}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                style={{ background: n.isRead ? '#F3EDE3' : '#E8F5E9' }}>
                                {TYPE_ICONS[n.type] ?? '📣'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-bold text-sm" style={{ color: '#1C1C1E' }}>{n.title}</p>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#1B4332' }} />
                                    )}
                                </div>
                                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#5C5C5E' }}>{n.body}</p>
                                <p className="text-[11px] mt-1.5" style={{ color: '#8C8C8E' }}>
                                    {new Date(n.createdAt).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
