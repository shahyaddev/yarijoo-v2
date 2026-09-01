'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'

interface PastMessage {
    day_number: number
    message: string
}

interface SmsSubscription {
    id: string
    package_id: string
    package_title: string
    package_description: string | null
    duration_days: number
    send_hour: number
    started_at: string
    current_day: number
    is_active: boolean
    next_send_at: string | null
    past_messages: PastMessage[]
}

export default function UserSmsPackagesPage() {
    const { accessToken } = useAuthStore()
    const [subs, setSubs] = useState<SmsSubscription[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)

    useEffect(() => {
        if (!accessToken) { setLoading(false); return }
        fetch('/api/user/sms-packages', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(r => r.json())
            .then(r => setSubs(r.data ?? []))
            .catch(() => setSubs([]))
            .finally(() => setLoading(false))
    }, [accessToken])

    const progressPct = (sub: SmsSubscription) =>
        Math.min(100, Math.round((sub.current_day / sub.duration_days) * 100))

    const formatNextSend = (next: string | null) => {
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

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>پکیج‌های پیامکی من</h1>
                <p className="text-sm mt-1" style={{ color: '#8C8C8E' }}>پیام‌های روزانه‌ای که دریافت می‌کنید</p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />
                    ))}
                </div>
            ) : subs.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="text-5xl mb-4">📱</div>
                    <p className="font-semibold mb-2" style={{ color: '#1C1C1E' }}>اشتراکی ندارید</p>
                    <p className="text-sm mb-6" style={{ color: '#8C8C8E' }}>با خرید پکیج پیامکی، هر روز یک پیام انگیزشی دریافت کنید</p>
                    <a href="/shop" className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: '#1B4332' }}>مشاهده پکیج‌ها</a>
                </div>
            ) : (
                <div className="space-y-4">
                    {subs.map(sub => {
                        const pct = progressPct(sub)
                        const isOpen = expanded === sub.id
                        return (
                            <div key={sub.id} className="rounded-2xl border overflow-hidden"
                                style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                {/* Main row */}
                                <button
                                    className="w-full text-right p-5"
                                    onClick={() => setExpanded(isOpen ? null : sub.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                                            style={{ background: '#E8F5E9' }}>
                                            📱
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-bold text-sm truncate" style={{ color: '#1C1C1E' }}>{sub.package_title}</h3>
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                                                    style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                                    فعال
                                                </span>
                                            </div>

                                            {/* Progress */}
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: '#8C8C8E' }}>
                                                    <span>روز {sub.current_day.toLocaleString('fa-IR')} از {sub.duration_days.toLocaleString('fa-IR')}</span>
                                                    <span>{pct}٪</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#F3EDE3' }}>
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1B4332, #2D6A4F)' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Next send */}
                                            <div className="flex items-center gap-1.5 mt-2.5 text-xs" style={{ color: '#8C8C8E' }}>
                                                <span>⏰</span>
                                                <span>ارسال بعدی: {formatNextSend(sub.next_send_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded: message history */}
                                {isOpen && (
                                    <div className="border-t px-5 pb-5" style={{ borderColor: '#F3EDE3' }}>
                                        {sub.package_description && (
                                            <p className="text-sm mt-4 mb-4 pb-4 border-b" style={{ color: '#5C5C5E', borderColor: '#F3EDE3' }}>
                                                {sub.package_description}
                                            </p>
                                        )}
                                        <h4 className="text-xs font-semibold mb-3 mt-4" style={{ color: '#8C8C8E' }}>
                                            پیام‌های دریافت شده ({sub.past_messages.length})
                                        </h4>
                                        {sub.past_messages.length === 0 ? (
                                            <p className="text-sm text-center py-4" style={{ color: '#8C8C8E' }}>
                                                هنوز پیامی دریافت نکرده‌اید
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {sub.past_messages.map(msg => (
                                                    <div key={msg.day_number}
                                                        className="flex gap-3 p-3 rounded-xl"
                                                        style={{ background: '#F9F5EF' }}>
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                                            style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                                            {msg.day_number}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-xs mb-1" style={{ color: '#8C8C8E' }}>روز {msg.day_number.toLocaleString('fa-IR')}</div>
                                                            <p className="text-sm leading-relaxed" style={{ color: '#1C1C1E' }}>{msg.message}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-3 text-center text-xs" style={{ borderColor: '#EDE6D6' }}>
                                            <div className="rounded-xl p-3" style={{ background: '#F3EDE3' }}>
                                                <div className="font-bold text-base" style={{ color: '#1C1C1E' }}>{sub.duration_days}</div>
                                                <div style={{ color: '#8C8C8E' }}>کل روز</div>
                                            </div>
                                            <div className="rounded-xl p-3" style={{ background: '#F3EDE3' }}>
                                                <div className="font-bold text-base" style={{ color: '#1B4332' }}>{sub.current_day}</div>
                                                <div style={{ color: '#8C8C8E' }}>روز جاری</div>
                                            </div>
                                            <div className="rounded-xl p-3" style={{ background: '#F3EDE3' }}>
                                                <div className="font-bold text-base" style={{ color: '#1C1C1E' }}>{sub.send_hour}:00</div>
                                                <div style={{ color: '#8C8C8E' }}>ساعت ارسال</div>
                                            </div>
                                        </div>
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
