'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Ticket {
    id: string
    subject: string
    status: string
    priority: string
    createdAt: string
    updatedAt: string
    _count?: { messages: number }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    OPEN:             { label: 'باز',             color: '#065F46', bg: '#D1FAE5', dot: '#059669' },
    IN_PROGRESS:      { label: 'در حال بررسی',   color: '#1565C0', bg: '#DBEAFE', dot: '#3B82F6' },
    WAITING_FOR_USER: { label: 'منتظر پاسخ',     color: '#854D0E', bg: '#FEF9C3', dot: '#CA8A04' },
    RESOLVED:         { label: 'حل شده',          color: '#065F46', bg: '#ECFDF5', dot: '#10B981' },
    CLOSED:           { label: 'بسته',            color: '#5C5C5E', bg: '#F3EDE3', dot: '#C4B8A8' },
}

const PRIORITY_CFG: Record<string, { label: string; color: string; bg: string }> = {
    LOW:    { label: 'کم',    color: '#5C5C5E', bg: '#F3EDE3' },
    MEDIUM: { label: 'متوسط', color: '#1565C0', bg: '#DBEAFE' },
    HIGH:   { label: 'زیاد', color: '#854D0E', bg: '#FEF9C3' },
    URGENT: { label: 'فوری', color: '#991B1B', bg: '#FEE2E2' },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoTicket({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2M13 17v2M13 11v2" />
        </svg>
    )
}
function IcoPlus({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}
function IcoX({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    )
}
function IcoCheck({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
function IcoAlert({ size = 13, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
    )
}
function IcoCalendar({ size = 12, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
function IcoMessage({ size = 12, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
function IcoChevronLeft({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TicketsPage() {
    const [tickets,    setTickets]    = useState<Ticket[]>([])
    const [loading,    setLoading]    = useState(true)
    const [filter,     setFilter]     = useState<'all' | 'open' | 'closed'>('all')
    const [showForm,   setShowForm]   = useState(false)
    const [form,       setForm]       = useState({ subject: '', content: '', priority: 'MEDIUM' })
    const [imageFile,  setImageFile]  = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploading,  setUploading]  = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success,    setSuccess]    = useState('')
    const [error,      setError]      = useState('')
    const fileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        api.get('/tickets?limit=100')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(r => {
                const raw = (r.data as any)?.data
                // backend returns array directly (wrapped by ResponseInterceptor)
                const list = Array.isArray(raw) ? raw : (raw?.tickets ?? [])
                setTickets(list)
            })
            .catch(() => setTickets([]))
            .finally(() => setLoading(false))
    }, [])

    const createTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.subject.trim() || !form.content.trim()) { setError('موضوع و پیام الزامی هستند'); return }
        if (form.content.trim().length < 10) { setError('پیام باید حداقل ۱۰ کاراکتر باشد'); return }
        setSubmitting(true); setError('')

        // Upload image first if selected
        let imageUrl: string | undefined
        if (imageFile) {
            setUploading(true)
            try {
                const fd = new FormData()
                fd.append('file', imageFile)
                const res = await api.post<{ data: { avatarUrl?: string; url?: string } }>('/users/avatar', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                imageUrl = res.data?.data?.avatarUrl ?? res.data?.data?.url
            } catch {
                // ignore upload error — send ticket without image
            } finally { setUploading(false) }
        }

        try {
            const res = await api.post('/tickets', {
                subject:  form.subject.trim(),
                content:  form.content.trim(),
                priority: form.priority,
                ...(imageUrl ? { imageUrl } : {}),
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const t = (res.data as any)?.data
            if (t) setTickets(prev => [t, ...prev])
            setSuccess('تیکت با موفقیت ارسال شد')
            setForm({ subject: '', content: '', priority: 'MEDIUM' })
            setImageFile(null); setImagePreview(null)
            setShowForm(false)
        } catch (err: unknown) {
            const raw = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
            setError(Array.isArray(raw) ? raw[0] : (raw ?? 'خطا در ارسال تیکت'))
        } finally { setSubmitting(false) }
    }

    const open     = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_USER').length
    const resolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>تیکت‌های پشتیبانی</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#8C8C8E' }}>ارتباط با تیم پشتیبانی یاری‌جو</p>
                </div>
                <button
                    onClick={() => { setShowForm(v => !v); setError(''); setSuccess('') }}
                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
                    style={{ background: showForm ? '#374151' : '#1B4332' }}>
                    {showForm ? <><IcoX size={14} color="white" /> بستن</> : <><IcoPlus size={14} color="white" /> تیکت جدید</>}
                </button>
            </div>

            {/* Stats */}
            {!loading && tickets.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'کل تیکت‌ها', value: tickets.length, icon: <IcoTicket size={17} color="#1B4332" />, bg: '#E8F5E9' },
                        { label: 'فعال',         value: open,          icon: <IcoMessage size={17} color="#1565C0" />, bg: '#DBEAFE' },
                        { label: 'حل شده',       value: resolved,      icon: <IcoCheck size={17} color="#065F46" />,   bg: '#D1FAE5' },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-4 border flex items-center gap-3"
                            style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 1px 6px rgba(27,67,50,0.05)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                                {s.icon}
                            </div>
                            <div>
                                <div className="font-black text-lg leading-none" style={{ color: '#1C1C1E' }}>
                                    {s.value.toLocaleString('fa-IR')}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Success banner */}
            {success && (
                <div className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#A7F3D0' }}>
                        <IcoCheck size={14} color="#065F46" />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#065F46' }}>{success}</p>
                </div>
            )}

            {/* New ticket form */}
            {showForm && (
                <form onSubmit={createTicket}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 16px rgba(27,67,50,0.07)' }}>

                    <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                        <h2 className="font-black text-[15px]" style={{ color: '#1C1C1E' }}>تیکت جدید</h2>
                        <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>مشکل یا سوال خود را شرح دهید</p>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Subject */}
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>
                                موضوع <span style={{ color: '#C62828' }}>*</span>
                            </label>
                            <input required value={form.subject}
                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                placeholder="موضوع مشکل را بنویسید"
                                className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors"
                                style={{ borderColor: '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }}
                                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#1B4332'}
                                onBlur={e  => (e.target as HTMLInputElement).style.borderColor = '#EDE6D6'} />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>اولویت</label>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.entries(PRIORITY_CFG).map(([val, cfg]) => (
                                    <button key={val} type="button"
                                        onClick={() => setForm({ ...form, priority: val })}
                                        className="py-2 rounded-xl text-xs font-bold transition-all"
                                        style={{
                                            background: form.priority === val ? cfg.bg : 'white',
                                            color: form.priority === val ? cfg.color : '#8C8C8E',
                                            border: `1.5px solid ${form.priority === val ? cfg.color + '44' : '#EDE6D6'}`,
                                        }}>
                                        {cfg.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>
                                پیام <span style={{ color: '#C62828' }}>*</span>
                            </label>
                            <textarea required value={form.content} rows={4}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                placeholder="مشکل خود را با جزئیات توضیح دهید..."
                                className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none resize-none transition-colors"
                                style={{ borderColor: '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }}
                                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#1B4332'}
                                onBlur={e  => (e.target as HTMLTextAreaElement).style.borderColor = '#EDE6D6'} />
                            <p className="text-xs mt-1" style={{ color: '#C4B8A8' }}>حداقل ۱۰ کاراکتر</p>
                        </div>

                        {/* Image upload */}
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>
                                پیوست تصویر <span style={{ color: '#8C8C8E' }}>(اختیاری)</span>
                            </label>

                            {imagePreview ? (
                                <div className="relative rounded-xl overflow-hidden border"
                                    style={{ borderColor: '#EDE6D6' }}>
                                    <img src={imagePreview} alt="پیوست" className="w-full max-h-40 object-cover" />
                                    <button type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                                        className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center"
                                        style={{ background: 'rgba(0,0,0,0.5)' }}>
                                        <IcoX size={12} color="white" />
                                    </button>
                                </div>
                            ) : (
                                <button type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors hover:border-[#1B4332] hover:bg-[#F0FDF4]"
                                    style={{ borderColor: '#EDE6D6', color: '#8C8C8E' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    بارگذاری تصویر
                                </button>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                onChange={e => {
                                    const f = e.target.files?.[0]
                                    if (!f) return
                                    if (f.size > 5 * 1024 * 1024) { setError('حجم تصویر نباید بیشتر از ۵ مگابایت باشد'); return }
                                    setImageFile(f)
                                    const reader = new FileReader()
                                    reader.onload = ev => setImagePreview(ev.target?.result as string)
                                    reader.readAsDataURL(f)
                                }} />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#C62828' }}>
                                <IcoAlert size={13} color="#C62828" />{error}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-1">
                            <button type="submit" disabled={submitting || uploading}
                                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)' }}>
                                {uploading
                                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />آپلود تصویر...</>
                                    : submitting
                                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />در حال ارسال...</>
                                    : <><IcoTicket size={15} color="white" />ارسال تیکت</>}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-5 py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-[#F3EDE3]"
                                style={{ borderColor: '#EDE6D6', color: '#8C8C8E' }}>
                                لغو
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Filter tabs */}
            {!loading && tickets.length > 0 && (
                <div className="flex gap-2">
                    {([
                        ['all',    'همه',         tickets.length],
                        ['open',   'فعال',         open],
                        ['closed', 'بسته/حل شده', resolved],
                    ] as const).map(([val, label, count]) => (
                        <button key={val} onClick={() => setFilter(val)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                            style={{
                                background: filter === val ? '#1B4332' : 'white',
                                color:      filter === val ? 'white'    : '#5C5C5E',
                                border:    `1px solid ${filter === val ? '#1B4332' : '#EDE6D6'}`,
                            }}>
                            {label}
                            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                                style={{
                                    background: filter === val ? 'rgba(255,255,255,0.2)' : '#F3EDE3',
                                    color:      filter === val ? 'white' : '#1B4332',
                                }}>
                                {(count as number).toLocaleString('fa-IR')}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: '#E8F5E9' }}>
                        <IcoTicket size={28} color="#1B4332" />
                    </div>
                    <p className="font-bold mb-1" style={{ color: '#1C1C1E' }}>تیکتی ندارید</p>
                    <p className="text-sm mb-5" style={{ color: '#8C8C8E' }}>برای ارتباط با پشتیبانی تیکت بسازید</p>
                    <button onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: '#1B4332' }}>
                        <IcoPlus size={13} color="white" />
                        تیکت جدید
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets
                        .filter(t => {
                            if (filter === 'open')   return t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_USER'
                            if (filter === 'closed') return t.status === 'RESOLVED' || t.status === 'CLOSED'
                            return true
                        })
                        .map(t => {
                        const s = STATUS_CFG[t.status]   ?? { label: t.status,    color: '#8C8C8E', bg: '#F3EDE3', dot: '#8C8C8E' }
                        const p = PRIORITY_CFG[t.priority] ?? { label: t.priority, color: '#8C8C8E', bg: '#F3EDE3' }

                        return (
                            <Link key={t.id} href={`/dashboard/tickets/${t.id}`}
                                className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md group"
                                style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 1px 6px rgba(27,67,50,0.04)' }}>

                                {/* Icon */}
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: s.bg }}>
                                    <IcoTicket size={19} color={s.color} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate" style={{ color: '#1C1C1E' }}>{t.subject}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: '#8C8C8E' }}>
                                        <span className="flex items-center gap-1">
                                            <IcoCalendar size={11} color="#C4B8A8" />
                                            {new Date(t.createdAt).toLocaleDateString('fa-IR')}
                                        </span>
                                        {t._count?.messages ? (
                                            <span className="flex items-center gap-1">
                                                <IcoMessage size={11} color="#C4B8A8" />
                                                {t._count.messages.toLocaleString('fa-IR')} پیام
                                            </span>
                                        ) : null}
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: p.bg, color: p.color }}>
                                            {p.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Status + arrow */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                                        style={{ background: s.bg, color: s.color }}>
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                                        {s.label}
                                    </span>
                                    <IcoChevronLeft size={14} color="#C4B8A8" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
