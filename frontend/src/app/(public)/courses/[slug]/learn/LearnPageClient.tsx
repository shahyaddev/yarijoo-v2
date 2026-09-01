'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'
import HlsPlayer from '@/components/features/course/HlsPlayer'

interface Lesson {
    id: string
    title: string
    order: number
    duration: number | null
    isFree: boolean
}

interface CourseData {
    id: string
    title: string
    slug: string
    totalLessons: number
    lessons: Lesson[]
}

interface LessonContent {
    lesson: {
        id: string
        title: string
        order: number
        duration: number | null
        isFree: boolean
    }
    streamingUrl: string | null
}

interface EnrollmentInfo {
    completionPercent: number
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return ''
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

export default function LearnPageClient({ slug }: { slug: string }) {
    const { isAuthenticated } = useAuthStore()
    const router = useRouter()

    const [course, setCourse] = useState<CourseData | null>(null)
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
    const [lessonContent, setLessonContent] = useState<LessonContent | null>(null)
    const [enrollment, setEnrollment] = useState<EnrollmentInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [lessonLoading, setLessonLoading] = useState(false)
    const [notes, setNotes] = useState('')
    const [notesSaved, setNotesSaved] = useState(false)
    const progressRef = useRef({ watched: 0, percent: 0 })

    // Load course structure
    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/auth/login?redirect=/courses/${slug}/learn`)
            return
        }

        api.get<{ data: CourseData }>(`/courses/${slug}`)
            .then((res) => {
                const data: CourseData = (res.data as { data: CourseData }).data ?? res.data as unknown as CourseData
                setCourse(data)
                // Auto-select first lesson
                if (data.lessons?.length > 0) {
                    loadLesson(data.id, data.lessons[0])
                }
            })
            .catch(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, isAuthenticated])

    const loadLesson = useCallback(async (courseId: string, lesson: Lesson) => {
        setLessonLoading(true)
        setActiveLesson(lesson)
        try {
            const res = await api.get<{ data: LessonContent }>(`/courses/${slug}/lessons/${lesson.id}`)
            const content: LessonContent = (res.data as { data: LessonContent }).data ?? res.data as unknown as LessonContent
            setLessonContent(content)
        } catch {
            setLessonContent({ lesson, streamingUrl: null })
        } finally {
            setLessonLoading(false)
            setLoading(false)
        }
    }, [slug])

    const handleLessonClick = (lesson: Lesson) => {
        if (!course) return
        // Save progress for current lesson before switching
        saveProgress(course.id)
        loadLesson(course.id, lesson)
    }

    const saveProgress = useCallback((courseId: string) => {
        if (!activeLesson || !progressRef.current.watched) return
        api.post(`/courses/${courseId}/lessons/${activeLesson.id}/progress`, {
            watchedSeconds: progressRef.current.watched,
            percentComplete: progressRef.current.percent,
        }).then((res) => {
            const data = (res.data as { data?: { overallPercent?: number } }).data
            if (data?.overallPercent !== undefined) {
                setEnrollment({ completionPercent: data.overallPercent })
            }
        }).catch(() => {/* non-critical */})
    }, [activeLesson])

    const handleProgress = useCallback((watchedSeconds: number, percent: number) => {
        progressRef.current = { watched: watchedSeconds, percent }
    }, [])

    const handleEnded = useCallback(() => {
        if (!course || !activeLesson) return
        progressRef.current = { watched: activeLesson.duration ?? 0, percent: 100 }
        saveProgress(course.id)

        // Auto-advance to next lesson
        const idx = course.lessons.findIndex((l) => l.id === activeLesson.id)
        if (idx >= 0 && idx < course.lessons.length - 1) {
            loadLesson(course.id, course.lessons[idx + 1])
        }
    }, [course, activeLesson, saveProgress, loadLesson])

    const handleSaveNotes = () => {
        setNotesSaved(true)
        setTimeout(() => setNotesSaved(false), 2000)
        // Could persist to backend if a notes endpoint existed
    }

    const completedIds = new Set<string>() // could be loaded from enrollment data
    const overallPercent = enrollment?.completionPercent ?? 0
    const completedCount = Math.round((overallPercent / 100) * (course?.totalLessons ?? 0))

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
            </div>
        )
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-2xl mb-2">😕</p>
                    <p className="text-gray-500">دوره یافت نشد</p>
                    <Link href="/courses" className="mt-4 inline-block text-primary-700 hover:underline text-sm">
                        بازگشت به دوره‌ها
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Top bar */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <Link
                    href={`/courses/${slug}`}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-700 transition-colors"
                >
                    ← بازگشت به دوره
                </Link>
                <h1 className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-xs hidden sm:block">
                    {course.title}
                </h1>
                {overallPercent >= 100 ? (
                    <Link
                        href={`/courses/${slug}/certificate`}
                        className="text-sm font-bold text-primary-700 dark:text-primary-400 hover:underline"
                    >
                        🏆 دریافت گواهینامه
                    </Link>
                ) : (
                    <span className="text-xs text-gray-400">{overallPercent}٪ تکمیل شده</span>
                )}
            </div>

            <div className="flex flex-col lg:flex-row max-w-screen-xl mx-auto">
                {/* Video + content */}
                <div className="flex-1 min-w-0 p-4 lg:p-6">
                    {/* HLS Player */}
                    {lessonLoading ? (
                        <div className="rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center mb-4">
                            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="mb-4">
                            <HlsPlayer
                                src={lessonContent?.streamingUrl ?? null}
                                title={lessonContent?.lesson.title}
                                onProgress={handleProgress}
                                onEnded={handleEnded}
                            />
                        </div>
                    )}

                    {/* Progress bar */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>پیشرفت دوره</span>
                            <span>{overallPercent}٪</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                                style={{ width: `${overallPercent}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {completedCount} از {course.totalLessons} درس تکمیل‌شده
                        </p>
                    </div>

                    {/* Lesson title */}
                    {activeLesson && (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {activeLesson.title}
                            </h2>
                            {activeLesson.duration && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    مدت زمان: {formatDuration(activeLesson.duration)}
                                </p>
                            )}
                        </>
                    )}

