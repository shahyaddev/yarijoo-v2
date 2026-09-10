'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Interpretation {
    interpretationText: string
    severity: string | null
    scoreRangeMin: number
    scoreRangeMax: number
}

interface AiRecommendations {
    summary?: string
    strengths?: string[]
    concerns?: string[]
    recommendations?: string[]
    generatedAt?: string
}

interface Attempt {
    id: string
    status: string
    score: { total?: number; subscales?: Record<string, number> } | null
    aiRecommendations: AiRecommendations | null
    aiGeneratedCount: number
    createdAt: string
    completedAt: string | null
    test: {
        id: string
        slug: string
        title: string
        category: string
        interpretations?: Interpretation[]
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    low:      { bg: '#D1FAE5', text: '#065F46', dot: '#059669', label: 'طبیعی' },
    medium:   { bg: '#FEF9C3', text: '#854D0E', dot: '#CA8A04', label: 'متوسط' },
    high:     { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626', label: 'نیاز به توجه' },
    critical: { bg: '#FEE2E2', text: '#7F1D1D', dot: '#B91C1C', label: 'حیاتی' },
}

function getInterpretation(attempt: Attempt): Interpretation | null {
    if (!attempt.score?.total && attempt.score?.total !== 0) return null
    const total = attempt.score.total
    return attempt.test.interpretations?.find(
        i => total >= i.scoreRangeMin && total <= i.scoreRangeMax
    ) ?? null
}

// ─── Icon components ─────────────────────────────────────────────────────────

function IcoBrain({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        </svg>
    )
}
function IcoCheck({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
function IcoAlert({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
    )
}
function IcoSparkle({ size = 16, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
    )
}
function IcoArrowRight({ size = 13, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    )
}
function IcoRefresh({ size = 13, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
        </svg>
    )
}
function IcoChevron({ size = 14, color = 'currentColor', up = false }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: up ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    )
}
function IcoClock({ size = 13, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

// ─── Category icon ────────────────────────────────────────────────────────────

function CategoryIcon({ category, size = 18 }: { category: string; size?: number }) {
    const c = '#1B4332'
    if (category?.includes('اضطراب'))
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
    if (category?.includes('افسردگی'))
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 15s1.5-2 4-2 4 2 4 2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
    if (category?.includes('استرس'))
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
    if (category?.includes('شخصیت'))
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    return <IcoBrain size={size} color={c} />
}

// ─── AI Insight Panel ─────────────────────────────────────────────────────────

function AiInsightPanel({ attempt, onGenerated }: {
    attempt: Attempt
    onGenerated: (id: string, result: AiRecommendations) => void
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const ai = attempt.aiRecommendations

    const generate = async () => {
        setLoading(true); setError('')
        try {
            const res = await api.post<AiRecommendations>(`/tests/attempts/${attempt.id}/ai-insight`)
            const data = (res.data as { data?: AiRecommendations }).data ?? res.data as unknown as AiRecommendations
            onGenerated(attempt.id, data)
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در تولید تحلیل')
        } finally { setLoading(false) }
    }

    if (ai?.summary) {
        return (
            <div className="rounded-2xl border p-4 space-y-3" style={{ background: '#F0FDF4', borderColor: '#A7F3D0' }}>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#D1FAE5' }}>
                        <IcoSparkle size={15} color="#065F46" />
                    </div>
                    <h4 className="font-bold text-sm" style={{ color: '#065F46' }}>تحلیل هوش مصنوعی</h4>
                    {ai.generatedAt && (
                        <span className="text-xs mr-auto" style={{ color: '#8C8C8E' }}>
                            {new Date(ai.generatedAt).toLocaleDateString('fa-IR')}
                        </span>
                    )}
                </div>

                <p className="text-sm leading-7" style={{ color: '#1B4332' }}>{ai.summary}</p>

                {ai.strengths && ai.strengths.length > 0 && (
                    <div>
                        <p className="text-xs font-bold mb-2" style={{ color: '#065F46' }}>نقاط قوت</p>
                        <div className="space-y-1.5">
                            {ai.strengths.map((s, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#1B4332' }}>
                                    <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#D1FAE5' }}>
                                        <IcoCheck size={10} color="#065F46" />
                                    </span>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {ai.concerns && ai.concerns.length > 0 && (
                    <div>
                        <p className="text-xs font-bold mb-2" style={{ color: '#C9A84C' }}>نگرانی‌ها</p>
                        <div className="space-y-1.5">
                            {ai.concerns.map((c, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#5C5C5E' }}>
                                    <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FEF9C3' }}>
                                        <IcoAlert size={10} color="#CA8A04" />
                                    </span>
                                    {c}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {ai.recommendations && ai.recommendations.length > 0 && (
                    <div>
                        <p className="text-xs font-bold mb-2" style={{ color: '#065F46' }}>توصیه‌ها</p>
                        <div className="space-y-1.5">
                            {ai.recommendations.map((r, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#5C5C5E' }}>
                                    <span className="mt-1 shrink-0"><IcoArrowRight size={11} color="#1B4332" /></span>
                                    {r}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(attempt.aiGeneratedCount ?? 0) < 3 && (
                    <button onClick={generate} disabled={loading}
                        className="flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 transition-opacity hover:opacity-70"
                        style={{ color: '#065F46' }}>
                        <IcoRefresh size={12} color="#065F46" />
                        {loading ? 'در حال بازسازی...' : 'بازسازی تحلیل'}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="rounded-2xl border p-4" style={{ background: '#FDFBF8', borderColor: '#EDE6D6' }}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#E8F5E9' }}>
                        <IcoSparkle size={17} color="#1B4332" />
                    </div>
                    <div>
                        <p className="text-sm font-bold" style={{ color: '#1C1C1E' }}>تحلیل هوش مصنوعی</p>
                        <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>تفسیر شخصی‌سازی‌شده</p>
                    </div>
                </div>
                <button onClick={generate} disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 shrink-0 transition-opacity hover:opacity-90"
                    style={{ background: '#1B4332' }}>
                    {loading
                        ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> تحلیل...</>
                        : <><IcoSparkle size={14} color="white" /> دریافت تحلیل</>}
                </button>
            </div>
            {error && (
                <div className="flex items-center gap-2 mt-3 text-xs font-semibold" style={{ color: '#C62828' }}>
                    <IcoAlert size={13} color="#C62828" />{error}
                </div>
            )}
        </div>
    )
}

// ─── Test Card ────────────────────────────────────────────────────────────────

function TestCard({ attempt, onAiGenerated }: {
    attempt: Attempt
    onAiGenerated: (id: string, result: AiRecommendations) => void
}) {
    const [expanded, setExpanded] = useState(false)
    const isCompleted = attempt.status === 'completed' || attempt.status === 'COMPLETED'
    const score = attempt.score?.total
    const interp = isCompleted ? getInterpretation(attempt) : null
    const sev = interp?.severity ? SEVERITY_CONFIG[interp.severity] ?? SEVERITY_CONFIG.low : null

    return (
        <div className="rounded-2xl border overflow-hidden transition-shadow hover:shadow-md"
            style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 1px 6px rgba(27,67,50,0.05)' }}>

            {/* Header */}
            <div className="flex items-center gap-3.5 p-4">
                {/* Category icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: isCompleted ? '#E8F5E9' : '#FEF9C3' }}>
                    <CategoryIcon category={attempt.test?.category} size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-snug line-clamp-1" style={{ color: '#1C1C1E' }}>
                        {attempt.test?.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: '#8C8C8E' }}>
                        <span>{attempt.test?.category}</span>
                        <span className="w-1 h-1 rounded-full inline-block" style={{ background: '#C4B8A8' }} />
                        <span className="flex items-center gap-1">
                            <IcoClock size={11} color="#C4B8A8" />
                            {new Date(attempt.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Score */}
                    {isCompleted && score !== undefined && (
                        <div className="text-sm font-black px-3 py-1 rounded-xl"
                            style={sev ? { background: sev.bg, color: sev.text } : { background: '#E8F5E9', color: '#1B4332' }}>
                            {score.toLocaleString('fa-IR')}
                        </div>
                    )}

                    {isCompleted ? (
                        <button onClick={() => setExpanded(e => !e)}
                            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                            style={{ background: expanded ? '#1B4332' : '#E8F5E9', color: expanded ? 'white' : '#1B4332' }}>
                            جزئیات
                            <IcoChevron size={12} color={expanded ? 'white' : '#1B4332'} up={expanded} />
                        </button>
                    ) : (
                        <Link href={`/tests/${attempt.test?.slug}`}
                            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl"
                            style={{ background: '#FEF9C3', color: '#854D0E' }}>
                            ادامه
                            <IcoArrowRight size={11} color="#854D0E" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Expanded */}
            {expanded && isCompleted && (
                <div className="border-t px-4 pb-5 pt-4 space-y-4" style={{ borderColor: '#F3EDE3', background: '#FDFBF8' }}>

                    {/* Severity */}
                    {sev && (
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                                style={{ background: sev.bg, color: sev.text }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sev.dot }} />
                                {sev.label}
                            </span>
                            {interp && (
                                <span className="text-xs" style={{ color: '#8C8C8E' }}>
                                    بازه: {interp.scoreRangeMin.toLocaleString('fa-IR')} تا {interp.scoreRangeMax.toLocaleString('fa-IR')}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Interpretation */}
                    {interp?.interpretationText && (
                        <p className="text-sm leading-7 px-4 py-3 rounded-xl" style={{ color: '#1C1C1E', background: 'white', border: '1px solid #EDE6D6' }}>
                            {interp.interpretationText}
                        </p>
                    )}

                    {/* Subscales */}
                    {attempt.score?.subscales && Object.keys(attempt.score.subscales).length > 0 && (
                        <div>
                            <p className="text-xs font-semibold mb-2.5" style={{ color: '#8C8C8E' }}>خرده‌مقیاس‌ها</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(attempt.score.subscales).map(([key, val]) => (
                                    <div key={key} className="flex justify-between items-center text-xs px-3 py-2 rounded-xl"
                                        style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                                        <span style={{ color: '#5C5C5E' }}>{key}</span>
                                        <span className="font-black" style={{ color: '#1B4332' }}>
                                            {Number(val).toLocaleString('fa-IR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <AiInsightPanel attempt={attempt} onGenerated={onAiGenerated} />
                </div>
            )}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyTestsPage() {
    const [attempts, setAttempts] = useState<Attempt[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all')

    useEffect(() => {
        api.get('/users/me/test-attempts?limit=100')
            .then(r => {
                const data = (r.data as { data?: { attempts?: Attempt[] } }).data?.attempts ?? []
                setAttempts(data)
            })
            .catch(() => setAttempts([]))
            .finally(() => setLoading(false))
    }, [])

    const handleAiGenerated = (attemptId: string, result: AiRecommendations) => {
        setAttempts(prev => prev.map(a =>
            a.id === attemptId
                ? { ...a, aiRecommendations: result, aiGeneratedCount: (a.aiGeneratedCount ?? 0) + 1 }
                : a
        ))
    }

    const completed  = attempts.filter(a => a.status === 'completed'   || a.status === 'COMPLETED')
    const inProgress = attempts.filter(a => a.status === 'in_progress' || a.status === 'IN_PROGRESS')

    const displayed = filter === 'completed'   ? completed
                    : filter === 'in_progress' ? inProgress
                    : attempts

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>تست‌های من</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#8C8C8E' }}>نتایج و تحلیل تست‌های روانشناسی</p>
                </div>
                <Link href="/tests"
                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
                    style={{ background: '#1B4332' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    تست جدید
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'تکمیل شده',   value: completed.length,  icon: <IcoCheck size={18} color="#065F46" />,  bg: '#D1FAE5', color: '#065F46' },
                    { label: 'ناتمام',       value: inProgress.length, icon: <IcoClock size={18} color="#854D0E" />,  bg: '#FEF9C3', color: '#854D0E' },
                    { label: 'کل تست‌ها',   value: attempts.length,   icon: <IcoBrain size={18} color="#1B4332" />,  bg: '#E8F5E9', color: '#1B4332' },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4 border flex flex-col items-center text-center gap-2"
                        style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 1px 6px rgba(27,67,50,0.05)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                            {s.icon}
                        </div>
                        <div className="text-2xl font-black" style={{ color: '#1C1C1E' }}>
                            {s.value.toLocaleString('fa-IR')}
                        </div>
                        <div className="text-xs" style={{ color: '#8C8C8E' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {([['all', 'همه'], ['completed', 'تکمیل شده'], ['in_progress', 'ناتمام']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setFilter(val)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{
                            background: filter === val ? '#1B4332' : 'white',
                            color:      filter === val ? 'white'    : '#5C5C5E',
                            border:    `1px solid ${filter === val ? '#1B4332' : '#EDE6D6'}`,
                        }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />
                    ))}
                </div>
            ) : displayed.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: '#E8F5E9' }}>
                        <IcoBrain size={28} color="#1B4332" />
                    </div>
                    <p className="font-bold mb-1" style={{ color: '#1C1C1E' }}>
                        {filter === 'all' ? 'هنوز تستی انجام ندادید' : 'تستی در این بخش ندارید'}
                    </p>
                    <p className="text-sm mb-5" style={{ color: '#8C8C8E' }}>
                        تست‌های روانشناسی رایگان را امتحان کنید
                    </p>
                    <Link href="/tests"
                        className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: '#1B4332' }}>
                        مشاهده تست‌ها
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* In-progress section header */}
                    {filter === 'all' && inProgress.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 pt-1">
                                <IcoClock size={14} color="#C9A84C" />
                                <span className="text-sm font-bold" style={{ color: '#C9A84C' }}>
                                    ناتمام — {inProgress.length.toLocaleString('fa-IR')} تست
                                </span>
                            </div>
                            {inProgress.map(a => <TestCard key={a.id} attempt={a} onAiGenerated={handleAiGenerated} />)}
                            {completed.length > 0 && (
                                <div className="flex items-center gap-2 pt-2">
                                    <IcoCheck size={14} color="#1B4332" />
                                    <span className="text-sm font-bold" style={{ color: '#1B4332' }}>
                                        تکمیل شده — {completed.length.toLocaleString('fa-IR')} تست
                                    </span>
                                </div>
                            )}
                            {completed.map(a => <TestCard key={a.id} attempt={a} onAiGenerated={handleAiGenerated} />)}
                        </>
                    )}
                    {filter !== 'all' && displayed.map(a => (
                        <TestCard key={a.id} attempt={a} onAiGenerated={handleAiGenerated} />
                    ))}
                    {filter === 'all' && inProgress.length === 0 && displayed.map(a => (
                        <TestCard key={a.id} attempt={a} onAiGenerated={handleAiGenerated} />
                    ))}
                </div>
            )}
        </div>
    )
}
