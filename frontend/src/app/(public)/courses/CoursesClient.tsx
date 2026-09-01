'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui'
import { Card, CardBody } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

interface Course {
    id: string
    slug: string
    title: string
    description: string | null
    price: number
    salePrice: number | null
    totalLessons: number
    duration: number | null
    rating: number | null
    enrolledCount: number
    status: string
    category?: { name: string } | null
    thumbnail?: string | null
}

const LEVEL_MAP: Record<string, string> = {
    'anxiety-management-course': 'مبتدی',
    'mindfulness-course': 'مبتدی',
    'communication-skills': 'متوسط',
    'personal-growth-course': 'مبتدی',
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return ''
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h} ساعت`
    return `${m} دقیقه`
}

function CourseCard({ course }: { course: Course }) {
    const price = course.salePrice ?? course.price
    const categoryName = course.category?.name ?? ''
    const level = LEVEL_MAP[course.slug] ?? 'عمومی'

    return (
        <Link href={`/courses/${course.slug}`} aria-label={`دوره: ${course.title}`}>
            <Card hover className="h-full flex flex-col group">
                {/* Thumbnail */}
                <div
                    className="h-44 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 rounded-t-xl flex items-center justify-center text-7xl overflow-hidden relative"
                    aria-hidden="true"
                >
                    {course.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <span className="text-7xl select-none">🎓</span>
                    )}
                    {course.salePrice && course.salePrice < course.price && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            تخفیف
                        </div>
                    )}
                </div>
                <CardBody className="flex flex-col flex-1 gap-3">
                    {/* Category + Level */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {categoryName && <Badge variant="info">{categoryName}</Badge>}
                        <Badge variant="default">{level}</Badge>
                    </div>
                    {/* Title */}
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 flex-1">
                        {course.title}
                    </h3>
                    {/* Rating */}
                    {course.rating && (
                        <div className="flex items-center gap-1 text-xs" aria-label={`امتیاز: ${course.rating}`}>
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {course.rating.toFixed(1)}
                            </span>
                            <span className="text-gray-400">
                                ({course.enrolledCount.toLocaleString('fa-IR')} دانشجو)
                            </span>
                        </div>
                    )}
                    {/* Lessons + Price */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            📚 {course.totalLessons} درس
                            {course.duration ? ` · ⏱ ${formatDuration(course.duration)}` : ''}
                        </span>
                        <div className="text-right">
                            {price === 0 ? (
                                <span className="font-bold text-green-600 dark:text-green-400 text-sm">رایگان</span>
                            ) : (
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-primary-700 dark:text-primary-400 text-sm">
                                        {price.toLocaleString('fa-IR')} ت
                                    </span>
                                    {course.salePrice && course.price > course.salePrice && (
                                        <span className="text-xs text-gray-400 line-through">
                                            {course.price.toLocaleString('fa-IR')}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Link>
    )
}

function SkeletonCard() {
    return (
        <div
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            aria-hidden="true"
        >
            <Skeleton className="h-44 rounded-none" />
            <div className="p-5 space-y-3">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    )
}

export default function CoursesClient() {
    const [courses, setCourses] = useState<Course[]>([])
    const [allCourses, setAllCourses] = useState<Course[]>([])
    const [categories, setCategories] = useState<string[]>(['همه'])
    const [activeCategory, setActiveCategory] = useState('همه')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        setLoading(true)
        setError(false)
        fetch(`${API}/courses?limit=50`, { cache: 'no-store' })
            .then(async (res) => {
                if (!res.ok) throw new Error('fetch failed')
                const json = await res.json() as { data?: { courses?: Course[]; items?: Course[] } }
                const data: Course[] = json.data?.courses ?? json.data?.items ?? []
                setAllCourses(data)
                setCourses(data)

                // Compute unique categories from data
                const catSet = new Set<string>()
                data.forEach((c) => { if (c.category?.name) catSet.add(c.category.name) })
                setCategories(['همه', ...Array.from(catSet)])
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    const handleCategory = (cat: string) => {
        setActiveCategory(cat)
        if (cat === 'همه') {
            setCourses(allCourses)
        } else {
            setCourses(allCourses.filter((c) => c.category?.name === cat))
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    دوره‌های آموزشی
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    بهترین دوره‌های تخصصی سلامت روان و رشد فردی
                </p>
            </div>

            {/* Category tabs */}
            {!loading && categories.length > 1 && (
                <div className="flex gap-2 flex-wrap mb-8" role="group" aria-label="فیلتر دسته‌بندی">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategory(cat)}
                            aria-pressed={activeCategory === cat}
                            className={[
                                'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                                activeCategory === cat
                                    ? 'bg-primary-700 text-white border-primary-700'
                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-700',
                            ].join(' ')}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Results count */}
            {!loading && !error && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5" aria-live="polite">
                    {courses.length} دوره یافت شد
                </p>
            )}

            {/* Error state */}
            {error && !loading && (
                <div className="text-center py-20 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="text-5xl mb-3">😕</div>
                    <p className="text-gray-500">خطا در بارگذاری دوره‌ها. لطفاً دوباره تلاش کنید.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-primary-700 text-white rounded-xl text-sm font-medium hover:bg-primary-800 transition-colors"
                    >
                        تلاش مجدد
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && courses.length === 0 && (
                <div className="text-center py-20 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="text-5xl mb-3">🎓</div>
                    <p className="text-gray-500 dark:text-gray-400">دوره‌ای در این دسته‌بندی یافت نشد</p>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                    : courses.map((course) => <CourseCard key={course.id} course={course} />)
                }
            </div>
        </div>
    )
}
