'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui'
import api from '@/lib/api'

const TABS = [
    { key: 'all', label: 'همه' },
    { key: 'test', label: 'تست‌ها' },
    { key: 'blog', label: 'مقالات' },
    { key: 'book', label: 'کتاب‌ها' },
    { key: 'course', label: 'دوره‌ها' },
    { key: 'psychologist', label: 'روانشناسان' },
]

interface SearchItem {
    id: string
    type: string
    title: string
    slug?: string
    excerpt?: string
    imageUrl?: string
}

function SkeletonItem() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
            <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
            </div>
        </div>
    )
}

const TYPE_LABELS: Record<string, string> = {
    blog: 'مقاله', book: 'کتاب', test: 'تست', course: 'دوره', psychologist: 'روانشناس',
}

const TYPE_ICONS: Record<string, string> = {
    blog: '📰', book: '📖', test: '🧠', course: '🎓', psychologist: '👩‍⚕️',
}

function getItemHref(item: SearchItem): string {
    const pathMap: Record<string, string> = {
        blog: 'blog',
        test: 'tests',
        book: 'books',
        course: 'courses',
        psychologist: 'psychologists',
    }
    const base = pathMap[item.type] ?? item.type
    return `/${base}/${item.slug ?? item.id}`
}

function SearchResults() {
    const searchParams = useSearchParams()
    const q = searchParams.get('q') ?? ''
    const [activeType, setActiveType] = useState('all')
    const [results, setResults] = useState<SearchItem[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    useEffect(() => {
        if (!q) return
        setLoading(true)
        setSearched(false)
        api.get('/search', { params: { q, type: activeType, page: 1, limit: 20 } })
            .then((res) => {
                const data = res.data?.data ?? res.data
                setResults(Array.isArray(data?.items) ? data.items : [])
            })
            .catch(() => setResults([]))
            .finally(() => { setLoading(false); setSearched(true) })
    }, [q, activeType])

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    نتایج جستجو برای: <span className="text-primary-700 dark:text-primary-400">«{q}»</span>
                </h1>
                {!loading && searched && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{results.length} نتیجه یافت شد</p>
                )}
            </div>

            {/* Type tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveType(tab.key)}
                        className={[
                            'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                            activeType === tab.key
                                ? 'bg-primary-700 text-white border-primary-700'
                                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-400',
                        ].join(' ')}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Results */}
            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
                ) : results.length === 0 && searched ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">نتیجه‌ای یافت نشد</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">جستجوی دیگری امتحان کنید</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['اضطراب', 'افسردگی', 'MBTI', 'مدیتیشن'].map((s) => (
                                <a
                                    key={s}
                                    href={`/search?q=${s}`}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                >
                                    {s}
                                </a>
                            ))}
                        </div>
                    </div>
                ) : (
                    results.map((item) => (
                        <a
                            key={item.id}
                            href={getItemHref(item)}
                            className="flex gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition-all hover:border-primary-200 dark:hover:border-primary-800"
                        >
                            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                {TYPE_ICONS[item.type] ?? '📄'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="info" className="text-xs">
                                        {TYPE_LABELS[item.type] ?? item.type}
                                    </Badge>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                                    {item.title}
                                </h3>
                                {item.excerpt && (
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.excerpt}</p>
                                )}
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="max-w-4xl mx-auto px-4 py-10 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        }>
            <SearchResults />
        </Suspense>
    )
}
