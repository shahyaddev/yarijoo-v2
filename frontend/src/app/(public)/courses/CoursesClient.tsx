'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui'
import { Card, CardBody } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

const CATEGORIES = [
    'همه',
    'روانشناسی',
    'مدیریت استرس',
    'ارتباطات',
    'رشد فردی',
    'ذهن‌آگاهی',
]

const MOCK_COURSES = [
    {
        id: '1',
        slug: 'anxiety-management',
        title: 'مدیریت اضطراب با روش‌های شناختی-رفتاری',
        instructor: 'دکتر سارا محمدی',
        rating: 4.8,
        ratingCount: 312,
        lessons: 24,
        duration: '۱۲ ساعت',
        price: 490000,
        category: 'مدیریت استرس',
        level: 'مبتدی',
        emoji: '🧠',
    },
    {
        id: '2',
        slug: 'mindfulness-basics',
        title: 'مبانی ذهن‌آگاهی و مدیتیشن',
        instructor: 'استاد علی رضایی',
        rating: 4.9,
        ratingCount: 528,
        lessons: 18,
        duration: '۸ ساعت',
        price: 350000,
        category: 'ذهن‌آگاهی',
        level: 'مبتدی',
        emoji: '🧘',
    },
    {
        id: '3',
        slug: 'relationships-communication',
        title: 'مهارت‌های ارتباطی در روابط سالم',
        instructor: 'دکتر نیلوفر احمدی',
        rating: 4.7,
        ratingCount: 198,
        lessons: 30,
        duration: '۱۵ ساعت',
        price: 590000,
        category: 'ارتباطات',
        level: 'متوسط',
        emoji: '💬',
    },
    {
        id: '4',
        slug: 'self-esteem-growth',
        title: 'تقویت اعتماد به نفس و رشد فردی',
        instructor: 'دکتر مهدی کریمی',
        rating: 4.6,
        ratingCount: 145,
        lessons: 20,
        duration: '۱۰ ساعت',
        price: 420000,
        category: 'رشد فردی',
        level: 'مبتدی',
        emoji: '🌱',
    },
]

function CourseCard({ course }: { course: (typeof MOCK_COURSES)[0] }) {
    return (
        <Link href={`/courses/${course.slug}`} aria-label={`دوره: ${course.title}`}>
            <Card hover className="h-full flex flex-col">
                {/* Thumbnail */}
                <div
                    className="h-44 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 rounded-t-xl flex items-center justify-center text-7xl"
                    aria-hidden="true"
                >
                    {course.emoji}
                </div>
                <CardBody className="flex flex-col flex-1 gap-3">
                    {/* Category + Level */}
                    <div className="flex items-center gap-2">
                        <Badge variant="info">{course.category}</Badge>
                        <Badge variant="default">{course.level}</Badge>
                    </div>
                    {/* Title */}
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
                        {course.title}
                    </h3>
                    {/* Instructor */}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {course.instructor}
                    </p>
                    {/* Rating */}
                    <div
                        className="flex items-center gap-1 text-xs"
                        aria-label={`امتیاز: ${course.rating} از ۵`}
                    >
                        <span className="text-yellow-500" aria-hidden="true">★</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {course.rating}
                        </span>
                        <span className="text-gray-400">({course.ratingCount})</span>
                    </div>
                    {/* Lessons + Price */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            📚 {course.lessons} درس · ⏱ {course.duration}
                        </span>
                        <span className="font-bold text-primary-700 dark:text-primary-400 text-sm">
                            {course.price.toLocaleString('fa-IR')} تومان
                        </span>
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
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    )
}

export default function CoursesClient() {
    const [activeCategory, setActiveCategory] = useState('همه')
    const [loading] = useState(false)

    const filtered =
        activeCategory === 'همه'
            ? MOCK_COURSES
            : MOCK_COURSES.filter((c) => c.category === activeCategory)

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
            <div className="flex gap-2 flex-wrap mb-8" role="group" aria-label="فیلتر دسته‌بندی">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
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

            {/* Results count */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5" aria-live="polite">
                {filtered.length} دوره یافت شد
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))
                    : filtered.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
            </div>
        </div>
    )
}
