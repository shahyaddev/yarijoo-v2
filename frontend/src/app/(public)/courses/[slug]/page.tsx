import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Accordion from '@/components/ui/Accordion'
import { Badge } from '@/components/ui'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

// ─── Types ─────────────────────────────────────────────────────────────────

interface Lesson {
    id: string
    title: string
    order: number
    duration: number | null
    isFree: boolean
}

interface Course {
    id: string
    slug: string
    title: string
    description: string | null
    price: number
    salePrice: number | null
    thumbnail: string | null
    duration: number | null
    totalLessons: number
    enrolledCount: number
    rating: number | null
    status: string
    instructorId: string
    category?: { id: string; name: string } | null
    lessons: Lesson[]
    _count?: { enrollments: number }
}

// ─── Data fetch ─────────────────────────────────────────────────────────────

async function getCourse(slug: string): Promise<Course | null> {
    try {
        const res = await fetch(`${API}/courses/${slug}`, { cache: 'no-store' })
        if (res.status === 404) return null
        if (!res.ok) return null
        const json = await res.json() as { data?: Course }
        return json.data ?? null
    } catch {
        return null
    }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const course = await getCourse(slug)
    if (!course) return { title: 'دوره یافت نشد | یاری‌جو' }
    return {
        title: `${course.title} | یاری‌جو`,
        description: course.description ?? `دوره آموزشی ${course.title} در یاری‌جو`,
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
    if (!seconds) return ''
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0 && m > 0) return `${h} ساعت و ${m} دقیقه`
    if (h > 0) return `${h} ساعت`
    return `${m} دقیقه`
}

function formatLessonDuration(seconds: number | null): string {
    if (!seconds) return ''
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

// Group lessons into sections of ~4 each (or use a single section if few)
function groupLessons(lessons: Lesson[]) {
    if (lessons.length <= 6) {
        return [{ id: 'all', title: 'سرفصل‌های دوره', lessons }]
    }
    const groups: { id: string; title: string; lessons: Lesson[] }[] = []
    const chunkSize = 5
    for (let i = 0; i < lessons.length; i += chunkSize) {
        const chunk = lessons.slice(i, i + chunkSize)
        groups.push({
            id: `section-${i}`,
            title: `فصل ${Math.floor(i / chunkSize) + 1}: درس‌های ${i + 1} تا ${Math.min(i + chunkSize, lessons.length)}`,
            lessons: chunk,
        })
    }
    return groups
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const course = await getCourse(slug)

    if (!course) notFound()

    const price = course.salePrice != null && course.salePrice < course.price
        ? course.salePrice
        : course.price

    const enrollments = course._count?.enrollments ?? course.enrolledCount ?? 0
    const lessonGroups = groupLessons(course.lessons ?? [])

    const curriculumItems = lessonGroups.map((group) => ({
        id: group.id,
        title: `${group.title} (${group.lessons.length} درس)`,
        content: (
            <ul className="space-y-2 text-sm">
                {group.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center gap-2">
                        <span className={lesson.isFree ? 'text-green-500' : 'text-primary-500'}>
                            {lesson.isFree ? '▶' : '🔒'}
                        </span>
                        <span className="flex-1">{lesson.title}</span>
                        {lesson.duration && (
                            <span className="text-gray-400 text-xs flex-shrink-0">
                                {formatLessonDuration(lesson.duration)}
                            </span>
                        )}
                        {lesson.isFree && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex-shrink-0 font-medium">
                                رایگان
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        ),
    }))

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* ── Main content ── */}
                <div className="flex-1 min-w-0">
                    {/* Hero thumbnail / gradient */}
                    <div className="relative rounded-2xl overflow-hidden mb-8 h-72 flex items-center justify-center"
                        style={{
                            background: course.thumbnail
                                ? undefined
                                : 'linear-gradient(135deg, #1B4332, #2D6A4F)',
                        }}
                    >
                        {course.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center text-white z-10 px-6">
                                <div className="text-7xl mb-4">🎓</div>
                                <p className="text-primary-100 text-sm">دوره آموزشی یاری‌جو</p>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                        {/* Free preview badge */}
                        {(course.lessons ?? []).some((l) => l.isFree) && (
                            <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                پیش‌نمایش رایگان
                            </div>
                        )}
                    </div>

                    {/* Title + badges */}
                    <div className="mb-6">
                        <div className="flex gap-2 mb-3 flex-wrap">
                            {course.category?.name && <Badge variant="info">{course.category.name}</Badge>}
                            <Badge variant="default">{course.totalLessons} درس</Badge>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            {course.title}
                        </h1>
                        {course.description && (
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {course.description}
                            </p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            {
                                label: 'دانشجو',
                                value: enrollments.toLocaleString('fa-IR'),
                                icon: '👥',
                            },
                            {
                                label: 'ساعت آموزش',
                                value: formatDuration(course.duration) || '—',
                                icon: '⏱',
                            },
                            {
                                label: 'درس',
                                value: course.totalLessons.toLocaleString('fa-IR'),
                                icon: '📚',
                            },
                            {
                                label: 'امتیاز',
                                value: course.rating ? course.rating.toFixed(1) : '—',
                                icon: '⭐',
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center"
                            >
                                <div className="text-2xl mb-1">{stat.icon}</div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Curriculum */}
                    {curriculumItems.length > 0 && (
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-xl">
                                سرفصل‌های دوره
                            </h2>
                            <Accordion items={curriculumItems} allowMultiple />
                        </div>
                    )}
                </div>

                {/* ── Sticky sidebar ── */}
                <aside className="lg:w-80 flex-shrink-0">
                    <div className="sticky top-24">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-lg">
                            {/* Price */}
                            <div className="mb-1">
                                {price === 0 ? (
                                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        رایگان
                                    </span>
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {price.toLocaleString('fa-IR')}
                                        </span>
                                        <span className="text-base font-normal text-gray-500">تومان</span>
                                        {course.salePrice != null && course.salePrice < course.price && (
                                            <span className="text-sm text-gray-400 line-through">
                                                {course.price.toLocaleString('fa-IR')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                دسترسی مادام‌العمر · گواهینامه پایان دوره
                            </p>

                            {/* CTAs */}
                            <Link
                                href={`/courses/${course.slug}/learn`}
                                className="block w-full text-center bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors mb-3"
                            >
                                {price === 0 ? '▶ شروع یادگیری' : 'ثبت‌نام در دوره'}
                            </Link>
                            {price > 0 && (
                                <Link
                                    href={`/checkout?course=${course.slug}`}
                                    className="block w-full text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-colors"
                                >
                                    خرید دوره
                                </Link>
                            )}

                            {/* Feature list */}
                            <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    {course.totalLessons} درس ویدیویی
                                </li>
                                {course.duration && (
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        {formatDuration(course.duration)} آموزش
                                    </li>
                                )}
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    گواهینامه پایان دوره
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    دسترسی مادام‌العمر
                                </li>
                                {(course.lessons ?? []).some((l) => l.isFree) && (
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        پیش‌نمایش رایگان
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
