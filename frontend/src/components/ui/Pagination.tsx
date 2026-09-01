'use client'

interface PaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

export default function Pagination({
    page,
    totalPages,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <div
            className="flex items-center gap-1 justify-center"
            role="navigation"
            aria-label="صفحه‌بندی"
        >
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                aria-label="صفحه قبل"
            >
                ›
            </button>
            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={[
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        p === page
                            ? 'bg-primary-700 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
                    ].join(' ')}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                aria-label="صفحه بعد"
            >
                ‹
            </button>
        </div>
    )
}
