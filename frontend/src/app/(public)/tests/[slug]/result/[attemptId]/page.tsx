import Link from 'next/link'
import { Badge } from '@/components/ui'

interface PageProps {
    params: Promise<{ slug: string; attemptId: string }>
}

export default async function TestResultPage({ params }: PageProps) {
    const { slug, attemptId } = await params
    const score = 65
    const maxScore = 100

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    نتیجه تست
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    تست: {slug.toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    شناسه: {attemptId}
                </p>
            </div>

            {/* Score gauge */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 mb-6 text-center">
                <div className="w-36 h-36 rounded-full border-8 border-primary-600 flex items-center justify-center mx-auto mb-4">
                    <div>
                        <div className="text-4xl font-black text-primary-700 dark:text-primary-400">
                            {score}
                        </div>
                        <div className="text-sm text-gray-400">از {maxScore}</div>
                    </div>
                </div>
                <Badge variant="success" className="text-base px-4 py-1.5">
                    در سطح متوسط
                </Badge>
            </div>

            {/* Interpretation */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
                <h2 className="font-bold text-gray-900 dark:text-white mb-3">
                    تفسیر نتیجه
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    نتیجه تست شما نشان می‌دهد که در سطح متوسطی از این شاخص
                    قرار دارید. این نتیجه بر اساس پاسخ‌های شما به سوالات تست
                    محاسبه شده است.
                </p>
            </div>

            {/* AI Insight panel */}
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-primary-800 dark:text-primary-300 mb-2">
                    🤖 تحلیل هوش مصنوعی
                </h2>
                <p className="text-primary-700 dark:text-primary-400 text-sm mb-4">
                    تحلیل شخصی‌سازی‌شده بر اساس نتایج شما توسط هوش مصنوعی
                </p>
                <button className="px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors">
                    درخواست تحلیل AI
                </button>
            </div>

            <div className="flex gap-4 justify-center">
                <Link
                    href="/tests"
                    className="px-6 py-3 border-2 border-primary-600 text-primary-700 dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
                >
                    بازگشت به تست‌ها
                </Link>
                <Link
                    href="/dashboard/my-tests"
                    className="px-6 py-3 bg-primary-700 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                >
                    تاریخچه تست‌ها
                </Link>
            </div>
        </div>
    )
}
