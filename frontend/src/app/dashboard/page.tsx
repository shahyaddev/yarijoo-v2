'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth.store'
import {
    IconBrain, IconShop, IconDoctor, IconCalendar,
    IconTicket, IconBell, IconUser, IconBook, IconPlay, IconSms, IconCheck,
} from '@/components/ui/Icon'
import api from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
    testAttempts: number
    orders: number
    appointments: number
    notifications: number
    courses: number
    packages: number
    recentTests:   Array<{ id: string; status: string; test?: { title: string; category: string } }>
    recentOrders:  Array<{ id: string; status: string; totalAmount: number; createdAt: string }>
    recentCourses: Array<{ id: string; progress: number; course: { title: string; slug: string; thumbnail: string | null } }>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
    COMPLETED: 'تکمیل', IN_PROGRESS: 'در حال انجام',
    PAID: 'پرداخت شده', PENDING: 'در انتظار',
    CONFIRMED: 'تأیید شده', CANCELLED: 'لغو شده',
    ACTIVE: 'فعال',
}
const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
    COMPLETED: { color: '#065F46', bg: '#D1FAE5' },
    PAID:      { color: '#065F46', bg: '#D1FAE5' },
    ACTIVE:    { color: '#1565C0', bg: '#DBEAFE' },
    IN_PROGRESS: { color: '#C9A84C', bg: '#FEF9C3' },
    PENDING:   { color: '#C9A84C', bg: '#FEF9C3' },
    CONFIRMED: { color: '#1565C0', bg: '#DBEAFE' },
    CANCELLED: { color: '#C62828', bg: '#FEE2E2' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_STYLE[status] ?? { color: '#8C8C8E', bg: '#F3EDE3' }
    return (
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
            style={{ background: s.bg, color: s.color }}>
            {STATUS_LABEL[status] ?? status}
        </span>
    )
}

function greeting() {
    const h = new Date().getHours()
    if (h < 12) return 'صبح بخیر'
    if (h < 17) return 'ظهر بخیر'
    return 'عصر بخیر'
}

// ─── Quick actions ───────────────────────────────────────────────────────────

const QUICK = [
    { icon: <IconBrain size={22} color="#1B4332" />,      label: 'تست جدید',       href: '/tests',                           bg: '#E8F5E9' },
    { icon: <IconPlay  size={22} color="#1565C0" />,      label: 'دوره‌های من',     href: '/dashboard/courses',               bg: '#DBEAFE' },
    { icon: <IconBook  size={22} color="#6A1B9A" />,      label: 'کتابخانه',       href: '/books',                           bg: '#EDE9FE' },
    { icon: <IconDoctor size={22} color="#00695C" />,     label: 'رزرو مشاوره',    href: '/psychologists',                   bg: '#CCFBF1' },
    { icon: <IconSms   size={22} color="#C9A84C" />,      label: 'پکیج‌های من',    href: '/dashboard/educational-packages',  bg: '#FEF9C3' },
    { icon: <IconCalendar size={22} color="#9A3412" />,   label: 'تقویم',          href: '/dashboard/planner',               bg: '#FFEDD5' },
    { icon: <IconTicket size={22} color="#C62828" />,     label: 'پشتیبانی',       href: '/dashboard/tickets',               bg: '#FEE2E2' },
    { icon: <IconUser  size={22} color="#5C5C5E" />,      label: 'پروفایل',        href: '/dashboard/profile',               bg: '#F3EDE3' },
]

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ value, label, href, icon, color }: {
    value: string; label: string; href: string
    icon: React.ReactNode; color: string
}) {
    return (
        <Link href={href}
            className="group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
            style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 10px rgba(27,67,50,0.05)' }}>
            {/* Accent strip */}
            <div className="absolute top-0 right-0 w-1 h-full rounded-l-full" style={{ background: color }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '22' }}>
                {icon}
            </div>
            <div>
                <div className="text-2xl font-black" style={{ color: '#1C1C1E' }}>{value}</div>
                <div className="text-xs mt-0.5 leading-snug" style={{ color: '#8C8C8E' }}>{label}</div>
            </div>
        </Link>
    )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, href, children, empty }: {
    title: string; href: string; children: React.ReactNode; empty: boolean
}) {
    return (
        <div className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 10px rgba(27,67,50,0.05)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                <h2 className="font-black text-sm" style={{ color: '#1C1C1E' }}>{title}</h2>
                <Link href={href} className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: '#1B4332' }}>
                    همه
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </Link>
            </div>
            <div className={`flex-1 ${empty ? 'flex items-center justify-center' : ''} p-5`}>
                {children}
            </div>
        </div>
    )
}

