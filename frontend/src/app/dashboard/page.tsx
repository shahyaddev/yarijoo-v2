'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth.store'
import { IconBrain, IconShop, IconDoctor, IconCalendar, IconTicket, IconBell, IconUser, IconPackage, IconBook } from '@/components/ui/Icon'
import api from '@/lib/api'

interface DashboardData {
    testAttempts: number
    orders: number
    appointments: number
    notifications: number
    recentTests: Array<{ id: string; testId: string; status: string; createdAt: string; test?: { title: string; category: string } }>
    recentOrders: Array<{ id: string; status: string; totalAmount: number; createdAt: string }>
}

const STATUS_MAP: Record<string, string> = {
    COMPLETED: 'تکمیل شده', IN_PROGRESS: 'در حال انجام',
    PAID: 'پرداخت شده', PENDING: 'در انتظار',
    CONFIRMED: 'تأیید شده', CANCELLED: 'لغو شده',
}
const STATUS_COLOR: Record<string, string> = {
    COMPLETED: '#1B4332', PAID: '#1B4332', IN_PROGRESS: '#C9A84C',
    PENDING: '#C9A84C', CONFIRMED: '#1565C0', CANCELLED: '#C62828',
}

const QUICK_ACTIONS = [
    { icon: <IconBrain size={20} color="#1B4332" />, label: 'تست جدید',           href: '/tests',                  color: '#E8F5E9' },
    { icon: <IconBook  size={20} color="#1565C0" />, label: 'کتاب‌خانه',          href: '/books',                  color: '#E3F2FD' },
    { icon: <IconDoctor size={20} color="#6A1B9A" />, label: 'رزرو مشاوره',       href: '/psychologists',          color: '#F3E5F5' },
    { icon: <IconCalendar size={20} color="#C9A84C" />, label: 'تقویم',           href: '/dashboard/planner',      color: '#FFF8E1' },
    { icon: <IconTicket size={20} color="#C62828" />, label: 'تیکت پشتیبانی',    href: '/dashboard/tickets',      color: '#FCE4EC' },
    { icon: <IconBell  size={20} color="#00695C" />, label: 'اعلان‌ها',           href: '/dashboard/notifications',color: '#E0F7FA' },
    { icon: <IconUser  size={20} color="#5C5C5E" />, label: 'پروفایل',            href: '/dashboard/profile',      color: '#F3EDE3' },
    { icon: <IconPackage size={20} color="#795548" />, label: 'سفارشات',          href: '/dashboard/orders',       color: '#EDE6D6' },
]

const STATS_ICONS = [
    { icon: <IconBrain size={20} color="#1B4332" />, color: '#E8F5E9' },
    { icon: <IconShop  size={20} color="#1565C0" />, color: '#E3F2FD' },
    { icon: <IconCalendar size={20} color="#6A1B9A" />, color: '#F3E5F5' },
    { icon: <IconBell  size={20} color="#C9A84C" />, color: '#FFF8E1' },
]

