'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui'
import Skeleton from '@/components/ui/Skeleton'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFeatures {
    testsPerMonth: number
    premiumTests: boolean
    aiAnalysis: boolean
    consultationDiscount: number
    booksAccess: boolean
    prioritySupport: boolean
}

interface Plan {
    name: string
    level: string
    monthlyPrice: number
    yearlyPrice: number
    features: PlanFeatures
}

// ─── Feature label helpers ────────────────────────────────────────────────────

function featureLines(f: PlanFeatures): { text: string; included: boolean }[] {
    return [
        {
            text: f.testsPerMonth === -1 ? 'تست‌های نامحدود' : `${f.testsPerMonth} تست در ماه`,
            included: true,
        },
        { text: 'تست‌های پریمیوم', included: f.premiumTests },
        { text: 'تحلیل هوش مصنوعی', included: f.aiAnalysis },
        { text: 'کتاب‌خانه کامل', included: f.booksAccess },
        {
            text: f.consultationDiscount > 0
                ? `${f.consultationDiscount}٪ تخفیف مشاوره`
                : 'تخفیف مشاوره',
            included: f.consultationDiscount > 0,
        },
        { text: 'پشتیبانی اولویت‌دار', included: f.prioritySupport },
    ]
}

const PLAN_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
    FREE: { bg: 'bg-white dark:bg-gray-900', border: 'border-gray-200 dark:border-gray-700', badge: '' },
    SILVER: { bg: 'bg-white dark:bg-gray-900', border: 'border-gray-300 dark:border-gray-600', badge: '' },
    GOLD: { bg: 'bg-white dark:bg-gray-900', border: 'border-primary-500', badge: 'پیشنهادی' },
    PLATINUM: { bg: 'bg-white dark:bg-gray-900', border: 'border-yellow-400', badge: 'ویژه' },
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PlanSkeleton() {
    return (
        <div className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-32" />
            <div className="space-y-2 pt-2">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
        </div>
    )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PricingClient() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [isYearly, setIsYearly] = useState(false)
    const [subscribing, setSubscribing] = useState<string | null>(null)
    const [currentLevel, setCurrentLevel] = useState<string>('FREE')
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

    const { isAuthenticated, user } = useAuthStore()
    const router = useRouter()

    // ── Load plans ──────────────────────────────────────────────────────────
    useEffect(() => {
        api.get<{ data?: Plan[] }>('/subscriptions/plans')
            .then((res) => {
                const data: Plan[] = Array.isArray(res.data)
                    ? (res.data as Plan[])
                    : ((res.data as { data?: Plan[] }).data ?? [])
                setPlans(data)
            })
            .catch(() => {
                // fallback to local config if API unreachable
                setPlans([])
            })
            .finally(() => setLoading(false))
    }, [])

    // ── Load current subscription level ────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated) {
            setCurrentLevel('FREE')
            return
        }
        // Prefer from user store (already fetched at login)
        if (user?.subscriptionLevel) {
            setCurrentLevel(user.subscriptionLevel)
            return
        }
        api.get<{ data?: { level?: string } }>('/subscriptions/current')
            .then((res) => {
                const level = (res.data as { data?: { level?: string } }).data?.level ?? 'FREE'
                setCurrentLevel(level)
            })
            .catch(() => setCurrentLevel('FREE'))
    }, [isAuthenticated, user])

    // ── Subscribe handler ───────────────────────────────────────────────────
    const handleSubscribe = async (plan: Plan) => {
        if (plan.level === 'FREE') {
            router.push('/auth/login')
            return
        }

        if (!isAuthenticated) {
            router.push(`/auth/login?redirect=/pricing`)
            return
        }

        // Already on this plan
        if (currentLevel === plan.level) {
            showToast('شما در حال حاضر این اشتراک را دارید', false)
            return
        }

        setSubscribing(plan.level)
        try {
            await api.post('/subscriptions/subscribe', {
                plan: plan.level,
                period: isYearly ? 'yearly' : 'monthly',
            })
            setCurrentLevel(plan.level)
            showToast(`اشتراک ${plan.name} با موفقیت فعال شد 🎉`, true)
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'خطا در فعال‌سازی اشتراک'
            showToast(msg, false)
        } finally {
            setSubscribing(null)
        }
    }

    function showToast(msg: string, ok: boolean) {
        setToast({ msg, ok })
        setTimeout(() => setToast(null), 4000)
    }

    const savings17 = '۱۷٪ صرفه‌جویی'

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Toast */}
            {toast && (
                <div
                    className={[
                        'fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all',
                        toast.ok ? 'bg-green-600' : 'bg-red-600',
                    ].join(' ')}
                >
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                    پلن‌های اشتراک
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    دسترسی نامحدود به تمام امکانات یاری‌جو
                </p>

                {/* Monthly / Yearly toggle */}
                <div
                    className="inline-flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl"
                    role="group"
                    aria-label="نوع پرداخت"
                >
                    <button
                        onClick={() => setIsYearly(false)}
                        aria-pressed={!isYearly}
                        className={[
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            !isYearly
                                ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white'
                                : 'text-gray-500',
                        ].join(' ')}
                    >
                        ماهانه
                    </button>
                    <button
                        onClick={() => setIsYearly(true)}
                        aria-pressed={isYearly}
                        className={[
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                            isYearly
                                ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white'
                                : 'text-gray-500',
                        ].join(' ')}
                    >
                        سالانه
                        <Badge variant="success" className="text-xs">{savings17}</Badge>
                    </button>
                </div>
            </div>

            {/* Plans grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <PlanSkeleton key={i} />)
                    : plans.map((plan) => {
                        const colors = PLAN_COLORS[plan.level] ?? PLAN_COLORS.FREE
                        const isRecommended = plan.level === 'GOLD'
                        const isCurrent = currentLevel === plan.level

                        const monthlyEquiv = isYearly
                            ? Math.round(plan.yearlyPrice / 12)
                            : plan.monthlyPrice
                        const totalPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice

                        const features = featureLines(plan.features)

                        return (
                            <div
                                key={plan.level}
                                className={[
                                    'relative flex flex-col rounded-2xl border-2 p-6',
                                    colors.bg,
                                    colors.border,
                                    isRecommended ? 'shadow-xl scale-[1.02]' : 'shadow-sm',
                                ].join(' ')}
                            >
                                {/* Badge */}
                                {(colors.badge || isCurrent) && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        {isCurrent ? (
                                            <Badge variant="info" className="px-4 py-1">اشتراک فعلی</Badge>
                                        ) : (
                                            <Badge variant="success" className="px-4 py-1">{colors.badge}</Badge>
                                        )}
                                    </div>
                                )}

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-1">
                                    {plan.name}
                                </h2>

                                {/* Price */}
                                <div className="mb-6">
                                    {totalPrice === 0 ? (
                                        <span className="text-3xl font-black text-gray-900 dark:text-white">
                                            رایگان
                                        </span>
                                    ) : (
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-primary-700 dark:text-primary-400">
                                                    {monthlyEquiv.toLocaleString('fa-IR')}
                                                </span>
                                                <span className="text-gray-400 text-sm">ت/ماه</span>
                                            </div>
                                            {isYearly && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    ({totalPrice.toLocaleString('fa-IR')} ت/سال)
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-2 flex-1 mb-6">
                                    {features.map((f) => (
                                        <li
                                            key={f.text}
                                            className={[
                                                'flex items-center gap-2 text-sm',
                                                f.included
                                                    ? 'text-gray-700 dark:text-gray-300'
                                                    : 'text-gray-300 dark:text-gray-600',
                                            ].join(' ')}
                                        >
                                            <span
                                                className={f.included ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}
                                                aria-hidden="true"
                                            >
                                                {f.included ? '✓' : '✗'}
                                            </span>
                                            {f.text}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={subscribing === plan.level || isCurrent}
                                    className={[
                                        'w-full text-center py-3 rounded-xl font-bold transition-all text-sm relative',
                                        isCurrent
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
                                            : isRecommended
                                                ? 'bg-primary-700 hover:bg-primary-600 text-white'
                                                : 'border-2 border-primary-600 text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
                                        subscribing === plan.level ? 'opacity-70 cursor-wait' : '',
                                    ].join(' ')}
                                >
                                    {subscribing === plan.level ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            در حال پردازش...
                                        </span>
                                    ) : isCurrent ? (
                                        '✓ اشتراک فعال'
                                    ) : plan.level === 'FREE' ? (
                                        'شروع رایگان'
                                    ) : (
                                        'خرید اشتراک'
                                    )}
                                </button>
                            </div>
                        )
                    })}
            </div>

            {/* Empty fallback if API returned nothing */}
            {!loading && plans.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <p>اطلاعات پلن‌ها در دسترس نیست. لطفاً دوباره امتحان کنید.</p>
                </div>
            )}

            {/* FAQ strip */}
            <div className="mt-16 max-w-2xl mx-auto space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
                    سوالات متداول
                </h2>
                {[
                    { q: 'آیا می‌توانم اشتراکم را لغو کنم؟', a: 'بله، در هر زمان می‌توانید اشتراک خود را از داشبورد لغو کنید.' },
                    { q: 'آیا تخفیف سالانه واقعی است؟', a: 'بله، پرداخت سالانه ۱۷٪ نسبت به پرداخت ماهانه صرفه‌جویی دارد.' },
                    { q: 'اشتراک چه زمانی فعال می‌شود؟', a: 'بلافاصله پس از تأیید پرداخت، اشتراک فعال می‌شود.' },
                ].map((item, i) => (
                    <details
                        key={i}
                        className="group rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900"
                    >
                        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold list-none select-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                            {item.q}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 group-open:rotate-180 transition-transform text-gray-400">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </summary>
                        <div className="px-5 pb-4 pt-1 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                            {item.a}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    )
}
