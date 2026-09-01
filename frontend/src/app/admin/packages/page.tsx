'use client'
import { useState, useEffect, useCallback } from 'react'

interface PackageItem {
    item_type: string
    item_id: string
    item_title: string
    sort_order?: number
}

interface CompositePackage {
    id: string
    title: string
    description: string | null
    price: number
    sale_price: number | null
    is_active: boolean
    item_count: number
    created_at: string
}

interface SearchResult {
    id: string
    title: string
}

const ITEM_TYPES = [
    { value: 'book', label: 'کتاب' },
    { value: 'story', label: 'داستان' },
    { value: 'test', label: 'تست' },
    { value: 'product', label: 'محصول' },
]

const TYPE_LABEL: Record<string, string> = {
    book: 'کتاب', story: 'داستان', test: 'تست', product: 'محصول', sms_package: 'پکیج پیامکی',
}

const emptyForm = { title: '', description: '', price: '', sale_price: '' }

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<CompositePackage[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [items, setItems] = useState<PackageItem[]>([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Item search state
    const [searchType, setSearchType] = useState('book')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [searching, setSearching] = useState(false)

    const load = useCallback(() => {
        setLoading(true)
        fetch('/api/admin/composite-packages')
            .then(r => r.json())
            .then(r => setPackages(r.data ?? []))
            .catch(() => setPackages([]))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { load() }, [load])

    const searchItems = useCallback(async () => {
        if (!searchQuery.trim()) { setSearchResults([]); return }
        setSearching(true)
        try {
            const r = await fetch(`/api/admin/search-items?type=${searchType}&q=${encodeURIComponent(searchQuery)}`)
            const json = await r.json()
            setSearchResults(json.data ?? [])
        } catch {
            setSearchResults([])
        } finally {
            setSearching(false)
        }
    }, [searchType, searchQuery])

    useEffect(() => {
        const t = setTimeout(searchItems, 300)
        return () => clearTimeout(t)
    }, [searchItems])

    const addItem = (result: SearchResult) => {
        if (items.find(i => i.item_id === result.id && i.item_type === searchType)) return
        setItems(prev => [...prev, { item_type: searchType, item_id: result.id, item_title: result.title }])
        setSearchResults([])
        setSearchQuery('')
    }

    const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

    const moveItem = (idx: number, dir: -1 | 1) => {
        const next = idx + dir
        if (next < 0 || next >= items.length) return
        setItems(prev => {
            const arr = [...prev]
                ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
            return arr
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim()) { setError('عنوان الزامی است'); return }
        setSaving(true); setError(''); setSuccess('')
        try {
            const res = await fetch('/api/admin/composite-packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title.trim(),
                    description: form.description.trim() || null,
                    price: parseInt(form.price) || 0,
                    sale_price: form.sale_price ? parseInt(form.sale_price) : null,
                    items: items.map((item, i) => ({ ...item, sort_order: i + 1 })),
                }),
            })
            const json = await res.json()
            if (!json.success) throw new Error(json.error || 'خطا')
            setSuccess('پکیج با موفقیت ساخته شد')
            setForm(emptyForm)
            setItems([])
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
            await fetch(`/api/admin/composite-packages?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !is_active }),
            })
            setPackages(ps => ps.map(p => p.id === id ? { ...p, is_active: !is_active } : p))
        } catch { /* ignore */ }
    }

    const del = async (id: string) => {
        if (!confirm('آیا مطمئنید؟ این عمل برگشت‌پذیر نیست.')) return
        try {
            await fetch(`/api/admin/composite-packages?id=${id}`, { method: 'DELETE' })
            setPackages(ps => ps.filter(p => p.id !== id))
        } catch { /* ignore */ }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">مدیریت پکیج‌های ترکیبی</h1>
                    <p className="text-xs text-gray-400 mt-1">ترکیب کتاب، تست، داستان و محصول در یک پکیج</p>
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
                <div className="p-4 rounded-xl text-sm font-semibold" style={{ background: '#E8F5E920', color: '#4ADE80', border: '1px solid #4ADE8040' }}>
                    ✅ {success}
                </div>
            )}
            {error && (
                <div className="p-4 rounded-xl text-sm font-semibold" style={{ background: '#FCE4EC20', color: '#F87171', border: '1px solid #F8717140' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Create form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-xl border border-gray-700 p-6 space-y-5" style={{ background: '#111827' }}>
                    <h2 className="font-semibold text-white text-base">پکیج جدید</h2>

                    {/* Basic fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">عنوان پکیج *</label>
                            <input
                                required value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="مثلاً: پکیج رشد فردی ویژه"
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600 placeholder-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">قیمت (تومان) *</label>
                            <input
                                type="number" value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                placeholder="0"
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600 placeholder-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">قیمت تخفیف‌دار (اختیاری)</label>
                            <input
                                type="number" value={form.sale_price}
                                onChange={e => setForm({ ...form, sale_price: e.target.value })}
                                placeholder="خالی = بدون تخفیف"
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600 placeholder-gray-600"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">توضیحات</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            placeholder="توضیح کوتاه درباره این پکیج..."
                            className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600 resize-none placeholder-gray-600"
                        />
                    </div>

                    {/* Item search */}
                    <div className="border border-gray-700 rounded-xl p-4 space-y-3" style={{ background: '#0d1117' }}>
                        <h3 className="text-sm font-semibold text-gray-300">افزودن آیتم به پکیج</h3>
                        <div className="flex gap-3">
                            <select
                                value={searchType}
                                onChange={e => { setSearchType(e.target.value); setSearchResults([]); setSearchQuery('') }}
                                className="px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none"
                            >
                                {ITEM_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <div className="flex-1 relative">
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder={`جستجو در ${ITEM_TYPES.find(t => t.value === searchType)?.label ?? ''}ها...`}
                                    className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 placeholder-gray-600"
                                />
                                {searching && (
                                    <div className="absolute left-3 top-2.5 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                )}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full mt-1 w-full rounded-lg border border-gray-700 overflow-hidden z-10" style={{ background: '#1f2937' }}>
                                        {searchResults.map(r => (
                                            <button
                                                key={r.id} type="button"
                                                onClick={() => addItem(r)}
                                                className="w-full text-right px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                                            >
                                                {r.title || '—'}
                                                <span className="text-xs text-gray-500 mr-2">#{r.id.slice(0, 8)}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Item list */}
                        {items.length > 0 ? (
                            <div className="space-y-2 mt-2">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#1f2937' }}>
                                        <span className="text-xs text-gray-500 w-5 text-center">{idx + 1}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#1B433220', color: '#4ADE80' }}>
                                            {TYPE_LABEL[item.item_type] ?? item.item_type}
                                        </span>
                                        <span className="text-sm text-gray-200 flex-1 truncate">{item.item_title || '—'}</span>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                                                className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-30 transition-colors text-xs">
                                                ↑
                                            </button>
                                            <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1}
                                                className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-30 transition-colors text-xs">
                                                ↓
                                            </button>
                                            <button type="button" onClick={() => removeItem(idx)}
                                                className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors text-xs">
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-600 text-center py-2">هنوز آیتمی اضافه نشده</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button type="submit" disabled={saving}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
                            style={{ background: '#1B4332' }}>
                            {saving ? 'در حال ذخیره…' : `ذخیره پکیج (${items.length} آیتم)`}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setItems([]) }}
                            className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700 hover:bg-gray-800 transition-colors">
                            لغو
                        </button>
                    </div>
                </form>
            )}

            {/* Stats row */}
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

            {/* Packages table */}
            <div className="rounded-xl border border-gray-800 overflow-hidden" style={{ background: '#111827' }}>
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg animate-pulse bg-gray-800" />)}
                    </div>
                ) : packages.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        <div className="text-4xl mb-3">📦</div>
                        <p>هنوز پکیجی ساخته نشده</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/40 text-xs">
                                    <th className="text-right px-4 py-3">عنوان</th>
                                    <th className="text-right px-4 py-3">قیمت</th>
                                    <th className="text-right px-4 py-3">تعداد آیتم</th>
                                    <th className="text-right px-4 py-3">وضعیت</th>
                                    <th className="text-right px-4 py-3">تاریخ</th>
                                    <th className="text-right px-4 py-3">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.map(p => (
                                    <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-200">{p.title}</div>
                                            {p.description && <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{p.description}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {p.price === 0 ? <span className="text-green-400 text-xs font-semibold">رایگان</span> : `${p.price.toLocaleString('fa-IR')} ت`}
                                            {p.sale_price != null && p.sale_price < p.price && (
                                                <div className="text-xs text-green-400">{p.sale_price.toLocaleString('fa-IR')} ت</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#1e3a2e', color: '#4ADE80' }}>
                                                {p.item_count} آیتم
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleActive(p.id, p.is_active)}
                                                className="text-xs px-2.5 py-1 rounded-full font-semibold transition-colors"
                                                style={p.is_active
                                                    ? { background: '#4ADE8020', color: '#4ADE80' }
                                                    : { background: '#F8717120', color: '#F87171' }}>
                                                {p.is_active ? 'فعال' : 'غیرفعال'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(p.created_at).toLocaleDateString('fa-IR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => del(p.id)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                                حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
