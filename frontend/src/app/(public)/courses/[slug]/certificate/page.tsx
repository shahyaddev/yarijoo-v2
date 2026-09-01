import type { Metadata } from 'next'
import Link from 'next/link'
import CertificateDownloadButton from './CertificateDownloadButton'

export const metadata: Metadata = {
    title: 'گواهینامه دوره | یاری‌جو',
}

export default async function CertificatePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const completionDate = '۱۵ شهریور ۱۴۰۳'
    const courseName = 'مدیریت اضطراب با روش‌های شناختی-رفتاری'
    const userName = 'کاربر یاری‌جو'

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            {/* Back link */}
            <Link
                href={`/courses/${slug}`}
                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-700 transition-colors mb-8"
            >
                ← بازگشت به دوره
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                گواهینامه پایان دوره
            </h1>

            {/* Certificate card */}
            <div
                id="certificate"
                className="relative bg-white dark:bg-gray-900 rounded-3xl border-4 border-primary-200 dark:border-primary-800 p-10 text-center shadow-2xl overflow-hidden"
            >
                {/* Decorative corner ornaments */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary-300 dark:border-primary-700 rounded-tr-xl" />
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary-300 dark:border-primary-700 rounded-tl-xl" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary-300 dark:border-primary-700 rounded-br-xl" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary-300 dark:border-primary-700 rounded-bl-xl" />

                {/* Platform logo/name */}
                <div className="mb-6">
                    <div className="text-4xl mb-2">🧠</div>
                    <p className="text-lg font-bold text-primary-700 dark:text-primary-400">
                        پلتفرم یاری‌جو
                    </p>
                </div>

                {/* Certificate text */}
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    این گواهینامه تأیید می‌کند که
                </p>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-primary-200 dark:border-primary-800 pb-4 inline-block px-8">
                    {userName}
                </h2>

                <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 mb-3">
                    با موفقیت دوره
                </p>

                <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-4 px-4">
                    «{courseName}»
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    را به پایان رسانده است.
                </p>

                {/* Completion date */}
                <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <span>📅</span>
                    <span>تاریخ اتمام: {completionDate}</span>
                </div>

                {/* Stars decoration */}
                <div className="flex justify-center gap-1 text-yellow-400 text-lg">
                    {['★', '★', '★', '★', '★'].map((star, i) => (
                        <span key={i}>{star}</span>
                    ))}
                </div>

                {/* Signature area */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-8 text-xs text-gray-400">
                    <div className="text-center">
                        <div className="font-semibold text-gray-600 dark:text-gray-300 text-sm mb-1">
                            دکتر سارا محمدی
                        </div>
                        <div>مدرس دوره</div>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                    <div className="text-center">
                        <div className="font-semibold text-gray-600 dark:text-gray-300 text-sm mb-1">
                            یاری‌جو
                        </div>
                        <div>پلتفرم سلامت روان</div>
                    </div>
                </div>
            </div>

            {/* Download button */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <CertificateDownloadButton slug={slug} />
                <button className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span>🔗</span>
                    اشتراک‌گذاری
                </button>
            </div>

            {/* Back to courses */}
            <div className="mt-6 text-center">
                <Link
                    href="/courses"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-700 transition-colors"
                >
                    مشاهده سایر دوره‌ها →
                </Link>
            </div>
        </div>
    )
}