function EmptyState({ icon, text, cta, href }: { icon: React.ReactNode; text: string; cta: string; href: string }) {
    return (
        <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#F3EDE3' }}>
                {icon}
            </div>
            <p className="text-sm mb-3" style={{ color: '#8C8C8E' }}>{text}</p>
            <Link href={href} className="inline-block text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ background: '#1B4332' }}>{cta}</Link>
        </div>
    )
}

function SkeletonRows({ n = 3 }: { n?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: n }).map((_, i) => (
                <div key={i} className="h-11 rounded-xl animate-pulse" style={{ background: '#F3EDE3' }} />
            ))}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
            api.get('/courses/my-enrollments?limit=5').catch(() => ({ data: { data: { enrollments: [] } } })),
        ]).then(([testsRes, ordersRes, notifRes, apptRes, coursesRes]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const attempts    = (testsRes.data   as any)?.data?.attempts     ?? []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const orders      = (ordersRes.data  as any)?.data?.orders       ?? []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const notifs      = (notifRes.data   as any)?.data               ?? []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const appts       = (apptRes.data    as any)?.data?.appointments ?? []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const enrollments = (coursesRes.data as any)?.data?.enrollments  ?? (coursesRes.data as any)?.data ?? []
            setData({
                testAttempts:  attempts.length,
                orders:        orders.length,
                appointments:  appts.length,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                notifications: Array.isArray(notifs) ? notifs.filter((n: any) => !n.isRead).length : 0,
                courses:       Array.isArray(enrollments) ? enrollments.length : 0,
                packages:      0,
                recentTests:   attempts.slice(0, 4),
                recentOrders:  orders.slice(0, 4),
                recentCourses: Array.isArray(enrollments) ? enrollments.slice(0, 3) : [],
            })
        }).finally(() => setLoading(false))
    }, [])

    const stats = [
        { label: 'تست انجام شده',  value: loading ? '…' : String(data?.testAttempts ?? 0), href: '/dashboard/my-tests',              icon: <IconBrain    size={18} color="#1B4332" />, color: '#1B4332' },
        { label: 'دوره‌های من',     value: loading ? '…' : String(data?.courses      ?? 0), href: '/dashboard/courses',               icon: <IconPlay     size={18} color="#1565C0" />, color: '#1565C0' },
        { label: 'سفارشات',         value: loading ? '…' : String(data?.orders       ?? 0), href: '/dashboard/orders',                icon: <IconShop     size={18} color="#6A1B9A" />, color: '#6A1B9A' },
        { label: 'نوبت مشاوره',     value: loading ? '…' : String(data?.appointments ?? 0), href: '/dashboard/appointments',          icon: <IconCalendar size={18} color="#9A3412" />, color: '#9A3412' },
        { label: 'پکیج‌های فعال',   value: loading ? '…' : String(data?.packages     ?? 0), href: '/dashboard/educational-packages',  icon: <IconSms      size={18} color="#00695C" />, color: '#00695C' },
        { label: 'اعلان‌های جدید', value: loading ? '…' : String(data?.notifications ?? 0), href: '/dashboard/notifications',         icon: <IconBell     size={18} color="#C9A84C" />, color: '#C9A84C' },
    ]

    const hasName = !!(user?.fullName)

    return (
        <div className="space-y-6 pb-4">

            {/* ── Welcome banner ────────────────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 55%,#52B788 100%)', boxShadow: '0 4px 24px rgba(27,67,50,0.2)' }}>
                {/* dot pattern */}
                <div className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '18px 18px' }} />

                <div className="relative px-6 py-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{greeting()}</p>
                        <h1 className="text-[22px] font-black text-white leading-snug">
                            {user?.fullName ?? user?.phone ?? 'کاربر عزیز'} 👋
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="text-xs px-3 py-1 rounded-full font-semibold"
                                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                                {user?.subscriptionLevel === 'FREE' ? '🎁 اشتراک رایگان' : `⭐ ${user?.subscriptionLevel}`}
                            </span>
                            {user?.subscriptionLevel === 'FREE' && (
                                <Link href="/pricing"
                                    className="text-xs px-3 py-1 rounded-full font-bold transition-opacity hover:opacity-90"
                                    style={{ background: '#C9A84C', color: 'white' }}>
                                    ارتقا به پریمیوم ←
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Avatar large */}
                    <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black text-white"
                        style={{ background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                        {user?.avatarUrl
                            ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (user?.fullName ?? user?.phone ?? '?').charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Complete profile nudge */}
                {!hasName && (
                    <Link href="/dashboard/profile"
                        className="relative flex items-center gap-3 px-6 py-3 transition-opacity hover:opacity-90"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#C9A84C' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                            پروفایل ناقص است — نام خود را کامل کنید
                        </p>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" className="mr-auto">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </Link>
                )}
            </div>

            {/* ── Stats grid ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {stats.map(s => (
                    <StatCard key={s.label} {...s} />
                ))}
            </div>

            {/* ── 3-column activity ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Tests */}
                <SectionCard title="آخرین تست‌ها" href="/dashboard/my-tests" empty={!loading && !data?.recentTests.length}>
                    {loading ? <SkeletonRows /> : !data?.recentTests.length
                        ? <EmptyState icon={<IconBrain size={22} color="#1B4332" />} text="هنوز تستی انجام ندادید" cta="شروع تست" href="/tests" />
                        : (
                            <div className="space-y-2">
                                {data.recentTests.map(t => (
                                    <div key={t.id} className="flex items-center justify-between gap-2 py-2.5"
                                        style={{ borderBottom: '1px solid #F9F6F1' }}>
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: '#E8F5E9' }}>
                                                <IconBrain size={13} color="#1B4332" />
                                            </div>
                                            <p className="text-sm font-medium truncate" style={{ color: '#1C1C1E' }}>
                                                {t.test?.title ?? 'تست روانشناسی'}
                                            </p>
                                        </div>
                                        <StatusBadge status={t.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                </SectionCard>

                {/* Courses */}
                <SectionCard title="دوره‌های اخیر" href="/dashboard/courses" empty={!loading && !data?.recentCourses?.length}>
                    {loading ? <SkeletonRows /> : !data?.recentCourses?.length
                        ? <EmptyState icon={<IconPlay size={22} color="#1565C0" />} text="در دوره‌ای ثبت‌نام نکرده‌اید" cta="مشاهده دوره‌ها" href="/courses" />
                        : (
                            <div className="space-y-3">
                                {data.recentCourses.map(e => {
                                    const pct = Math.min(100, Math.round(e.progress ?? 0))
                                    return (
                                        <Link key={e.id} href={`/courses/${e.course.slug}/learn`}
                                            className="flex items-center gap-3 group">
                                            <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                                                style={{ background: 'linear-gradient(135deg,#1B4332,#52B788)' }}>
                                                {e.course.thumbnail
                                                    ? <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    : <IconPlay size={14} color="rgba(255,255,255,0.7)" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: '#1C1C1E' }}>{e.course.title}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F3EDE3' }}>
                                                        <div className="h-full rounded-full transition-all"
                                                            style={{ width: `${pct}%`, background: pct === 100 ? '#059669' : '#1B4332' }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold shrink-0" style={{ color: pct === 100 ? '#059669' : '#1B4332' }}>
                                                        {pct === 100 ? <IconCheck size={12} color="#059669" /> : `${pct}٪`}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                </SectionCard>

                {/* Orders */}
                <SectionCard title="سفارشات اخیر" href="/dashboard/orders" empty={!loading && !data?.recentOrders.length}>
                    {loading ? <SkeletonRows /> : !data?.recentOrders.length
                        ? <EmptyState icon={<IconShop size={22} color="#6A1B9A" />} text="هنوز خریدی نداشتید" cta="فروشگاه" href="/shop" />
                        : (
                            <div className="space-y-2">
                                {data.recentOrders.map(o => (
                                    <div key={o.id} className="flex items-center justify-between gap-2 py-2.5"
                                        style={{ borderBottom: '1px solid #F9F6F1' }}>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: '#1C1C1E' }}>
                                                {o.totalAmount.toLocaleString('fa-IR')} <span className="text-xs font-normal" style={{ color: '#8C8C8E' }}>تومان</span>
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                                                {new Date(o.createdAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <StatusBadge status={o.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                </SectionCard>
            </div>

            {/* ── Quick actions ─────────────────────────────────────────── */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 10px rgba(27,67,50,0.05)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                    <h2 className="font-black text-sm" style={{ color: '#1C1C1E' }}>دسترسی سریع</h2>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-0">
                    {QUICK.map((a, i) => (
                        <Link key={a.href} href={a.href}
                            className="flex flex-col items-center gap-2 p-4 transition-all hover:scale-95"
                            style={{ borderLeft: i % 4 !== 0 ? '1px solid #F3EDE3' : 'none' }}>
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: a.bg }}>
                                {a.icon}
                            </div>
                            <span className="text-[11px] font-semibold text-center leading-snug" style={{ color: '#5C5C5E' }}>{a.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    )
}
