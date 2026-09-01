'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

interface Option { value: string; label: string; score: number }
interface Question { id: string; text: string; order: number; options: Option[] }
interface Test { id: string; slug: string; title: string; category: string; description: string | null; duration: number | null; questions: Question[] }

const DEFAULT_OPTIONS = [
    { value: '0', label: 'اصلاً', score: 0 },
    { value: '1', label: 'کمی', score: 1 },
    { value: '2', label: 'متوسط', score: 2 },
    { value: '3', label: 'زیاد', score: 3 },
    { value: '4', label: 'خیلی زیاد', score: 4 },
]

export default function TestPage() {
    const params = useParams()
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const slug = params.slug as string

    const [test, setTest] = useState<Test | null>(null)
    const [loading, setLoading] = useState(true)
    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [started, setStarted] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get(`/tests/${slug}`)
            .then(r => setTest((r.data as any)?.data))
            .catch(() => setError('تست یافت نشد'))
            .finally(() => setLoading(false))
    }, [slug])

    const startTest = async () => {
        if (!isAuthenticated) {
            router.push(`/auth/login?redirect=/tests/${slug}`)
            return
        }
        try {
            const res = await api.post(`/tests/${test!.id}/start`)
            const id = (res.data as any)?.data?.id
            setAttemptId(id)
            setStarted(true)
        } catch { setError('خطا در شروع تست') }
    }

    const handleAnswer = async (questionId: string, score: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: score }))

        if (attemptId) {
            try {
                await api.patch(`/tests/attempts/${attemptId}`, {
                    answers: { ...answers, [questionId]: score }
                })
            } catch { }
        }

        if (currentIndex < (test?.questions?.length ?? 0) - 1) {
            setCurrentIndex(i => i + 1)
        }
    }

    const submitTest = async () => {
        if (!attemptId || !test) return
        setSubmitting(true)
        try {
            await api.post(`/tests/attempts/${attemptId}/complete`, { answers })
            router.push(`/tests/${slug}/result/${attemptId}`)
        } catch { setError('خطا در ارسال پاسخ‌ها') }
        finally { setSubmitting(false) }
    }

    if (loading) return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1B4332', borderTopColor: 'transparent' }} />
        </div>
    )

    if (error || !test) return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex flex-col items-center justify-center gap-4">
            <div className="text-5xl">🧠</div>
            <p style={{ color: '#8C8C8E' }}>{error || 'تست یافت نشد'}</p>
            <Link href="/tests" className="px-6 py-2.5 rounded-xl text-white font-bold" style={{ background: '#1B4332' }}>بازگشت</Link>
        </div>
    )

    const questions = test.questions ?? []
    const currentQ = questions[currentIndex]
    const progress = questions.length > 0 ? Math.round(((currentIndex) / questions.length) * 100) : 0
    const isLast = currentIndex === questions.length - 1
    const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined)

    // Intro screen
    if (!started) {
        return (
            <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center px-5">
                <div className="max-w-lg w-full">
                    <Link href="/tests" className="inline-flex items-center gap-2 text-sm font-semibold mb-8 hover:opacity-70"
                        style={{ color: '#1B4332' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                        بازگشت
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border p-8 text-center" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5"
                            style={{ background: '#E8F5E9' }}>🧠</div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block"
                            style={{ background: '#F3EDE3', color: '#8C8C8E' }}>{test.category}</span>
                        <h1 className="text-xl font-black mb-3" style={{ color: '#1C1C1E' }}>{test.title}</h1>
                        {test.description && (
                            <p className="text-sm leading-relaxed mb-5" style={{ color: '#5C5C5E' }}>
                                {test.description.replace(/<[^>]*>/g, '').slice(0, 200)}
                            </p>
                        )}
                        <div className="flex items-center justify-center gap-6 mb-6 text-sm" style={{ color: '#8C8C8E' }}>
                            {questions.length > 0 && <span>❓ {questions.length} سوال</span>}
                            {test.duration && <span>⏱ {test.duration} دقیقه</span>}
                            <span className="font-semibold px-2 py-0.5 rounded-full" style={{ background: '#E8F5E9', color: '#1B4332' }}>رایگان</span>
                        </div>
                        <button onClick={startTest}
                            className="w-full py-3.5 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                            style={{ background: '#1B4332' }}>
                            شروع تست
                        </button>
                        {!isAuthenticated && (
                            <p className="text-xs mt-3" style={{ color: '#8C8C8E' }}>برای ذخیره نتایج، ابتدا وارد شوید</p>
                        )}
                    </motion.div>
                </div>
            </div>
        )
    }

    // No questions
    if (questions.length === 0) {
        return (
            <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex flex-col items-center justify-center gap-4 px-5">
                <div className="text-5xl">🔧</div>
                <p className="text-center" style={{ color: '#5C5C5E' }}>سوالات این تست هنوز بارگذاری نشده‌اند</p>
                <Link href="/tests" className="px-6 py-2.5 rounded-xl text-white font-bold" style={{ background: '#1B4332' }}>بازگشت</Link>
            </div>
        )
    }

    const opts = currentQ?.options?.length > 0 ? currentQ.options : DEFAULT_OPTIONS

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            {/* Progress bar */}
            <div style={{ height: '4px', background: '#EDE6D6', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ height: '100%', background: '#1B4332', width: `${progress}%`, transition: 'width .3s ease' }} />
            </div>

            <div className="max-w-2xl mx-auto px-5 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-black text-base truncate" style={{ color: '#1C1C1E' }}>{test.title}</h1>
                    <span className="text-sm font-semibold flex-shrink-0" style={{ color: '#8C8C8E' }}>
                        {(currentIndex + 1).toLocaleString('fa-IR')} / {questions.length.toLocaleString('fa-IR')}
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-2xl border p-6 mb-6" style={{ background: 'white', borderColor: '#EDE6D6' }}>

                        <p className="text-[16px] font-semibold leading-relaxed mb-6" style={{ color: '#1C1C1E' }}>
                            {currentQ?.text}
                        </p>

                        <div className="space-y-3">
                            {opts.map(opt => {
                                const selected = answers[currentQ?.id] === opt.score
                                return (
                                    <button key={opt.value}
                                        onClick={() => handleAnswer(currentQ.id, opt.score)}
                                        className="w-full text-right px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm hover:-translate-y-0.5"
                                        style={{
                                            borderColor: selected ? '#1B4332' : '#EDE6D6',
                                            background: selected ? '#E8F5E9' : 'white',
                                            color: selected ? '#1B4332' : '#1C1C1E',
                                        }}>
                                        {opt.label}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3">
                    <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}
                        className="px-5 py-2.5 rounded-xl font-semibold border-2 disabled:opacity-30 transition-colors hover:bg-[#F3EDE3]"
                        style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>
                        قبلی
                    </button>

                    {isLast && allAnswered ? (
                        <button onClick={submitTest} disabled={submitting}
                            className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                            style={{ background: '#1B4332' }}>
                            {submitting ? 'در حال ارسال...' : 'مشاهده نتیجه'}
                        </button>
                    ) : (
                        <button onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                            disabled={currentIndex === questions.length - 1}
                            className="flex-1 py-2.5 rounded-xl font-semibold border-2 disabled:opacity-30 transition-colors hover:bg-[#F3EDE3]"
                            style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>
                            بعدی
                        </button>
                    )}
                </div>

                {error && <p className="text-center mt-4 text-sm font-semibold" style={{ color: '#C62828' }}>⚠️ {error}</p>}

                {/* Answered count */}
                <p className="text-center mt-4 text-xs" style={{ color: '#8C8C8E' }}>
                    {Object.keys(answers).length.toLocaleString('fa-IR')} از {questions.length.toLocaleString('fa-IR')} سوال پاسخ داده شده
                </p>
            </div>
        </div>
    )
}
