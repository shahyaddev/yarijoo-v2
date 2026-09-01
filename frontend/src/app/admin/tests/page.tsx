'use client'
import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui'
import api from '@/lib/api'

interface Test {
    id: string
    slug: string
    title: string
    category: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    isPremium: boolean
    _count?: { questions: number; attempts: number }
}

interface ApiResponse {
    items: Test[]
    total: number
    page: number
    limit: number
}

const STATUS_LABEL: Record<string, string> = {
    PUBLISHED: 'منتشر',
    DRAFT: 'پیش‌نویس',
    ARCHIVED: 'آرشیو',
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'default'> = {
    PUBLISHED: 'success',
    DRAFT: 'warning',
    ARCHIVED: 'default',
}

const INITIAL_FORM = { slug: '', title: '', category: '', scoringType: 'SUM', isPremium: false, description: '' }

export default function AdminTestsPage() {
    const [tests, setTests] = useState<Test[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [form, setForm] = useState(INITIAL_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const fetchTests = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<ApiResponse>(`/admin/tests?page=${page}&limit=20`)
            const data = (res.data as { data?: ApiResponse }).data ?? res.data as unknown as ApiResponse
            setTests(data.items ?? [])
            setTotal(data.total ?? 0)
        } catch {
            setTests([])
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => { void fetchTests() }, [fetchTests])

    const openCreate = () => {
        setEditId(null)
        setForm(INITIAL_FORM)
        setError('')
        setShowModal(true)
    }

    const openEdit = (test: Test) => {
        setEditId(test.id)
        setForm({ slug: test.slug, title: test.title, category: test.category, scoringType: 'SUM', isPremium: test.isPremium, description: '' })
        setError('')
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.title.trim() || !form.category.trim() || !form.slug.trim()) {
            setError('عنوان، اسلاگ و دسته‌بندی الزامی است')
            return
        }
        setSaving(true); setError('')
        try {
            if (editId) {
                await api.patch(`/admin/tests/${editId}`, { title: form.title, category: form.category, isPremium: form.isPremium })
            } else {
                await api.post('/admin/tests', form)
            }
            setShowModal(false)
            void fetchTests()
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ذخیره')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('آیا از حذف این تست مطمئن هستید؟')) return
        try {
            await api.delete(`/admin/tests/${id}`)
            void fetchTests()
        } catch { /* ignore */ }
    }

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await api.patch(`/admin/tests/${id}`, { status })
            void fetchTests()
        } catch { /* ignore */ }
    }

    const totalPages = Math.ceil(total / 20)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">تست‌ها</h1>
                    <p className="text-xs text-gray-400 mt-1">{total} تست</p>
                </div>
                <button onClick={openCreate}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-xl transition-colors">
                    + تست جدید
                </button>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                                <th className="text-right px-5 py-3">عنوان</th>
                                <th className="text-right px-5 py-3">دسته‌بندی</th>
                                <th className="text-right px-5 py-3">سوالات</th>
                                <th className="text-right px-5 py-3">شرکت‌کنندگان</th>
                                <th className="text-right px-5 py-3">وضعیت</th>
                                <th className="text-right px-5 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.length === 0 ? (
                                <tr><td colSpan={6} className="text-center text-gray-500 py-12">تستی یافت نشد</td></tr>
                            ) : tests.map((test) => (
                                <tr key={test.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="text-gray-200 font-medium">{test.title}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{test.slug}</div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400">{test.category}</td>
                                    <td className="px-5 py-3 text-gray-300">{test._count?.questions ?? 0}</td>
                                    <td className="px-5 py-3 text-gray-300">{(test._count?.attempts ?? 0).toLocaleString('fa-IR')}</td>
                                    <td className="px-5 py-3">
                                        <select
                                            value={test.status}
                                            onChange={(e) => handleStatusChange(test.id, e.target.value)}
                                            className="bg-gray-800 border border-gray-700 text-xs rounded-lg px-2 py-1 text-gray-300 focus:outline-none focus:border-primary-500"
                                        >
                                            <option value="DRAFT">پیش‌نویس</option>
                                            <option value="PUBLISHED">منتشر</option>
                                            <option value="ARCHIVED">آرشیو</option>
                                        </select>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(test)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">ویرایش</button>
                                            <span className="text-gray-700">|</span>
                                            <button onClick={() => handleDelete(test.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">حذف</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)}
                            className={['w-8 h-8 rounded-lg text-sm transition-colors', p === page ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'].join(' ')}>
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md mx-4">
                        <h2 className="text-lg font-bold text-white mb-5">{editId ? 'ویرایش تست' : 'ایجاد تست جدید'}</h2>
                        <div className="space-y-4">
                            {!editId && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">اسلاگ (URL)</label>
                                    <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                                        placeholder="test-slug"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 font-mono" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">عنوان تست</label>
                                <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="مثلاً: تست شخصیت MBTI"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">دسته‌بندی</label>
                                <input value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                                    placeholder="مثلاً: شخصیت، هوش، شغل"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500" />
                            </div>
                            {!editId && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">روش نمره‌دهی</label>
                                    <select value={form.scoringType} onChange={(e) => setForm(f => ({ ...f, scoringType: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500">
                                        <option value="SUM">جمع امتیازات</option>
                                        <option value="WEIGHTED">وزن‌دار</option>
                                        <option value="SUBSCALE">خرده‌مقیاس</option>
                                        <option value="CUSTOM">سفارشی</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isPremium" checked={form.isPremium}
                                    onChange={(e) => setForm(f => ({ ...f, isPremium: e.target.checked }))}
                                    className="w-4 h-4 accent-primary-600" />
                                <label htmlFor="isPremium" className="text-sm text-gray-300">تست پریمیوم</label>
                            </div>
                            {error && <p className="text-xs text-red-400">{error}</p>}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} disabled={saving}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2.5 rounded-xl transition-colors">
                                انصراف
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
                                {saving ? 'در حال ذخیره...' : editId ? 'ذخیره تغییرات' : 'ایجاد تست'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
