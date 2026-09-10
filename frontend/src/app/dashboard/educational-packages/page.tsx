'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth.store'
import { IconBook, IconSms, IconCalendar, IconCheck, IconPlay } from '@/components/ui/Icon'

interface PackageMessage {
    day_number: number
    message: string
    sent_at?: string
}

interface EducationalPackage {
    id: string
    title: string
    name?: string
    description: string | null
    price?: number
    product_type?: string | null
    dispatch_rate?: number
    duration_days?: number
    current_day?: number
    send_hour?: number
    is_active?: boolean
    next_send_at?: string | null
    past_messages?: PackageMessage[]
    started_at?: string
    created_at?: string
    slug?: string
}

function formatNextSend(next: string | null | undefined): string {
    if (!next) return '—'
    const d = new Date(next)
    const now = new Date()
    const diffMs = d.getTime() - now.getTime()
    if (diffMs < 0) return 'به زودی'
    const diffH = Math.floor(diffMs / 3600000)
    const diffM = Math.floor((diffMs % 3600000) / 60000)
    if (diffH < 24) return diffH > 0 ? `${diffH} ساعت و ${diffM} دقیقه دیگر` : `${diffM} دقیقه دیگر`
    return d.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ProgressRing({ pct }: { pct: number }) {
    const r = 20
    const circ = 2 * Math.PI * r
    const offset = circ - (pct / 100) * circ
    return (
        <svg width={52} height={52} viewBox="0 0 52 52" className="shrink-0">
            <circle cx={26} cy={26} r={r} fill="none" stroke="#F3EDE3" strokeWidth={5} />
            <circle cx={26} cy={26} r={r} fill="none" stroke="#1B4332" strokeWidth={5}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 26 26)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <text x={26} y={30} textAnchor="middle" fontSize={10} fontWeight={800} fill="#1B4332">
                {pct}٪
            </text>
        </svg>
    )
}

