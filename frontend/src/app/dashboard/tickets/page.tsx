'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

interface Ticket {
    id: string
    subject: string
    status: string
    priority: string
    createdAt: string
    updatedAt: string
    _count?: { messages: number }
}

const STATUS = { OPEN: { l: 'باز', c: '#1B4332', bg: '#E8F5E9' }, IN_PROGRESS: { l: 'در حال بررسی', c: '#1565C0', bg: '#E3F2FD' }, WAITING_FOR_USER: { l: 'منتظر پاسخ', c: '#C9A84C', bg: '#FFF8E1' }, RESOLVED: { l: 'حل شده', c: '#2D6A4F', bg: '#F1F8E9' }, CLOSED: { l: 'بسته', c: '#8C8C8E', bg: '#F3EDE3' } }
const PRIORITY = { LOW: 'کم', MEDIUM: 'متوسط', HIGH: 'زیاد', URGENT: 'فوری' }

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ subject: '', message: '', priority: 'MEDIUM' })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/tickets?limit=50')
            .then(r => setTickets((r.data as any)?.data?.tickets ?? []))
            .catch(() => setTickets([]))
            .finally(() => setLoading(false))
    }, [])

    const createTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.subject.trim() || !form.message.trim()) { setError('موضوع و پیام الزامی هستند'); return }
        setSubmitting(true); setError('')
        try {
            const res = await api.post('/tickets', { subject: form.subject.trim(), message: form.message.trim(), priority: form.priority })
            const t = (res.data as any)?.data
            if (t) setTickets(prev => [t, ...prev])
            setSuccess('تیکت با موفقیت ارسال شد')
            setForm({ subject: '', message: '', priority: 'MEDIUM' })
            setShowForm(false)
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ارسال تیکت')
        } finally { setSubmitting(false) }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>تیکت پشتیبانی</h1>
                <button onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
                    className="text-sm font-bold px-4 py-2 rounded-xl text-white transition-colors"
                    style={{ background: showForm ? '#374151' : '#1B4332' }}>
                    {showForm ? '× بستن' : '+ تیکت جدید'}
                </button>
            </div>

            {success && <div className="mb-4 p-3 rounded-xl text-sm font-semibold" style={{ background: '#E8F5E9', color: '#1B4332' }}>✅ {success}</div>}

            {showForm && (
                <form onSubmit={createTicket} className="mb-6 rounded-2xl border p-5 space-y-4" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <h2 className="font-bold" style={{ color: '#1C1C1E' }}>تیکت جدید</h2>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: '#5C5C5E' }}>موضوع *</label>
                        <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                            placeholder="موضوع مشکل خود را بنویسید"
                            className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none"
                            style={{ borderColor: '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: '#5C5C5E' }}>اولویت</label>
                        <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none"
                            style={{ borderColor: '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }}>
                            {Object.entries(PRIORITY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: '#5C5C5E' }}>پیام *</label>
                        <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                            rows={4} placeholder="مشکل خود را توضیح دهید..."
                            className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none resize-none"
                            style={{ borderColor: '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }} />
                    </div>
                    {error && <p className="text-xs font-semibold" style={{ color: '#C62828' }}>⚠️ {error}</p>}
                    <div className="flex gap-3">
                        <button type="submit" disabled={submitting}
                            className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50"
                            style={{ background: '#1B4332' }}>
                            {submitting ? 'در حال ارسال...' : 'ارسال تیکت'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="px-4 py-3 rounded-xl text-sm border"
                            style={{ borderColor: '#EDE6D6', color: '#8C8C8E' }}>لغو</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />)}</div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="text-5xl mb-3">🎫</div>
                    <p className="font-semibold mb-1" style={{ color: '#1C1C1E' }}>تیکتی ندارید</p>
                    <p className="text-sm" style={{ color: '#8C8C8E' }}>برای ارتباط با پشتیبانی تیکت بسازید</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(t => {
                        const s = STATUS[t.status as keyof typeof STATUS] ?? { l: t.status, c: '#8C8C8E', bg: '#F3EDE3' }
                        return (
                            <Link key={t.id} href={`/dashboard/tickets/${t.id}`}
                                className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md"
                                style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#F3EDE3' }}>🎫</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate" style={{ color: '#1C1C1E' }}>{t.subject}</p>
                                    <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                                        {new Date(t.createdAt).toLocaleDateString('fa-IR')}
                                        {t._count?.messages ? ` · ${t._count.messages} پیام` : ''}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                                    style={{ background: s.bg, color: s.c }}>{s.l}</span>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