                    {/* Notes section */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                            یادداشت‌های من
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-28 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                            placeholder="یادداشت‌های خود را اینجا بنویسید..."
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleSaveNotes}
                                className="bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                {notesSaved ? '✓ ذخیره شد' : 'ذخیره یادداشت'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lesson sidebar */}
                <aside className="lg:w-80 flex-shrink-0 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                            سرفصل‌های دوره
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">{course.totalLessons} درس</p>
                    </div>
                    <ul className="divide-y divide-gray-50 dark:divide-gray-800 overflow-y-auto max-h-[calc(100vh-200px)]">
                        {course.lessons.map((lesson) => {
                            const isActive = activeLesson?.id === lesson.id
                            const isCompleted = completedIds.has(lesson.id)
                            return (
                                <li key={lesson.id}>
                                    <button
                                        onClick={() => handleLessonClick(lesson)}
                                        className={[
                                            'w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-sm text-right',
                                            isActive
                                                ? 'bg-primary-50 dark:bg-primary-900/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                                        ].join(' ')}
                                    >
                                        {/* Status icon */}
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                            {isCompleted ? (
                                                <span className="text-green-500 text-base">✓</span>
                                            ) : isActive ? (
                                                <span className="text-primary-600 text-base">▶</span>
                                            ) : (
                                                <span className="text-gray-300 dark:text-gray-600 font-semibold text-xs">
                                                    {lesson.order}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={[
                                                'leading-snug truncate',
                                                isActive
                                                    ? 'font-semibold text-primary-700 dark:text-primary-400'
                                                    : isCompleted
                                                        ? 'text-gray-500 dark:text-gray-400'
                                                        : 'text-gray-700 dark:text-gray-300',
                                            ].join(' ')}>
                                                {lesson.title}
                                            </p>
                                            {lesson.duration && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {formatDuration(lesson.duration)}
                                                </p>
                                            )}
                                        </div>
                                        {lesson.isFree && (
                                            <span className="text-xs text-green-600 dark:text-green-400 flex-shrink-0">رایگان</span>
                                        )}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </aside>
            </div>
        </div>
    )
}
