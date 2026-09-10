'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Appointment {
    id: string
    scheduledAt: string
    status: string
    type: string
    duration: number
    notes: string | null
    paymentAmount: number | null
    psychologist: {
        id: string
        user: { fullName: string | null; avatarUrl: string | null }
        hourlyRate: number
    }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    PENDING:   { label: 'در انتظار تأیید', color: '#854D0E', bg: '#FEF9C3', dot: '#CA8A04' },
    CONFIRMED: { label: 'تأیید شده',       color: '#1B4332', bg: '#D1FAE5', dot: '#059669' },
    COMPLETED: { label: 'برگزار شده',       color: '#065F46', bg: '#ECFDF5', dot: '#10B981' },
    CANCELLED: { label: 'لغو شده',         color: '#991B1B', bg: '#FEE2E2', dot: '#DC2626' },
    NO_SHOW:   { label: 'غایب',            color: '#5C5C5E', bg: '#F3EDE3', dot: '#8C8C8E' },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoCalendar({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
function IcoClock({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
function IcoVideo({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 8-6 4 6 4V8z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
    )
}
function IcoPhone({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    )
}
function IcoUser({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    )
}
function IcoPlus({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}
function IcoX({ size = 12, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
        </svg>
    )
}
function IcoNote({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    )
}
function IcoMoney({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}

// ─── Appointment Card ─────────────────────────────────────────────────────────

function AppointmentCard({ a, onCancel }: { a: Appointment; onCancel: (id: string) => void }) {
    const dt = new Date(a.scheduledAt)
    const s = STATUS_CFG[a.status] ?? { label: a.status, color: '#8C8C8E', bg: '#F3EDE3', dot: '#8C8C8E' }
    const name = a.psychologist?.user?.fullName ?? 'روانشناس'
    const canCancel = a.status === 'PENDING' || a.status === 'CONFIRMED'
    const isUpcoming = new Date(a.scheduledAt) > new Date() && a.status !== 'CANCELLED'

    const dateStr = dt.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr = dt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })

    return (
        <div className="rounded-2xl border overflow-hidden transition-all hover:shadow-md"
            style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 1px 6px rgba(27,67,50,0.05)' }}>

            {/* Colored top strip for upcoming */}
            {isUpcoming && (
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#1B4332,#52B788)' }} />
            )}

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center font-black text-white text-base"
                            style={{ background: a.psychologist?.user?.avatarUrl ? 'transparent' : '#1B4332' }}>
                            {a.psychologist?.user?.avatarUrl
                                ? <img src={a.psychologist.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                : name.charAt(0)}
                        </div>
                        {/* Type badge */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: '#E8F5E9', border: '1.5px solid white' }}>
                            {a.type === 'online'
                                ? <IcoVideo size={9} color="#1B4332" />
                                : <IcoPhone size={9} color="#1B4332" />}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-bold text-sm" style={{ color: '#1C1C1E' }}>{name}</p>
                                <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                                    {a.type === 'online' ? 'مشاوره آنلاین' : 'مشاوره تلفنی'}
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                                style={{ background: s.bg, color: s.color }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                                {s.label}
                            </span>
                        </div>

                        {/* Meta chips */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
                            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#5C5C5E' }}>
                                <IcoCalendar size={12} color="#C4B8A8" />
                                {dateStr}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#5C5C5E' }}>
                                <IcoClock size={12} color="#C4B8A8" />
                                {timeStr}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#5C5C5E' }}>
                                <IcoClock size={12} color="#C4B8A8" />
                                {a.duration.toLocaleString('fa-IR')} دقیقه
                            </span>
                            {a.paymentAmount != null && (
                                <span className="flex items-center gap-1.5 text-xs" style={{ color: '#5C5C5E' }}>
                                    <IcoMoney size={12} color="#C4B8A8" />
                                    {a.paymentAmount.toLocaleString('fa-IR')} تومان
                                </span>
                            )}
                        </div>

                        {/* Notes */}
                        {a.notes && (
                            <div className="flex items-start gap-2 mt-3 text-xs px-3 py-2 rounded-xl"
                                style={{ background: '#FDFBF8', border: '1px solid #EDE6D6', color: '#5C5C5E' }}>
                                <IcoNote size={12} color="#C4B8A8" />
                                <span className="line-clamp-2">{a.notes}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {canCancel && (
                    <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid #F3EDE3' }}>
                        <p className="text-xs" style={{ color: '#8C8C8E' }}>
                            لغو تا ۲ ساعت قبل از جلسه امکان‌پذیر است
                        </p>
                        <button onClick={() => onCancel(a.id)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-opacity hover:opacity-80"
                            style={{ background: '#FEE2E2', color: '#991B1B' }}>
                            <IcoX size={11} color="#991B1B" />
                            لغو نوبت
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

    useEffect(() => {
        api.get('/appointments?limit=50')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(r => setAppointments((r.data as any)?.data?.appointments ?? []))
            .catch(() => setAppointments([]))
            .finally(() => setLoading(false))
    }, [])

    const now = new Date()
    const upcoming = appointments.filter(a =>
        new Date(a.scheduledAt) >= now && a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && a.status !== 'NO_SHOW'
    )
    const past = appointments.filter(a =>
        new Date(a.scheduledAt) < now || a.status === 'CANCELLED' || a.status === 'COMPLETED' || a.status === 'NO_SHOW'
    )
    const displayed = tab === 'upcoming' ? upcoming : past

    const handleCancel = async (id: string) => {
        if (!confirm('آیا از لغو نوبت مطمئن هستید؟')) return
        try {
            await api.patch(`/appointments/${id}/cancel`)
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
        } catch { /* ignore */ }
    }

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>نوبت‌های مشاوره</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#8C8C8E' }}>مدیریت جلسات مشاوره روانشناسی</p>
                </div>
                <Link href="/psychologists"
                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
                    style={{ background: '#1B4332' }}>
                    <IcoPlus size={14} color="white" />
                    رزرو نوبت
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'کل نوبت‌ها',    value: appointments.length,                                                       icon: <IcoCalendar size={17} color="#1B4332" />,  bg: '#E8F5E9' },
                    { label: 'پیش رو',         value: upcoming.length,                                                           icon: <IcoClock    size={17} color="#1565C0" />,  bg: '#DBEAFE' },
                    { label: 'برگزار شده',     value: appointments.filter(a => a.status === 'COMPLETED').length,                  icon: <IcoUser     size={17} color="#065F46" />,  bg: '#D1FAE5' },
                    { label: 'لغو شده',        value: appointments.filter(a => a.status === 'CANCELLED').length,                  icon: <IcoX        size={17} color="#991B1B" />,  bg: '#FEE2E2' },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4 border flex items-center gap-3"
                        style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 1px 6px rgba(27,67,50,0.05)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                            {s.icon}
                        </div>
                        <div>
                            <div className="text-xl font-black leading-none" style={{ color: '#1C1C1E' }}>
                                {s.value.toLocaleString('fa-IR')}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 rounded-2xl" style={{ background: '#F3EDE3' }}>
                {([
                    ['upcoming', 'پیش رو', upcoming.length],
                    ['past',     'گذشته',  past.length],
                ] as const).map(([val, label, count]) => (
                    <button key={val} onClick={() => setTab(val)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={tab === val
                            ? { background: 'white', color: '#1B4332', boxShadow: '0 2px 8px rgba(27,67,50,0.1)' }
                            : { color: '#8C8C8E' }}>
                        {label}
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{
                                background: tab === val ? '#E8F5E9' : 'rgba(0,0,0,0.06)',
                                color: tab === val ? '#1B4332' : '#8C8C8E',
                            }}>
                            {count.toLocaleString('fa-IR')}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />
                    ))}
                </div>
            ) : displayed.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: '#E8F5E9' }}>
                        <IcoCalendar size={28} color="#1B4332" />
                    </div>
                    <p className="font-bold mb-1" style={{ color: '#1C1C1E' }}>
                        {tab === 'upcoming' ? 'نوبت پیش رویی ندارید' : 'سابقه‌ای ندارید'}
                    </p>
                    <p className="text-sm mb-5" style={{ color: '#8C8C8E' }}>
                        {tab === 'upcoming'
                            ? 'با روانشناسان متخصص یاری‌جو مشاوره بگیرید'
                            : 'جلسات قبلی شما اینجا نمایش داده می‌شود'}
                    </p>
                    {tab === 'upcoming' && (
                        <Link href="/psychologists"
                            className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                            style={{ background: '#1B4332' }}>
                            رزرو نوبت
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map(a => (
                        <AppointmentCard key={a.id} a={a} onCancel={handleCancel} />
                    ))}
                </div>
            )}
        </div>
    )
}
