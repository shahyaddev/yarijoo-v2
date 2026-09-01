'use client'
import Link from 'next/link'
import { Badge } from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'

const LEVEL_LABELS: Record<string, string> = {
    FREE: 'رایگان',
    SILVER: 'نقره‌ای',
    GOLD: 'طلایی',
    PLATINUM: 'پلاتینیوم',
}

const LEVEL_VARIANTS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
    FREE: 'default',
    SILVER: 'info',
    GOLD: 'warning',
    PLATINUM: 'success',
}

interface SubscriptionBadgeProps {
    /** Subscription expiry date (ISO string). Pass from server data when available. */
    expiryDate?: string | null
    /** Whether to show the upgrade CTA link */
    showUpgradeCta?: boolean
}

export default function SubscriptionBadge({
    expiryDate,
    showUpgradeCta = true,
}: SubscriptionBadgeProps) {
    const user = useAuthStore((s) => s.user)
    const level = user?.subscriptionLevel ?? 'FREE'
    const label = LEVEL_LABELS[level] ?? level
    const variant = LEVEL_VARIANTS[level] ?? 'default'

    const formattedExpiry = expiryDate
        ? new Date(expiryDate).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : null

    const isPaid = level !== 'FREE'

    return (
        <div
            className="mx-3 my-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700"
            dir="rtl"
        >
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">اشتراک شما</span>
                <Badge variant={variant}>{label}</Badge>
            </div>

            {isPaid && formattedExpiry && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    انقضا: {formattedExpiry}
                </p>
            )}

            {showUpgradeCta && !isPaid && (
                <Link
                    href="/pricing"
                    className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline"
                >
                    ارتقاء اشتراک ↑
                </Link>
            )}

            {showUpgradeCta && isPaid && level !== 'PLATINUM' && (
                <Link
                    href="/pricing"
                    className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline"
                >
                    ارتقاء به پلن بالاتر
                </Link>
            )}
        </div>
    )
}
