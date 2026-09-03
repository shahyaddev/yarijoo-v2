import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Accordion from '@/components/ui/Accordion'
import {
    IconArrowLeft,
    IconPlay,
    IconUsers,
    IconClock,
    IconBook,
    IconStar,
    IconCheck,
    IconInfo,
    IconMoney,
    IconCalendar,
} from '@/components/ui/Icon'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getCourse(slug: string): Promise<Course | null> {
    try {
        const res = await fetch(`${API}/courses/${slug}`, { cache: 'no-store' })
        if (res.status === 404) return null
        if (!res.ok) return null
        const json = await res.json() as { data?: Course }
        return json.data ?? null
    } catch { return null }
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return '—'
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

function groupLessons(lessons: Lesson[]) {
    if (lessons.length <= 6) return [{ id: 'all', title: 'سرفصل‌های دوره', lessons }]
    const groups: { id: string; title: string; lessons: Lesson[] }[] = []
    const chunkSize = 5
    for (let i = 0; i < lessons.length; i += chunkSize) {
        groups.push({
            id: `section-${i}`,
            title: `فصل ${Math.floor(i / chunkSize) + 1} — درس‌های ${i + 1} تا ${Math.min(i + chunkSize, lessons.length)}`,
            lessons: lessons.slice(i, i + chunkSize),
        })
    }
    return groups
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const course = await getCourse(slug)
    if (!course) return { title: 'دوره یافت نشد | یاری‌جو' }
    return {
        title: `${course.title} | یاری‌جو`,
        description: course.description ?? `دوره آموزشی ${course.title} در یاری‌جو`,
    }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const course = await getCourse(slug)
    if (!course) notFound()

    const price = course.salePrice != null && course.salePrice < course.price
        ? course.salePrice : course.price
    const discount = course.salePrice != null && course.salePrice < course.price
        ? Math.round(((course.price - course.salePrice) / course.price) * 100) : 0
    const enrollments = course._count?.enrollments ?? course.enrolledCount ?? 0
    const hasFreePreview = (course.lessons ?? []).some(l => l.isFree)
    const lessonGroups = groupLessons(course.lessons ?? [])

    const stats = [
        { Icon: IconUsers,    label: 'دانشجو',        value: enrollments.toLocaleString('fa-IR') },
        { Icon: IconClock,    label: 'مدت دوره',       value: formatDuration(course.duration) },
        { Icon: IconBook,     label: 'تعداد درس',      value: course.totalLessons.toLocaleString('fa-IR') },
        { Icon: IconStar,     label: 'امتیاز',          value: course.rating ? course.rating.toFixed(1) : '—' },
    ]

    const sideFeatures = [
        { text: `${course.totalLessons} درس ویدیویی` },
        ...(course.duration ? [{ text: `${formatDuration(course.duration)} آموزش` }] : []),
        { text: 'گواهینامه پایان دوره' },
        { text: 'دسترسی مادام‌العمر' },
        ...(hasFreePreview ? [{ text: 'پیش‌نمایش رایگان' }] : []),
    ]

    const curriculumItems = lessonGroups.map(group => ({
        id: group.id,
        title: `${group.title} (${group.lessons.length} درس)`,
        content: (
            <ul className="space-y-2 text-sm">
                {group.lessons.map(lesson => (
                    <li key={lesson.id} className="flex items-center gap-2.5 py-1">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                            style={{ background: lesson.isFree ? '#D1FAE5' : '#F3EDE3' }}>
                            {lesson.isFree
                                ? <IconPlay size={10} color="#065F46" />
                                : <IconInfo size={10} color="#9CA3AF" />}
                        </span>
                        <span className="flex-1" style={{ color: '#374151' }}>{lesson.title}</span>
                        {lesson.duration && (
                            <span className="text-xs shrink-0" style={{ color: '#9CA3AF' }}>
                                {formatLessonDuration(lesson.duration)}
                            </span>
                        )}
                        {lesson.isFree && (
                            <span className="text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full"
                                style={{ background: '#D1FAE5', color: '#065F46' }}>رایگان</span>
                        )}
                    </li>
                ))}
            </ul>
        ),
    }))

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            {/* Top bar */}
            <div style={{ background: '#1B4332' }}>
                <div className="max-w-5xl mx-auto px-5 py-4">
                    <nav className="flex items-center gap-2 text-sm" aria-label="breadcrumb">
                        <Link href="/courses"
                            className="flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity"
                            style={{ color: 'rgba(255,255,255,0.75)' }}>
                            <IconArrowLeft size={14} color="rgba(255,255,255,0.75)" />
                            دوره‌ها
                        </Link>
                        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
                        <span className="truncate max-w-[200px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{course.title}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-5 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

                    {/* ── Main content ── */}
                    <div className="space-y-6 order-2 lg:order-1">

                        {/* Thumbnail with badges */}
                        <div className="relative rounded-2xl overflow-hidden"
                            style={{ aspectRatio: '16/7', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', boxShadow: '0 4px 24px rgba(27,67,50,0.15)' }}>
                            {course.thumbnail
                                ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                        <IconPlay size={48} color="rgba(255,255,255,0.3)" />
                                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>دوره آموزشی یاری‌جو</p>
                                    </div>
                                )}
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)' }} />
                            {course.category?.name && (
                                <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full z-10"
                                    style={{ background: 'rgba(255,255,255,0.92)', color: '#1B4332', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                                    {course.category.name}
                                </span>
                            )}
                            {hasFreePreview && (
                                <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full z-10"
                                    style={{ background: '#065F46', color: 'white' }}>
                                    پیش‌نمایش رایگان
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-[28px] font-black leading-snug" style={{ color: '#1C1C1E' }}>
                            {course.title}
                        </h1>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {stats.map(({ Icon, label, value }) => (
                                <div key={label}
                                    className="flex items-center gap-2.5 p-3 rounded-xl"
                                    style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F3EDE3' }}>
                                        <Icon size={13} color="#1B4332" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] leading-none mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
                                        <p className="text-xs font-bold truncate" style={{ color: '#1C1C1E' }}>{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-px" style={{ background: '#EDE6D6' }} />

                        {/* Description */}
                        {course.description && (
                            <div>
                                <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1C1C1E' }}>
                                    <span className="w-1 h-4 rounded-full inline-block shrink-0" style={{ background: '#1B4332' }} />
                                    درباره این دوره
                                </h2>
                                <p className="text-sm leading-8" style={{ color: '#4B5563' }}>{course.description}</p>
                            </div>
                        )}

                        {/* Curriculum */}
                        {curriculumItems.length > 0 && (
                            <div>
                                <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1C1C1E' }}>
                                    <span className="w-1 h-4 rounded-full inline-block shrink-0" style={{ background: '#1B4332' }} />
                                    سرفصل‌های دوره
                                </h2>
                                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #EDE6D6' }}>
                                    <Accordion items={curriculumItems} allowMultiple />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <aside className="space-y-4 order-1 lg:order-2 lg:sticky lg:top-6">
                        <div className="rounded-2xl overflow-hidden"
                            style={{ background: 'white', border: '1px solid #E8E0D4', boxShadow: '0 2px 20px rgba(27,67,50,0.08)' }}>

                            {/* Price */}
                            <div className="px-5 py-4" style={{ borderBottom: '1px solid #F3EDE3' }}>
                                {discount > 0 ? (
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm line-through" style={{ color: '#9CA3AF' }}>
                                                {course.price.toLocaleString('fa-IR')} تومان
                                            </span>
                                            <span className="text-xs font-black px-2 py-0.5 rounded-lg text-white" style={{ background: '#DC2626' }}>
                                                {discount}٪ تخفیف
                                            </span>
                                        </div>
                                        <div className="text-[22px] font-black" style={{ color: '#1B4332' }}>
                                            {price === 0 ? 'رایگان' : `${price.toLocaleString('fa-IR')} تومان`}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[22px] font-black" style={{ color: '#1B4332' }}>
                                        {price === 0 ? 'رایگان' : `${price.toLocaleString('fa-IR')} تومان`}
                                    </div>
                                )}
                                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                                    دسترسی مادام‌العمر · گواهینامه پایان دوره
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="p-4 space-y-2.5">
                                <Link href={`/courses/${course.slug}/learn`}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                                    style={{ background: '#1B4332' }}>
                                    <IconPlay size={15} color="white" />
                                    {price === 0 ? 'شروع یادگیری' : 'ثبت‌نام در دوره'}
                                </Link>
                                {price > 0 && (
                                    <Link href={`/checkout?course=${course.slug}`}
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm border-2 transition-colors hover:opacity-80"
                                        style={{ borderColor: '#1B4332', color: '#1B4332', background: 'transparent' }}>
                                        <IconMoney size={15} color="#1B4332" />
                                        خرید دوره
                                    </Link>
                                )}
                            </div>

                            {/* Feature list */}
                            <div className="px-5 pb-4 space-y-2" style={{ borderTop: '1px solid #F3EDE3', paddingTop: 12 }}>
                                {sideFeatures.map(({ text }) => (
                                    <div key={text} className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                                        <span className="w-4 h-4 rounded-md flex items-center justify-center shrink-0" style={{ background: '#D1FAE5' }}>
                                            <IconCheck size={10} color="#065F46" strokeWidth={3} />
                                        </span>
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Calendar hint */}
                        <div className="rounded-2xl p-4 flex items-start gap-3"
                            style={{ background: '#F0FDF4', border: '1px solid #A7F3D0' }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#D1FAE5' }}>
                                <IconCalendar size={15} color="#065F46" />
                            </div>
                            <div>
                                <p className="font-bold text-sm" style={{ color: '#065F46' }}>دسترسی فوری</p>
                                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#047857' }}>
                                    بلافاصله پس از ثبت‌نام به تمام درس‌ها دسترسی خواهید داشت.
                                </p>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    )
}
