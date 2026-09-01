'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui'
import { IconUsers, IconMoney, IconShop, IconTicket, IconPackage, IconSms, IconNewspaper, IconChart, IconRefresh } from '@/components/ui/Icon'
import api from '@/lib/api'

interface DashStats {
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    openTickets: number
    recentOrders: Array<{ id: string; userId: string; status: string; totalAmount: number; createdAt: string; user?: { fullName: string; phone: string } }>
}

const S: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    PAID: 'success', PENDING: 'warning', CANCELLED: 'error', PROCESSING: 'info',
}

const QUICK_NAV = [
    { href: '/admin/users',        icon: <IconUsers  size={20} color="#1565C0" />, bg: '#E3F2FD', label: 'کاربران' },
    { href: '/admin/shop',         icon: <IconShop   size={20} color="#6A1B9A" />, bg: '#F3E5F5', label: 'محصولات' },
    { href: '/admin/packages',     icon: <IconPackage size={20} color="#795548" />, bg: '#EFEBE9', label: 'پکیج‌ها' },
    { href: '/admin/sms-packages', icon: <IconSms    size={20} color="#1B4332" />, bg: '#E8F5E9', label: 'پکیج پیامکی' },
    { href: '/admin/blog',         icon: <IconNewspaper size={20} color="#C9A84C" />, bg: '#FFF8E1', label: 'مقالات' },
    { href: '/admin/tickets',      icon: <IconTicket size={20} color="#C62828" />, bg: '#FCE4EC', label: 'تیکت‌ها' },
    { href: '/admin/reports',      icon: <IconChart  size={20} color="#00695C" />, bg: '#E0F7FA', label: 'گزارش‌ها' },
    { href: '/admin/migration',    icon: <IconRefresh size={20} color="#5C5C5E" />, bg: '#F3EDE3', label: 'Migration' },
]

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/admin/dashboard')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(r => setStats((r.data as any)?.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const kpis = [
        { label: 'کل کاربران',   value: stats?.totalUsers   ?? 0, icon: <IconUsers  size={20} color="#1565C0" />, bg: '#E3F2FD', money: false },
        { label: 'درآمد کل (ت)', value: stats?.totalRevenue ?? 0, icon: <IconMoney  size={20} color="#1B4332" />, bg: '#E8F5E9', money: true  },
        { label: 'کل سفارشات',   value: stats?.totalOrders  ?? 0, icon: <IconShop   size={20} color="#6A1B9A" />, bg: '#F3E5F5', money: false },
        { label: 'تیکت باز',     value: stats?.openTickets  ?? 0, icon: <IconTicket size={20} color="#C9A84C" />, bg: '#FFF8E1', money: false },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">داشبورد</h1>
                <div className="flex gap-2">
                    <Link href="/admin/users" className="text-xs px-3 py-1.5 rounded-lg text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors">کاربران</Link>
                    <Link href="/admin/shop"  className="text-xs px-3 py-1.5 rounded-lg text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors">محصولات</Link>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(k => (
                    <div key={k.label} className="rounded-xl border border-gray-800 p-4" style={{ background: '#111827' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: k.bg }}>
                            {k.icon}
                        </div>
                        <div className="text-xl font-bold text-white mb-0.5">
                            {loading ? '…' : (k.value as number).toLocaleString('fa-IR')}
                        </div>
                        <div className="text-xs text-gray-400">{k.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick nav */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_NAV.map(l => (
                    <Link key={l.href} href={l.href}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-800 hover:bg-gray-800 transition-colors"
                        style={{ background: '#111827' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: l.bg }}>
                            {l.icon}
                        </div>
                        <span className="text-sm text-gray-300 font-medium">{l.label}</span>
                    </Link>
                ))}
            </div>

            {/* Recent orders */}
            <div className="rounded-xl border border-gray-800 overflow-hidden" style={{ background: '#111827' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                    <h2 className="font-semibold text-white">سفارشات اخیر</h2>
                    <Link href="/admin/orders" className="text-xs text-gray-400 hover:text-white transition-colors">مشاهده همه</Link>
                </div>
                {loading ? (
                    <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 rounded-lg animate-pulse bg-gray-800" />)}</div>
                ) : !stats?.recentOrders?.length ? (
                    <div className="p-8 text-center text-gray-500 text-sm">سفارشی وجود ندارد</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-800">
                                <th className="text-right px-5 py-3">کاربر</th>
                                <th className="text-right px-5 py-3">مبلغ</th>
                                <th className="text-right px-5 py-3">وضعیت</th>
                                <th className="text-right px-5 py-3">تاریخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentOrders?.map(o => (
                                <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    <td className="px-5 py-3 text-gray-300">{o.user?.fullName ?? o.user?.phone ?? '—'}</td>
                                    <td className="px-5 py-3 text-gray-300">{o.totalAmount.toLocaleString('fa-IR')} ت</td>
                                    <td className="px-5 py-3">
                                        <Badge variant={S[o.status] ?? 'info'}>
                                            {o.status === 'PAID' ? 'پرداخت شده' : o.status === 'PENDING' ? 'در انتظار' : o.status}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
