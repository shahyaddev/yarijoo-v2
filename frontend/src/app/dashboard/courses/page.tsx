'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { IconPlay, IconBook, IconClock, IconCheck, IconUsers } from '@/components/ui/Icon'

interface Enrollment {
    id: string
    status: string
    progress: number
    enrolledAt: string
    completedAt: string | null
    course: {
        id: string
        slug: string
        title: string
        thumbnail: string | null
        duration: number | null
        totalLessons: number
        category?: { name: string } | null
    }
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return '—'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h} ساعت${m > 0 ? ` و ${m} دقیقه` : ''}`
    return `${m} دقیقه`
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVE:    { label: 'در حال یادگیری', color: '#1B4332', bg: '#E8F5E9' },
    COMPLETED: { label: 'تکمیل شده',       color: '#065F46', bg: '#D1FAE5' },
    EXPIRED:   { label: 'منقضی شده',       color: '#C62828', bg: '#FCE4EC' },
    PENDING:   { label: 'در انتظار',        color: '#C9A84C', bg: '#FFF8E1' },
}

export default function CoursesPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

    useEffect(() => {
        api.get('/courses/my-enrollments?limit=100')
            .then(r => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = (r.data as any)?.data?.enrollments ?? (r.data as any)?.data ?? []
                setEnrollments(Array.isArray(data) ? data : [])
            })
            .catch(() => setEnrollments([]))
            .finally(() => setLoading(false))
    }, [])

    const filtered = enrollments.filter(e => {
        if (filter === 'active') return e.status === 'ACTIVE'
        if (filter === 'completed') return e.status === 'COMPLETED'
        return true
    })

    const completed = enrollments.filter(e => e.status === 'COMPLETED').length
    const active    = enrollments.filter(e => e.status === 'ACTIVE').length

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>دوره‌های من</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#8C8C8E' }}>
                        دوره‌هایی که ثبت‌نام کرده‌اید
                    </p>
                </div>
                <Link href="/courses"
                    className="text-sm font-bold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                    style={{ background: '#1B4332' }}>
                    + دوره جدید
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'کل دوره‌ها',       value: enrollments.length, icon: <IconBook size={18} color="#1B4332" />,  bg: '#E8F5E9' },
                    { label: 'در حال یادگیری',   value: active,             icon: <IconPlay size={18} color="#1565C0" />,  bg: '#E3F2FD' },
                    { label: 'تکمیل شده',         value: completed,          icon: <IconCheck size={18} color="#065F46" />, bg: '#D1FAE5' },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4 border text-center"
                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                            style={{ background: s.bg }}>
                            {s.icon}
                        </div>
                        <div className="text-2xl font-black mb-0.5" style={{ color: '#1C1C1E' }}>
                            {s.value.toLocaleString('fa-IR')}
                        </div>
                        <div className="text-xs" style={{ color: '#8C8C8E' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-5">
                {([['all', 'همه'], ['active', 'در حال یادگیری'], ['completed', 'تکمیل شده']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setFilter(val)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{
                            background: filter === val ? '#1B4332' : 'white',
                            color: filter === val ? 'white' : '#5C5C5E',
                            border: `1px solid ${filter === val ? '#1B4332' : '#EDE6D6'}`,
                        }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: '#E8F5E9' }}>
                        <IconBook size={28} color="#1B4332" />
                    </div>
                    <p className="font-semibold mb-1" style={{ color: '#1C1C1E' }}>
                        {filter === 'all' ? 'هنوز در دوره‌ای ثبت‌نام نکرده‌اید' : 'دوره‌ای در این بخش ندارید'}
                    </p>
                    <p className="text-sm mb-6" style={{ color: '#8C8C8E' }}>
                        از کتابخانه دوره‌های یاری‌جو یادگیری را شروع کنید
                    </p>
                    <Link href="/courses"
                        className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: '#1B4332' }}>
                        مشاهده دوره‌ها
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(e => {
                        const s = STATUS_MAP[e.status] ?? { label: e.status, color: '#8C8C8E', bg: '#F3EDE3' }
                        const pct = Math.min(100, Math.round(e.progress ?? 0))
                        return (
                            <div key={e.id} className="rounded-2xl border overflow-hidden"
                                style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <div className="flex items-center gap-4 p-4">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)' }}>
                                        {e.course.thumbnail
                                            ? <img src={e.course.thumbnail} alt={e.course.title} className="w-full h-full object-cover" />
                                            : <IconPlay size={20} color="rgba(255,255,255,0.5)" />}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-sm line-clamp-1" style={{ color: '#1C1C1E' }}>
                                                {e.course.title}
                                            </h3>
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                                                style={{ background: s.bg, color: s.color }}>
                                                {s.label}
                                            </span>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: '#8C8C8E' }}>
                                            {e.course.category?.name && (
                                                <span>{e.course.category.name}</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <IconBook size={11} color="#8C8C8E" />
                                                {e.course.totalLessons.toLocaleString('fa-IR')} درس
                                            </span>
                                            {e.course.duration && (
                                                <span className="flex items-center gap-1">
                                                    <IconClock size={11} color="#8C8C8E" />
                                                    {formatDuration(e.course.duration)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-2.5">
                                            <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: '#8C8C8E' }}>
                                                <span>پیشرفت</span>
                                                <span className="font-semibold" style={{ color: pct === 100 ? '#065F46' : '#1B4332' }}>
                                                    {pct.toLocaleString('fa-IR')}٪
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#F3EDE3' }}>
                                                <div className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: pct === 100
                                                            ? 'linear-gradient(90deg,#065F46,#059669)'
                                                            : 'linear-gradient(90deg,#1B4332,#2D6A4F)',
                                                    }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <Link href={`/courses/${e.course.slug}/learn`}
                                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
                                        style={{ background: '#1B4332' }}>
                                        <IconPlay size={12} color="white" />
                                        {pct === 0 ? 'شروع' : pct === 100 ? 'مرور' : 'ادامه'}
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
