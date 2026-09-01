'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

interface Course {
    id: string
    slug: string
    title: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    price: number
    salePrice: number | null
    enrolledCount: number
    totalLessons: number
    createdAt: string
}

interface ApiResponse { items: Course[]; total: number }

const STATUS_LABEL: Record<string, string> = { PUBLISHED: 'منتشر', DRAFT: 'پیش‌نویس', ARCHIVED: 'آرشیو' }
const STATUS_COLOR: Record<string, string> = { PUBLISHED: 'text-green-400', DRAFT: 'text-yellow-400', ARCHIVED: 'text-gray-500' }

const INITIAL_FORM = { slug: '', title: '', description: '', price: '0', salePrice: '' }

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [form, setForm] = useState(INITIAL_FORM)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')

    const fetchCourses = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<ApiResponse>(`/admin/courses?page=${page}&limit=20`)
            const data = (res.data as { data?: ApiResponse }).data ?? res.data as unknown as ApiResponse
            setCourses(data.items ?? [])
            setTotal(data.total ?? 0)
        } catch { setCourses([]) }
        finally { setLoading(false) }
    }, [page])

    useEffect(() => { void fetchCourses() }, [fetchCourses])

    const openCreate = () => {
        setEditId(null); setForm(INITIAL_FORM); setFormError(''); setShowModal(true)
    }

    const openEdit = (c: Course) => {
        setEditId(c.id)
        setForm({ slug: c.slug, title: c.title, description: '', price: String(c.price), salePrice: c.salePrice ? String(c.salePrice) : '' })
        setFormError(''); setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.title.trim() || !form.slug.trim()) { setFormError('عنوان و اسلاگ الزامی است'); return }
        setSaving(true); setFormError('')
        try {
            const body = {
                slug: form.slug,
                title: form.title,
                description: form.description || undefined,
                price: Number(form.price) || 0,
                salePrice: form.salePrice ? Number(form.salePrice) : undefined,
            }
            if (editId) {
                await api.patch(`/admin/courses/${editId}`, body)
            } else {
                await api.post('/admin/courses', body)
            }
            setShowModal(false); void fetchCourses()
        } catch (err: unknown) {
            setFormError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ذخیره')
        } finally { setSaving(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('آیا از حذف این دوره مطمئن هستید؟')) return
        try { await api.delete(`/admin/courses/${id}`); void fetchCourses() } catch { /* ignore */ }
    }

    const handleStatusChange = async (id: string, status: string) => {
        try { await api.patch(`/admin/courses/${id}`, { status }); void fetchCourses() } catch { /* ignore */ }
    }

    const totalPages = Math.ceil(total / 20)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">مدیریت دوره‌ها</h1>
                    <p className="text-xs text-gray-400 mt-1">{total} دوره</p>
                </div>
                <button onClick={openCreate} className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-xl transition-colors">
                    + دوره جدید
                </button>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                                <th className="text-right px-5 py-3">عنوان</th>
                                <th className="text-right px-5 py-3">قیمت</th>
                                <th className="text-right px-5 py-3">دروس</th>
                                <th className="text-right px-5 py-3">ثبت‌نام</th>
                                <th className="text-right px-5 py-3">وضعیت</th>
                                <th className="text-right px-5 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr><td colSpan={6} className="text-center text-gray-500 py-12">دوره‌ای یافت نشد</td></tr>
                            ) : courses.map((course) => (
                                <tr key={course.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="text-gray-200 font-medium">{course.title}</div>
                                        <div className="text-xs text-gray-500 font-mono">{course.slug}</div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="text-gray-300">{course.price.toLocaleString('fa-IR')} ت</div>
                                        {course.salePrice && (
                                            <div className="text-xs text-green-400">{course.salePrice.toLocaleString('fa-IR')} ت</div>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-gray-300">{course.totalLessons}</td>
                                    <td className="px-5 py-3 text-gray-300">{course.enrolledCount.toLocaleString('fa-IR')}</td>
                                    <td className="px-5 py-3">
                                        <select value={course.status} onChange={(e) => handleStatusChange(course.id, e.target.value)}
                                            className="bg-gray-800 border border-gray-700 text-xs rounded-lg px-2 py-1 text-gray-300 focus:outline-none focus:border-primary-500">
                                            <option value="DRAFT">پیش‌نویس</option>
                                            <option value="PUBLISHED">منتشر</option>
                                            <option value="ARCHIVED">آرشیو</option>
                                        </select>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(course)} className="text-xs text-blue-400 hover:text-blue-300">ویرایش</button>
                                            <span className="text-gray-700">|</span>
                                            <button onClick={() => handleDelete(course.id)} className="text-xs text-red-400 hover:text-red-300">حذف</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)}
                            className={['w-8 h-8 rounded-lg text-sm', p === page ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'].join(' ')}>
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md mx-4">
                        <h2 className="text-lg font-bold text-white mb-5">{editId ? 'ویرایش دوره' : 'دوره جدید'}</h2>
                        <div className="space-y-4">
                            {!editId && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">اسلاگ (URL)</label>
                                    <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                                        placeholder="course-slug"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500 font-mono" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">عنوان دوره</label>
                                <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="عنوان دوره را بنویسید"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">توضیحات</label>
                                <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3} placeholder="توضیح کوتاه..."
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500 resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">قیمت (تومان)</label>
                                    <input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">قیمت تخفیف‌دار</label>
                                    <input type="number" value={form.salePrice} onChange={(e) => setForm(f => ({ ...f, salePrice: e.target.value }))}
                                        placeholder="اختیاری"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500" />
                                </div>
                            </div>
                            {formError && <p className="text-xs text-red-400">{formError}</p>}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} disabled={saving}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2.5 rounded-xl">انصراف</button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm px-4 py-2.5 rounded-xl">
                                {saving ? 'در حال ذخیره...' : editId ? 'ذخیره' : 'ایجاد'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