export default function DashboardPage() {
    const { user } = useAuthStore()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            api.get('/users/me/test-attempts?limit=5').catch(() => ({ data: { data: { attempts: [] } } })),
            api.get('/shop/orders?limit=5').catch(() => ({ data: { data: { orders: [] } } })),
            api.get('/notifications?limit=5').catch(() => ({ data: { data: [] } })),
            api.get('/appointments?limit=5').catch(() => ({ data: { data: { appointments: [] } } })),
        ]).then(([testsRes, ordersRes, notifRes, apptRes]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const attempts = (testsRes.data as any)?.data?.attempts ?? []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const orders   = (ordersRes.data as any)?.data?.orders   ?? []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const notifs   = (notifRes.data  as any)?.data            ?? []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const appts    = (apptRes.data   as any)?.data?.appointments ?? []
            setData({
                testAttempts: attempts.length,
                orders: orders.length,
                appointments: appts.length,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                notifications: Array.isArray(notifs) ? notifs.filter((n: any) => !n.isRead).length : 0,
                recentTests: attempts.slice(0, 4),
                recentOrders: orders.slice(0, 4),
            })
        }).finally(() => setLoading(false))
    }, [])

    const greeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'صبح بخیر'
        if (h < 17) return 'ظهر بخیر'
        return 'عصر بخیر'
    }

    const stats = [
        { label: 'تست انجام شده',  value: loading ? '…' : String(data?.testAttempts ?? 0), href: '/dashboard/my-tests' },
        { label: 'سفارشات',        value: loading ? '…' : String(data?.orders       ?? 0), href: '/dashboard/orders' },
        { label: 'نوبت مشاوره',    value: loading ? '…' : String(data?.appointments  ?? 0), href: '/dashboard/appointments' },
        { label: 'اعلان‌های جدید', value: loading ? '…' : String(data?.notifications ?? 0), href: '/dashboard/notifications' },
    ]

    return (
        <div className="space-y-6">
            {/* Welcome banner */}
            <div className="rounded-2xl p-6 text-white" style={{
                background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)',
            }}>
                <p className="text-sm opacity-70 mb-1">{greeting()}</p>
                <h1 className="text-2xl font-black mb-1">
                    {user?.fullName ?? user?.phone ?? 'کاربر عزیز'}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        اشتراک: {user?.subscriptionLevel === 'FREE' ? 'رایگان' : user?.subscriptionLevel}
                    </span>
                    {user?.subscriptionLevel === 'FREE' && (
                        <Link href="/pricing" className="text-xs px-2.5 py-1 rounded-full font-semibold hover:opacity-90"
                            style={{ background: '#C9A84C', color: 'white' }}>
                            ارتقا به پریمیوم ←
                        </Link>
                    )}
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <Link key={s.label} href={s.href}
                        className="block rounded-2xl p-5 border transition-all hover:-translate-y-0.5 hover:shadow-md"
                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                            style={{ background: STATS_ICONS[i].color }}>
                            {STATS_ICONS[i].icon}
                        </div>
                        <div className="text-2xl font-black mb-1" style={{ color: '#1C1C1E' }}>{s.value}</div>
                        <div className="text-xs" style={{ color: '#8C8C8E' }}>{s.label}</div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent tests */}
                <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-[15px]" style={{ color: '#1C1C1E' }}>آخرین تست‌ها</h2>
                        <Link href="/dashboard/my-tests" className="text-xs font-semibold" style={{ color: '#1B4332' }}>مشاهده همه</Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#F3EDE3' }} />)}</div>
                    ) : !data?.recentTests.length ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#E8F5E9' }}>
                                <IconBrain size={24} color="#1B4332" />
                            </div>
                            <p className="text-sm" style={{ color: '#8C8C8E' }}>هنوز تستی انجام ندادید</p>
                            <Link href="/tests" className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ background: '#1B4332' }}>شروع تست</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data?.recentTests.map(t => (
                                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#F3EDE3' }}>
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: '#1C1C1E' }}>{t.test?.title ?? 'تست روانشناسی'}</p>
                                        <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>{t.test?.category}</p>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: `${STATUS_COLOR[t.status]}15`, color: STATUS_COLOR[t.status] ?? '#8C8C8E' }}>
                                        {STATUS_MAP[t.status] ?? t.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent orders */}
                <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-[15px]" style={{ color: '#1C1C1E' }}>سفارشات اخیر</h2>
                        <Link href="/dashboard/orders" className="text-xs font-semibold" style={{ color: '#1B4332' }}>مشاهده همه</Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#F3EDE3' }} />)}</div>
                    ) : !data?.recentOrders.length ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#E3F2FD' }}>
                                <IconShop size={24} color="#1565C0" />
                            </div>
                            <p className="text-sm" style={{ color: '#8C8C8E' }}>هنوز خریدی نداشتید</p>
                            <Link href="/shop" className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ background: '#1B4332' }}>رفتن به فروشگاه</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data?.recentOrders.map(o => (
                                <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#F3EDE3' }}>
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: '#1C1C1E' }}>{o.totalAmount.toLocaleString('fa-IR')} تومان</p>
                                        <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>{new Date(o.createdAt).toLocaleDateString('fa-IR')}</p>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: `${STATUS_COLOR[o.status]}15`, color: STATUS_COLOR[o.status] ?? '#8C8C8E' }}>
                                        {STATUS_MAP[o.status] ?? o.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="font-bold text-[15px] mb-4" style={{ color: '#1C1C1E' }}>دسترسی سریع</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {QUICK_ACTIONS.map(a => (
                        <Link key={a.href} href={a.href}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md"
                            style={{ background: 'white', borderColor: '#EDE6D6' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: a.color }}>
                                {a.icon}
                            </div>
                            <span className="text-xs font-semibold text-center" style={{ color: '#3C3C3E' }}>{a.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
