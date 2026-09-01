'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

interface Appointment {
    id: string
    scheduledAt: string
    status: string
    type: string
    duration: number
    notes: string | null
    psychologist: {
        id: string
        user: { fullName: string | null; avatarUrl: string | null }
        hourlyRate: number
    }
}

const STATUS: Record<string, { l: string; c: string; bg: string }> = {
    PENDING: { l: 'در انتظار تأیید', c: '#C9A84C', bg: '#FFF8E1' },
    CONFIRMED: { l: 'تأیید شده', c: '#1B4332', bg: '#E8F5E9' },
    COMPLETED: { l: 'برگزار شده', c: '#2D6A4F', bg: '#F1F8E9' },
    CANCELLED: { l: 'لغو شده', c: '#C62828', bg: '#FCE4EC' },
    NO_SHOW: { l: 'غایب', c: '#8C8C8E', bg: '#F3EDE3' },
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

    useEffect(() => {
        api.get('/appointments?limit=50')
            .then(r => setAppointments((r.data as any)?.data?.appointments ?? []))
            .catch(() => setAppointments([]))
            .finally(() => setLoading(false))
    }, [])

    const now = new Date()
    const upcoming = appointments.filter(a => new Date(a.scheduledAt) >= now && a.status !== 'CANCELLED')
    const past = appointments.filter(a => new Date(a.scheduledAt) < now || a.status === 'CANCELLED' || a.status === 'COMPLETED')
    const displayed = tab === 'upcoming' ? upcoming : past

    const cancel = async (id: string) => {
        if (!confirm('آیا از لغو نوبت مطمئن هستید؟')) return
        try {
            await api.patch(`/appointments/${id}/cancel`)
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
        } catch { }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>نوبت‌های مشاوره</h1>
                <Link href="/psychologists"
                    className="text-sm font-bold px-4 py-2 rounded-xl text-white"
                    style={{ background: '#1B4332' }}>
                    + رزرو نوبت
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: '#F3EDE3' }}>
                {[
                    { v: 'upcoming', l: `پیش رو (${upcoming.length})` },
                    { v: 'past', l: `قبلی (${past.length})` },
                ].map(t => (
                    <button key={t.v} onClick={() => setTab(t.v as 'upcoming' | 'past')}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={tab === t.v
                            ? { background: 'white', color: '#1B4332', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                            : { color: '#8C8C8E' }}>
                        {t.l}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />)}</div>
            ) : displayed.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="text-5xl mb-3">📅</div>
                    <p className="font-semibold mb-2" style={{ color: '#1C1C1E' }}>
                        {tab === 'upcoming' ? 'نوبت پیش رویی ندارید' : 'سابقه‌ای ندارید'}
                    </p>
                    {tab === 'upcoming' && (
                        <Link href="/psychologists"
                            className="inline-block mt-3 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                            style={{ background: '#1B4332' }}>رزرو نوبت</Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map(a => {
                        const dt = new Date(a.scheduledAt)
                        const s = STATUS[a.status] ?? { l: a.status, c: '#8C8C8E', bg: '#F3EDE3' }
                        const name = a.psychologist?.user?.fullName ?? 'روانشناس'
                        const canCancel = a.status === 'PENDING' || a.status === 'CONFIRMED'
                        return (
                            <div key={a.id} className="rounded-2xl border p-5 transition-all hover:shadow-sm"
                                style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
                                        style={{ background: '#1B4332' }}>
                                        {name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-bold text-sm" style={{ color: '#1C1C1E' }}>{name}</p>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                                                style={{ background: s.bg, color: s.c }}>{s.l}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap" style={{ color: '#8C8C8E' }}>
                                            <span>📅 {dt.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            <span>⏰ {dt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>{a.type === 'online' ? '📹 آنلاین' : '📞 تلفنی'}</span>
                                            <span>{a.duration} دقیقه</span>
                                        </div>
                                        {a.notes && <p className="text-xs mt-1.5 line-clamp-1" style={{ color: '#5C5C5E' }}>{a.notes}</p>}
                                    </div>
                                </div>
                                {canCancel && (
                                    <div className="flex justify-end mt-3 pt-3 border-t" style={{ borderColor: '#F3EDE3' }}>
                                        <button onClick={() => cancel(a.id)}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors hover:opacity-70"
                                            style={{ color: '#C62828', background: '#FCE4EC' }}>
                                            لغو نوبت
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
