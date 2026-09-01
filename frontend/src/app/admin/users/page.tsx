'use client'
import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui'
import api from '@/lib/api'

interface User {
    id: string
    phone: string
    fullName: string | null
    email: string | null
    role: string
    subscriptionLevel: string
    isVerified: boolean
    isSuspended: boolean
    createdAt: string
}

const ROLES: Record<string, string> = { USER: 'کاربر', PSYCHOLOGIST: 'روانشناس', ADMIN: 'ادمین', SUPER_ADMIN: 'سوپر ادمین' }

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const load = useCallback(() => {
        setLoading(true)
        const params = new URLSearchParams({ page: String(page), limit: '20' })
        if (search) params.set('search', search)
        api.get(`/admin/users?${params}`)
            .then(r => {
                const d = (r.data as any)?.data
                setUsers(d?.users ?? [])
                setTotal(d?.total ?? 0)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [page, search])

    useEffect(() => { load() }, [load])

    const toggleSuspend = async (id: string, suspended: boolean) => {
        try {
            await api.patch(`/admin/users/${id}`, { isSuspended: !suspended })
            setUsers(us => us.map(u => u.id === id ? { ...u, isSuspended: !suspended } : u))
        } catch { }
    }

    const changeRole = async (id: string, role: string) => {
        try {
            await api.patch(`/admin/users/${id}`, { role })
            setUsers(us => us.map(u => u.id === id ? { ...u, role } : u))
        } catch { }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">مدیریت کاربران ({total.toLocaleString('fa-IR')})</h1>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="جستجو با شماره، نام یا ایمیل..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-600"
                    dir="rtl"
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-800 overflow-hidden" style={{ background: '#111827' }}>
                {loading ? (
                    <div className="p-6 space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />)}</div>
                ) : users.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">کاربری یافت نشد</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                                    <th className="text-right px-4 py-3">کاربر</th>
                                    <th className="text-right px-4 py-3">شماره</th>
                                    <th className="text-right px-4 py-3">نقش</th>
                                    <th className="text-right px-4 py-3">اشتراک</th>
                                    <th className="text-right px-4 py-3">وضعیت</th>
                                    <th className="text-right px-4 py-3">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                                    style={{ background: '#1B4332', color: 'white' }}>
                                                    {(u.fullName ?? u.phone).charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-gray-200 font-medium text-xs">{u.fullName ?? '—'}</p>
                                                    <p className="text-gray-500 text-xs">{u.email ?? ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 text-xs" dir="ltr">{u.phone}</td>
                                        <td className="px-4 py-3">
                                            <select value={u.role}
                                                onChange={e => changeRole(u.id, e.target.value)}
                                                className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2 py-1 focus:outline-none">
                                                {Object.entries(ROLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={u.subscriptionLevel === 'FREE' ? 'info' : 'success'}>
                                                {u.subscriptionLevel}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.isSuspended ? 'text-red-400 bg-red-900/20' : 'text-green-400 bg-green-900/20'}`}>
                                                {u.isSuspended ? 'مسدود' : 'فعال'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => toggleSuspend(u.id, u.isSuspended)}
                                                className="text-xs transition-colors"
                                                style={{ color: u.isSuspended ? '#4ADE80' : '#F87171' }}>
                                                {u.isSuspended ? 'رفع مسدودی' : 'مسدود کردن'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > 20 && (
                <div className="flex justify-center gap-2">
                    {page > 1 && (
                        <button onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-sm text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors">قبلی</button>
                    )}
                    <span className="px-3 py-1.5 text-sm text-gray-400">
                        صفحه {page.toLocaleString('fa-IR')} از {Math.ceil(total / 20).toLocaleString('fa-IR')}
                    </span>
                    {page < Math.ceil(total / 20) && (
                        <button onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-sm text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors">بعدی</button>
                    )}
                </div>
            )}
        </div>
    )
}
