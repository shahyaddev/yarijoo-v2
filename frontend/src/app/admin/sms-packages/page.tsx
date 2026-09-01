'use client'
import { useState, useEffect, useCallback } from 'react'
import { IconSms, IconCheck, IconAlertTriangle } from '@/components/ui/Icon'

interface SmsPackage {
    id: string
    title: string
    description: string | null
    price: number
    duration_days: number
    send_hour: number
    is_active: boolean
    message_count: number
    created_at: string
}

interface DayMessage {
    day_number: number
    message: string
}

const emptyForm = {
    title: '',
    description: '',
    price: '',
    duration_days: '30',
    send_hour: '8',
}

export default function AdminSmsPackagesPage() {
    const [packages, setPackages] = useState<SmsPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [messages, setMessages] = useState<DayMessage[]>([{ day_number: 1, message: '' }])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const load = useCallback(() => {
        setLoading(true)
        fetch('/api/admin/sms-packages')
            .then(r => r.json())
            .then(r => setPackages(r.data ?? []))
            .catch(() => setPackages([]))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { load() }, [load])

    // Sync day count with duration
    const syncDays = (durationStr: string) => {
        const days = parseInt(durationStr) || 1
        setMessages(prev => {
            if (prev.length === days) return prev
            if (days > prev.length) {
                const extras: DayMessage[] = []
                for (let d = prev.length + 1; d <= days; d++) {
                    extras.push({ day_number: d, message: '' })
                }
                return [...prev, ...extras]
            }
            return prev.slice(0, days)
        })
    }

    const addDay = () => {
        const next = messages.length + 1
        setMessages(prev => [...prev, { day_number: next, message: '' }])
    }

    const removeLastDay = () => {
        if (messages.length <= 1) return
        setMessages(prev => prev.slice(0, -1))
    }

    const updateMessage = (idx: number, text: string) => {
        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, message: text } : m))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim()) { setError('عنوان الزامی است'); return }
        const filledMessages = messages.filter(m => m.message.trim())
        if (filledMessages.length === 0) { setError('حداقل یک پیام باید وارد شود'); return }
        setSaving(true); setError(''); setSuccess('')
        try {
            const res = await fetch('/api/admin/sms-packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title.trim(),
                    description: form.description.trim() || null,
                    price: parseInt(form.price) || 0,
                    duration_days: parseInt(form.duration_days) || 30,
                    send_hour: parseInt(form.send_hour) ?? 8,
                    messages: filledMessages,
                }),
            })
            const json = await res.json()
            if (!json.success) throw new Error(json.error || 'خطا')
            setSuccess('پکیج پیامکی با موفقیت ساخته شد')
            setForm(emptyForm)
            setMessages([{ day_number: 1, message: '' }])
            setShowForm(false)
            load()
        } catch (err: unknown) {
            setError((err as Error).message ?? 'خطا در ذخیره‌سازی')
        } finally {
            setSaving(false)
        }
    }

    const toggleActive = async (id: string, is_active: boolean) => {
        try {
            await fetch(`/api/admin/sms-packages?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !is_active }),
            })
            setPackages(ps => ps.map(p => p.id === id ? { ...p, is_active: !is_active } : p))
        } catch { /* ignore */ }
    }

    const del = async (id: string) => {
        if (!confirm('آیا مطمئنید؟ تمام پیام‌های این پکیج حذف خواهند شد.')) return
        try {
            await fetch(`/api/admin/sms-packages?id=${id}`, { method: 'DELETE' })
            setPackages(ps => ps.filter(p => p.id !== id))
        } catch { /* ignore */ }
    }

    const filledCount = messages.filter(m => m.message.trim()).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">مدیریت پکیج‌های پیامکی</h1>
                    <p className="text-xs text-gray-400 mt-1">ارسال پیام روزانه به کاربران مشترک</p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
                    className="text-sm px-4 py-2 rounded-xl font-semibold transition-colors"
                    style={{ background: showForm ? '#374151' : '#1B4332', color: 'white' }}
                >
                    {showForm ? '× بستن' : '+ پکیج جدید'}
                </button>
            </div>

            {/* Notifications */}
            {success && (
                <div className="p-4 rounded-xl text-sm font-semibold flex items-center gap-2" style={{ background: '#E8F5E920', color: '#4ADE80', border: '1px solid #4ADE8040' }}>
                    <IconCheck size={14} color="#4ADE80" /> {success}
                </div>
            )}
            {error && (
                <div className="p-4 rounded-xl text-sm font-semibold flex items-center gap-2" style={{ background: '#FCE4EC20', color: '#F87171', border: '1px solid #F8717140' }}>
                    <IconAlertTriangle size={14} color="#F87171" /> {error}
                </div>
            )}

            {/* Create form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-xl border border-gray-700 p-6 space-y-5" style={{ background: '#111827' }}>
                    <h2 className="font-semibold text-white text-base">پکیج پیامکی جدید</h2>

                    {/* Basic fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">عنوان پکیج *</label>
                            <input
                                required value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="مثلاً: ۳۰ روز انگیزش"
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600 placeholder-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">قیمت (تومان)</label>
                            <input
                                type="number" value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                placeholder="0 = رایگان"
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600 placeholder-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">مدت (روز) *</label>
                            <input
                                type="number" min={1} max={365} value={form.duration_days}
                                onChange={e => {
                                    setForm({ ...form, duration_days: e.target.value })
                                    syncDays(e.target.value)
                                }}
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">ساعت ارسال (۰–۲۳)</label>
                            <input
                                type="number" min={0} max={23} value={form.send_hour}
                                onChange={e => setForm({ ...form, send_hour: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600"
                            />
                            <p className="text-xs text-gray-600 mt-1">مثلاً ۸ = ساعت ۸ صبح</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">توضیحات</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            placeholder="توضیح کوتاه برای کاربران..."
                            className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600 resize-none placeholder-gray-600"
                        />
                    </div>

                    {/* Messages editor */}
                    <div className="border border-gray-700 rounded-xl p-4 space-y-3" style={{ background: '#0d1117' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-300">
                                پیام‌های روزانه
                                <span className="text-xs text-gray-500 mr-2">({filledCount}/{messages.length} تکمیل شده)</span>
                            </h3>
                            <div className="flex gap-2">
                                <button type="button" onClick={removeLastDay} disabled={messages.length <= 1}
                                    className="text-xs px-2.5 py-1 rounded-lg text-red-400 border border-red-900 hover:bg-red-900/20 disabled:opacity-30 transition-colors">
                                    – حذف روز آخر
                                </button>
                                <button type="button" onClick={addDay}
                                    className="text-xs px-2.5 py-1 rounded-lg text-blue-400 border border-blue-900 hover:bg-blue-900/20 transition-colors">
                                    + روز جدید
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pl-1">
                            {messages.map((msg, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-12 shrink-0">روز {msg.day_number}</span>
                                        <div className="flex-1 h-px bg-gray-800" />
                                        {msg.message.trim()
                                            ? <IconCheck size={12} color="#4ADE80" />
                                            : <span className="text-xs text-gray-600">خالی</span>
                                        }
                                    </div>
                                    <textarea
                                        value={msg.message}
                                        onChange={e => updateMessage(idx, e.target.value)}
                                        rows={2}
                                        maxLength={160}
                                        placeholder={`متن پیامک روز ${msg.day_number}...`}
                                        className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 resize-none placeholder-gray-600"
                                    />
                                    <div className="text-right text-xs text-gray-600">{msg.message.length}/160</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button type="submit" disabled={saving}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
                            style={{ background: '#1B4332' }}>
                            {saving ? 'در حال ذخیره…' : `ذخیره پکیج (${filledCount} پیام)`}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setMessages([{ day_number: 1, message: '' }]) }}
                            className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700 hover:bg-gray-800 transition-colors">
                            لغو
                        </button>
                    </div>
                </form>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'کل پکیج‌ها', v: packages.length, color: '#E3F2FD' },
                    { label: 'فعال', v: packages.filter(p => p.is_active).length, color: '#E8F5E9' },
                    { label: 'غیرفعال', v: packages.filter(p => !p.is_active).length, color: '#FCE4EC' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl border border-gray-800 p-4 text-center" style={{ background: '#111827' }}>
                        <div className="text-2xl font-bold text-white">{s.v}</div>
                        <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Packages list */}
            <div className="space-y-3">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse bg-gray-800" />)}
                    </div>
                ) : packages.length === 0 ? (
                    <div className="rounded-xl border border-gray-800 p-10 text-center" style={{ background: '#111827' }}>
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#1B433220' }}>
                            <IconSms size={28} color="#4ADE80" />
                        </div>
                        <p className="text-gray-500">هنوز پکیج پیامکی ساخته نشده</p>
                    </div>
                ) : (
                    packages.map(pkg => (
                        <div key={pkg.id} className="rounded-xl border border-gray-800 overflow-hidden" style={{ background: '#111827' }}>
                            <div className="flex items-center justify-between px-5 py-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#1B433220' }}>
                                        <IconSms size={18} color="#4ADE80" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-gray-200">{pkg.title}</div>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="text-xs text-gray-500">{pkg.duration_days} روز</span>
                                            <span className="text-xs text-gray-500">ساعت {pkg.send_hour}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1e3a2e', color: '#4ADE80' }}>
                                                {pkg.message_count} پیام
                                            </span>
                                            {pkg.price === 0
                                                ? <span className="text-xs text-green-400 font-semibold">رایگان</span>
                                                : <span className="text-xs text-gray-400">{pkg.price.toLocaleString('fa-IR')} ت</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => setExpandedId(expandedId === pkg.id ? null : pkg.id)}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                        {expandedId === pkg.id ? 'بستن' : 'جزئیات'}
                                    </button>
                                    <button
                                        onClick={() => toggleActive(pkg.id, pkg.is_active)}
                                        className="text-xs px-2.5 py-1 rounded-full font-semibold transition-colors"
                                        style={pkg.is_active
                                            ? { background: '#4ADE8020', color: '#4ADE80' }
                                            : { background: '#F8717120', color: '#F87171' }}>
                                        {pkg.is_active ? 'فعال' : 'غیرفعال'}
                                    </button>
                                    <button onClick={() => del(pkg.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">حذف</button>
                                </div>
                            </div>
                            {expandedId === pkg.id && pkg.description && (
                                <div className="px-5 pb-4 border-t border-gray-800 pt-3">
                                    <p className="text-sm text-gray-400">{pkg.description}</p>
                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                                        <span>مدت: {pkg.duration_days} روز</span>
                                        <span>ساعت ارسال: {pkg.send_hour}:00</span>
                                        <span>تعداد پیام: {pkg.message_count}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
