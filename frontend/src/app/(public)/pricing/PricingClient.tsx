'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui'

const PLANS = [
    {
        level: 'FREE',
        name: 'رایگان',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ['۳ تست در ماه', 'دسترسی به مقالات عمومی', 'پشتیبانی پایه'],
        notIncluded: ['تست‌های پریمیوم', 'تحلیل هوش مصنوعی', 'کتاب‌خانه', 'تخفیف مشاوره'],
        recommended: false,
    },
    {
        level: 'SILVER',
        name: 'نقره‌ای',
        monthlyPrice: 99000,
        yearlyPrice: 990000,
        features: ['۲۰ تست در ماه', 'تست‌های پریمیوم', 'کتاب‌خانه کامل', 'مقالات پریمیوم'],
        notIncluded: ['تحلیل هوش مصنوعی', 'تخفیف مشاوره', 'پشتیبانی اولویت‌دار'],
        recommended: false,
    },
    {
        level: 'GOLD',
        name: 'طلایی',
        monthlyPrice: 199000,
        yearlyPrice: 1990000,
        features: ['تست‌های نامحدود', 'تحلیل هوش مصنوعی', 'کتاب‌خانه کامل', '۱۰٪ تخفیف مشاوره', 'پشتیبانی سریع'],
        notIncluded: ['پشتیبانی اولویت‌دار VIP'],
        recommended: true,
    },
    {
        level: 'PLATINUM',
        name: 'پلاتینیوم',
        monthlyPrice: 349000,
        yearlyPrice: 3490000,
        features: ['تمام امکانات طلایی', '۲۰٪ تخفیف مشاوره', 'پشتیبانی VIP اولویت‌دار', 'دسترسی به دوره‌ها'],
        notIncluded: [],
        recommended: false,
    },
]

export default function PricingClient() {
    const [isYearly, setIsYearly] = useState(false)

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">پلن‌های اشتراک</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">دسترسی نامحدود به تمام امکانات یاری‌جو</p>

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
                        <Badge variant="success" className="text-xs">۱۷٪ تخفیف</Badge>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {PLANS.map((plan) => {
                    const monthlyEquivalent = isYearly
                        ? Math.round(plan.yearlyPrice / 12)
                        : plan.monthlyPrice
                    const totalPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice

                    return (
                        <div
                            key={plan.level}
                            className={[
                                'bg-white dark:bg-gray-900 rounded-2xl border-2 p-6 flex flex-col relative',
                                plan.recommended
                                    ? 'border-primary-600 shadow-lg scale-105'
                                    : 'border-gray-100 dark:border-gray-800',
                            ].join(' ')}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge variant="success" className="px-4 py-1">پیشنهادی</Badge>
                                </div>
                            )}

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h2>

                            <div className="mb-6">
                                {totalPrice === 0 ? (
                                    <span className="text-3xl font-black text-gray-900 dark:text-white">رایگان</span>
                                ) : (
                                    <div>
                                        <span className="text-3xl font-black text-primary-700 dark:text-primary-400">
                                            {monthlyEquivalent.toLocaleString('fa-IR')}
                                        </span>
                                        <span className="text-gray-400 text-sm mr-1">ت/ماه</span>
                                        {isYearly && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                ({totalPrice.toLocaleString('fa-IR')} ت/سال)
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-2 flex-1 mb-6">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="text-green-500 flex-shrink-0" aria-hidden="true">✓</span> {f}
                                    </li>
                                ))}
                                {plan.notIncluded.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                                        <span className="flex-shrink-0" aria-hidden="true">✗</span>
                                        <span className="sr-only">شامل نمی‌شود: </span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={
                                    plan.level === 'FREE'
                                        ? '/auth/login'
                                        : `/auth/login?redirect=/pricing&plan=${plan.level}`
                                }
                                className={[
                                    'block w-full text-center py-3 rounded-xl font-bold transition-colors text-sm',
                                    plan.recommended
                                        ? 'bg-primary-700 hover:bg-primary-600 text-white'
                                        : 'border-2 border-primary-600 text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
                                ].join(' ')}
                            >
                                {plan.level === 'FREE' ? 'شروع رایگان' : 'خرید اشتراک'}
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
