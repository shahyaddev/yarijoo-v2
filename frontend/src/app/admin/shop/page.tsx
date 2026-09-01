'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui'
import api from '@/lib/api'

interface Product {
    id: string
    slug: string
    title: string
    price: number
    salePrice: number | null
    type: string
    isActive: boolean
    stock: number
    createdAt: string
}

const TYPE_LABELS: Record<string, string> = {
    physical: 'فیزیکی', sms: 'پیامکی', book: 'کتاب',
    story: 'داستان', test: 'تست', online_course: 'دوره', composite: 'ترکیبی',
}

interface NewProduct {
    title: string; description: string; price: string; salePrice: string
    stock: string; type: string; isActive: boolean
}

const EMPTY: NewProduct = { title: '', description: '', price: '', salePrice: '', stock: '0', type: 'physical', isActive: true }

export default function AdminShopPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<NewProduct>(EMPTY)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const load = () => {
        setLoading(true)
        api.get('/shop/products?limit=100')
            .then(r => setProducts((r.data as any)?.data?.products ?? []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true); setError(''); setSuccess('')
        try {
            const slug = form.title.trim().replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-zA-Z0-9\-]/g, '') + '-' + Date.now()
            await api.post('/admin/products', {
                slug,
                title: form.title,
                description: form.description || null,
                price: parseInt(form.price) || 0,
                salePrice: form.salePrice ? parseInt(form.salePrice) : null,
                stock: parseInt(form.stock) || 0,
                type: form.type,
                isActive: form.isActive,
            })
            setSuccess('محصول با موفقیت ساخته شد')
            setForm(EMPTY)
            setShowForm(false)
            load()
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ذخیره‌سازی')
        } finally {
            setSaving(false)
        }
    }

    const toggleActive = async (id: string, active: boolean) => {
        try {
            await api.patch(`/admin/products/${id}`, { isActive: !active })
            setProducts(ps => ps.map(p => p.id === id ? { ...p, isActive: !active } : p))
        } catch { }
    }

    const del = async (id: string) => {
        if (!confirm('آیا مطمئنید؟')) return
        try {
            await api.delete(`/admin/products/${id}`)
            setProducts(ps => ps.filter(p => p.id !== id))
        } catch { }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">مدیریت محصولات</h1>
                <button onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
                    className="text-sm px-4 py-2 rounded-xl transition-colors font-semibold"
                    style={{ background: showForm ? '#374151' : '#1B4332', color: 'white' }}>
                    {showForm ? '× بستن' : '+ محصول جدید'}
                </button>
            </div>

            {/* Notifications */}
            {success && <div className="p-4 rounded-xl text-sm font-semibold" style={{ background: '#E8F5E9', color: '#1B4332' }}>✅ {success}</div>}
            {error && <div className="p-4 rounded-xl text-sm font-semibold" style={{ background: '#FCE4EC', color: '#C62828' }}>⚠️ {error}</div>}

            {/* Create form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-xl border border-gray-700 p-5 space-y-4" style={{ background: '#111827' }}>
                    <h2 className="font-semibold text-white mb-2">محصول جدید</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">عنوان *</label>
                            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">نوع</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none">
                                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">قیمت (تومان) *</label>
                            <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">قیمت تخفیف‌دار</label>
                            <input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">موجودی (۰ = نامحدود)</label>
                            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none" />
                        </div>
                        <div className="flex items-center gap-3 pt-5">
                            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                className="w-4 h-4" />
                            <label htmlFor="isActive" className="text-sm text-gray-300">فعال</label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">توضیحات</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={3} className="w-full px-3 py-2 rounded-lg text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none resize-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={saving}
                            className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
                            style={{ background: '#1B4332' }}>
                            {saving ? 'در حال ذخیره…' : 'ذخیره محصول'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="px-4 py-2 rounded-xl text-sm text-gray-400 border border-gray-700 hover:bg-gray-800 transition-colors">
                            لغو
                        </button>
                    </div>
                </form>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'کل محصولات', v: products.length, color: '#E3F2FD' },
                    { label: 'فعال', v: products.filter(p => p.isActive).length, color: '#E8F5E9' },
                    { label: 'غیرفعال', v: products.filter(p => !p.isActive).length, color: '#FCE4EC' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl border border-gray-800 p-4 text-center" style={{ background: '#111827' }}>
                        <div className="text-2xl font-bold text-white">{s.v.toLocaleString('fa-IR')}</div>
                        <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Products table */}
            <div className="rounded-xl border border-gray-800 overflow-hidden" style={{ background: '#111827' }}>
                {loading ? (
                    <div className="p-6 space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 rounded-lg animate-pulse bg-gray-800" />)}</div>
                ) : products.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">محصولی وجود ندارد</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                                    <th className="text-right px-4 py-3">عنوان</th>
                                    <th className="text-right px-4 py-3">نوع</th>
                                    <th className="text-right px-4 py-3">قیمت</th>
                                    <th className="text-right px-4 py-3">وضعیت</th>
                                    <th className="text-right px-4 py-3">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="px-4 py-3 text-gray-200 font-medium max-w-xs truncate">{p.title}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="info">{TYPE_LABELS[p.type] ?? p.type}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {p.price === 0 ? 'رایگان' : `${p.price.toLocaleString('fa-IR')} ت`}
                                            {p.salePrice != null && p.salePrice < p.price && (
                                                <span className="text-xs text-green-400 mr-1">({p.salePrice.toLocaleString('fa-IR')})</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => toggleActive(p.id, p.isActive)}
                                                className="text-xs px-2.5 py-1 rounded-full font-semibold transition-colors"
                                                style={p.isActive
                                                    ? { background: '#E8F5E920', color: '#4ADE80' }
                                                    : { background: '#FCE4EC20', color: '#F87171' }}>
                                                {p.isActive ? 'فعال' : 'غیرفعال'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <a href={`/shop/${p.slug}`} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">مشاهده</a>
                                                <button onClick={() => del(p.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">حذف</button>
                                            </div>
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