export default function EducationalPackagesPage() {
    const { accessToken } = useAuthStore()
    const [packages, setPackages] = useState<EducationalPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'packages' | 'sms'>('packages')

    useEffect(() => {
        if (!accessToken) { setLoading(false); return }

        Promise.all([
            fetch('/api/user/sms-packages', {
                headers: { Authorization: `Bearer ${accessToken}` },
            }).then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
        ]).then(([smsRes]) => {
            const all: EducationalPackage[] = [
                ...(smsRes.data ?? []),
            ]
            setPackages(all)
        }).catch(() => setPackages([]))
          .finally(() => setLoading(false))
    }, [accessToken])

    const eduPkgs = packages.filter(p => p.product_type !== 'sms')
    const smsPkgs = packages.filter(p => p.product_type === 'sms' || p.duration_days != null)

    const displayList = activeTab === 'packages' ? eduPkgs : smsPkgs

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>پکیج‌های من</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#8C8C8E' }}>
                        پکیج‌های آموزشی و پیامکی خریداری شده
                    </p>
                </div>
                <Link href="/shop"
                    className="text-sm font-bold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                    style={{ background: '#1B4332' }}>
                    + خرید پکیج
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl p-4 border flex items-center gap-3"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: '#E3F2FD' }}>
                        <IconBook size={18} color="#1565C0" />
                    </div>
                    <div>
                        <div className="text-xl font-black" style={{ color: '#1C1C1E' }}>
                            {eduPkgs.length.toLocaleString('fa-IR')}
                        </div>
                        <div className="text-xs" style={{ color: '#8C8C8E' }}>پکیج آموزشی</div>
                    </div>
                </div>
                <div className="rounded-2xl p-4 border flex items-center gap-3"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: '#E8F5E9' }}>
                        <IconSms size={18} color="#1B4332" />
                    </div>
                    <div>
                        <div className="text-xl font-black" style={{ color: '#1C1C1E' }}>
                            {smsPkgs.length.toLocaleString('fa-IR')}
                        </div>
                        <div className="text-xs" style={{ color: '#8C8C8E' }}>پکیج پیامکی</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
                {([['packages', 'پکیج‌های آموزشی', eduPkgs.length], ['sms', 'پکیج‌های پیامکی', smsPkgs.length]] as const).map(([val, label, count]) => (
                    <button key={val} onClick={() => setActiveTab(val)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                        style={{
                            background: activeTab === val ? '#1B4332' : 'white',
                            color: activeTab === val ? 'white' : '#5C5C5E',
                            border: `1px solid ${activeTab === val ? '#1B4332' : '#EDE6D6'}`,
                        }}>
                        {label}
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                            style={{
                                background: activeTab === val ? 'rgba(255,255,255,0.2)' : '#F3EDE3',
                                color: activeTab === val ? 'white' : '#1B4332',
                            }}>
                            {count.toLocaleString('fa-IR')}
                        </span>
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />
                    ))}
                </div>
            ) : displayList.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: activeTab === 'sms' ? '#E8F5E9' : '#E3F2FD' }}>
                        {activeTab === 'sms'
                            ? <IconSms size={28} color="#1B4332" />
                            : <IconBook size={28} color="#1565C0" />}
                    </div>
                    <p className="font-semibold mb-1" style={{ color: '#1C1C1E' }}>
                        {activeTab === 'sms' ? 'پکیج پیامکی ندارید' : 'پکیج آموزشی ندارید'}
                    </p>
                    <p className="text-sm mb-6" style={{ color: '#8C8C8E' }}>
                        {activeTab === 'sms'
                            ? 'با خرید پکیج پیامکی، هر روز یک پیام انگیزشی دریافت کنید'
                            : 'از فروشگاه یاری‌جو پکیج آموزشی تهیه کنید'}
                    </p>
                    <Link href="/shop"
                        className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: '#1B4332' }}>
                        مشاهده پکیج‌ها
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayList.map(pkg => {
                        const isOpen = expanded === pkg.id
                        const pct = pkg.duration_days && pkg.current_day != null
                            ? Math.min(100, Math.round((pkg.current_day / pkg.duration_days) * 100))
                            : null

                        return (
                            <div key={pkg.id} className="rounded-2xl border overflow-hidden"
                                style={{ background: 'white', borderColor: '#EDE6D6' }}>

                                {/* Main row */}
                                <button className="w-full text-right p-5"
                                    onClick={() => setExpanded(isOpen ? null : pkg.id)}>
                                    <div className="flex items-center gap-4">
                                        {/* Progress ring or icon */}
                                        {pct !== null ? (
                                            <ProgressRing pct={pct} />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ background: '#E3F2FD' }}>
                                                <IconBook size={20} color="#1565C0" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-bold text-sm line-clamp-1" style={{ color: '#1C1C1E' }}>
                                                    {pkg.title ?? pkg.name ?? 'پکیج آموزشی'}
                                                </h3>
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                                                    style={{
                                                        background: pkg.is_active !== false ? '#E8F5E9' : '#F3EDE3',
                                                        color: pkg.is_active !== false ? '#1B4332' : '#8C8C8E',
                                                    }}>
                                                    {pkg.is_active !== false ? 'فعال' : 'غیرفعال'}
                                                </span>
                                            </div>

                                            {pkg.description && (
                                                <p className="text-xs mt-1 line-clamp-1" style={{ color: '#8C8C8E' }}>
                                                    {pkg.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#8C8C8E' }}>
                                                {pkg.duration_days != null && pkg.current_day != null && (
                                                    <span className="flex items-center gap-1">
                                                        <IconCalendar size={11} color="#8C8C8E" />
                                                        روز {pkg.current_day.toLocaleString('fa-IR')} از {pkg.duration_days.toLocaleString('fa-IR')}
                                                    </span>
                                                )}
                                                {pkg.next_send_at && (
                                                    <span>ارسال بعدی: {formatNextSend(pkg.next_send_at)}</span>
                                                )}
                                                {(pkg.started_at ?? pkg.created_at) && (
                                                    <span>
                                                        {new Date(pkg.started_at ?? pkg.created_at!).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Inline progress bar */}
                                            {pct !== null && (
                                                <div className="mt-2.5">
                                                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#F3EDE3' }}>
                                                        <div className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${pct}%`,
                                                                background: pct === 100
                                                                    ? 'linear-gradient(90deg,#065F46,#059669)'
                                                                    : 'linear-gradient(90deg,#1B4332,#2D6A4F)',
                                                            }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Chevron */}
                                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#8C8C8E"
                                            strokeWidth="2.5" strokeLinecap="round"
                                            className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Expanded: message history */}
                                {isOpen && (
                                    <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: '#F3EDE3', background: '#FDFBF8' }}>

                                        {/* Stats row */}
                                        {(pkg.duration_days || pkg.send_hour || pkg.dispatch_rate) && (
                                            <div className="grid grid-cols-3 gap-3 mb-4">
                                                {pkg.duration_days != null && (
                                                    <div className="rounded-xl p-3 text-center" style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                                                        <div className="font-black text-base" style={{ color: '#1C1C1E' }}>
                                                            {pkg.duration_days.toLocaleString('fa-IR')}
                                                        </div>
                                                        <div className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>کل روز</div>
                                                    </div>
                                                )}
                                                {pkg.current_day != null && (
                                                    <div className="rounded-xl p-3 text-center" style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                                                        <div className="font-black text-base" style={{ color: '#1B4332' }}>
                                                            {pkg.current_day.toLocaleString('fa-IR')}
                                                        </div>
                                                        <div className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>روز جاری</div>
                                                    </div>
                                                )}
                                                {pkg.send_hour != null && (
                                                    <div className="rounded-xl p-3 text-center" style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                                                        <div className="font-black text-base" style={{ color: '#1C1C1E' }}>
                                                            {pkg.send_hour}:00
                                                        </div>
                                                        <div className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>ساعت ارسال</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Messages */}
                                        {pkg.past_messages && pkg.past_messages.length > 0 ? (
                                            <>
                                                <h4 className="text-xs font-semibold mb-3" style={{ color: '#8C8C8E' }}>
                                                    پیام‌های دریافت شده ({pkg.past_messages.length.toLocaleString('fa-IR')})
                                                </h4>
                                                <div className="space-y-3 max-h-72 overflow-y-auto">
                                                    {pkg.past_messages.map(msg => (
                                                        <div key={msg.day_number} className="flex gap-3 p-3 rounded-xl"
                                                            style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                                                style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                                                {msg.day_number.toLocaleString('fa-IR')}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-xs mb-1" style={{ color: '#8C8C8E' }}>
                                                                    روز {msg.day_number.toLocaleString('fa-IR')}
                                                                    {msg.sent_at && (
                                                                        <span className="mr-2">
                                                                            · {new Date(msg.sent_at).toLocaleDateString('fa-IR')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm leading-relaxed" style={{ color: '#1C1C1E' }}>
                                                                    {msg.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-6">
                                                <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                                                    style={{ background: '#F3EDE3' }}>
                                                    <IconSms size={18} color="#8C8C8E" />
                                                </div>
                                                <p className="text-sm" style={{ color: '#8C8C8E' }}>
                                                    هنوز پیامی دریافت نشده
                                                </p>
                                            </div>
                                        )}

                                        {/* View package link */}
                                        {pkg.slug && (
                                            <div className="mt-4 pt-3 border-t" style={{ borderColor: '#EDE6D6' }}>
                                                <Link href={`/payammooz/${pkg.slug}`}
                                                    className="flex items-center gap-2 text-xs font-semibold transition-opacity hover:opacity-70"
                                                    style={{ color: '#1B4332' }}>
                                                    <IconPlay size={12} color="#1B4332" />
                                                    مشاهده صفحه پکیج
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
