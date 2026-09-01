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

const CAT_ICON: Record<string, string> = {
    اضطراب: '😰', افسردگی: '😢', استرس: '💪', شخصیت: '🧬',
    'شخصیت‌شناسی': '🧬', شناختی: '🧠', روابط: '🤝', رفتاری: '⚡',
    خلق: '🌈', وسواس: '🔄', تروما: '💫', هوش: '💡',
}

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: '#E8F5E9', text: '#1B4332', label: 'طبیعی' },
    medium: { bg: '#FFF8E1', text: '#C9A84C', label: 'متوسط' },
    high: { bg: '#FCE4EC', text: '#C62828', label: 'نیاز به توجه' },
    critical: { bg: '#FCE4EC', text: '#B71C1C', label: 'حیاتی' },
}

function getInterpretation(attempt: Attempt): Interpretation | null {
    if (!attempt.score?.total && attempt.score?.total !== 0) return null
    const total = attempt.score.total
    return (
        attempt.test.interpretations?.find(
            (i) => total >= i.scoreRangeMin && total <= i.scoreRangeMax,
        ) ?? null
    )
}

// ─── AI Insight Panel ─────────────────────────────────────────────────────────

function AiInsightPanel({
    attempt,
    onGenerated,
}: {
    attempt: Attempt
    onGenerated: (attemptId: string, result: AiRecommendations) => void
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const ai = attempt.aiRecommendations

    const generate = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await api.post<AiRecommendations>(
                `/tests/attempts/${attempt.id}/ai-insight`,
            )
            const data = (res.data as { data?: AiRecommendations }).data ?? res.data as unknown as AiRecommendations
            onGenerated(attempt.id, data)
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'خطا در تولید تحلیل هوش مصنوعی'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    if (ai?.summary) {
        return (
            <div className="mt-4 rounded-2xl border p-4 space-y-3" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <h4 className="font-bold text-sm" style={{ color: '#1B4332' }}>تحلیل هوش مصنوعی</h4>
                    {ai.generatedAt && (
                        <span className="text-xs mr-auto" style={{ color: '#8C8C8E' }}>
                            {new Date(ai.generatedAt).toLocaleDateString('fa-IR')}
                        </span>
                    )}
                </div>

                <p className="text-sm leading-relaxed" style={{ color: '#2D6A4F' }}>{ai.summary}</p>

                {ai.strengths && ai.strengths.length > 0 && (
                    <div>
                        <p className="text-xs font-bold mb-1.5" style={{ color: '#1B4332' }}>نقاط قوت</p>
                        <ul className="space-y-1">
                            {ai.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#2D6A4F' }}>
                                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {ai.concerns && ai.concerns.length > 0 && (
                    <div>
                        <p className="text-xs font-bold mb-1.5" style={{ color: '#C9A84C' }}>نگرانی‌ها</p>
                        <ul className="space-y-1">
                            {ai.concerns.map((c, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#5C5C5E' }}>
                                    <span className="text-yellow-500 mt-0.5 flex-shrink-0">!</span>
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {ai.recommendations && ai.recommendations.length > 0 && (
                    <div>
                        <p className="text-xs font-bold mb-1.5" style={{ color: '#1B4332' }}>توصیه‌ها</p>
                        <ul className="space-y-1">
                            {ai.recommendations.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#5C5C5E' }}>
                                    <span className="mt-0.5 flex-shrink-0">→</span>
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Re-generate if count < 3 */}
                {(attempt.aiGeneratedCount ?? 0) < 3 && (
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="text-xs text-green-700 hover:underline disabled:opacity-50 mt-1"
                    >
                        {loading ? '⏳ در حال بازسازی...' : '↻ بازسازی تحلیل'}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="mt-4 rounded-2xl border p-4" style={{ background: '#F9F5EF', borderColor: '#EDE6D6' }}>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold" style={{ color: '#1C1C1E' }}>تحلیل هوش مصنوعی</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                        تفسیر شخصی‌سازی‌شده بر اساس نتایج شما
                    </p>
                </div>
                <button
                    onClick={generate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex-shrink-0"
                    style={{ background: '#1B4332' }}
                >
                    {loading ? (
                        <>
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            در حال تحلیل...
                        </>
                    ) : (
                        <>🤖 دریافت تحلیل</>
                    )}
                </button>
            </div>
            {error && (
                <p className="text-xs mt-2 font-semibold" style={{ color: '#C62828' }}>
                    ⚠️ {error}
                </p>
            )}
        </div>
    )
}

// ─── Test Result Card ─────────────────────────────────────────────────────────

function TestCard({
    attempt,
    onAiGenerated,
}: {
    attempt: Attempt
    onAiGenerated: (id: string, result: AiRecommendations) => void
}) {
    const [expanded, setExpanded] = useState(false)
    const icon = CAT_ICON[attempt.test?.category] ?? '🔬'
    const isCompleted = attempt.status === 'completed' || attempt.status === 'COMPLETED'
    const score = attempt.score?.total
    const interp = isCompleted ? getInterpretation(attempt) : null
    const sev = interp?.severity ? SEVERITY_CONFIG[interp.severity] ?? SEVERITY_CONFIG.low : null

    return (
        <div
            className="rounded-2xl border overflow-hidden transition-all"
            style={{ background: 'white', borderColor: '#EDE6D6' }}
        >
            {/* Header row */}
            <div className="flex items-center gap-4 p-4">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: isCompleted ? '#E8F5E9' : '#FFF8E1' }}
                >
                    {icon}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1" style={{ color: '#1C1C1E' }}>
                        {attempt.test?.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                        {attempt.test?.category} · {new Date(attempt.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Score badge */}
                    {isCompleted && score !== undefined && (
                        <div
                            className="text-sm font-black px-3 py-1 rounded-xl"
                            style={sev ? { background: sev.bg, color: sev.text } : { background: '#E8F5E9', color: '#1B4332' }}
                        >
                            {score.toLocaleString('fa-IR')}
                        </div>
                    )}

                    {isCompleted ? (
                        <button
                            onClick={() => setExpanded((e) => !e)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                            style={{ background: expanded ? '#1B4332' : '#E8F5E9', color: expanded ? 'white' : '#1B4332' }}
                        >
                            {expanded ? 'بستن ↑' : 'نتیجه ↓'}
                        </button>
                    ) : (
                        <Link
                            href={`/tests/${attempt.test?.slug}`}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl"
                            style={{ background: '#FFF8E1', color: '#C9A84C' }}
                        >
                            ادامه →
                        </Link>
                    )}
                </div>
            </div>

            {/* Expanded detail */}
            {expanded && isCompleted && (
                <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: '#F3EDE3' }}>
                    {/* Severity label */}
                    {sev && (
                        <div className="flex items-center gap-2">
                            <span
                                className="text-xs font-bold px-3 py-1 rounded-full"
                                style={{ background: sev.bg, color: sev.text }}
                            >
                                {sev.label}
                            </span>
                            {interp && (
                                <span className="text-xs" style={{ color: '#5C5C5E' }}>
                                    بازه نمره: {interp.scoreRangeMin}–{interp.scoreRangeMax}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Interpretation text */}
                    {interp?.interpretationText && (
                        <p className="text-sm leading-relaxed" style={{ color: '#5C5C5E' }}>
                            {interp.interpretationText}
                        </p>
                    )}

                    {/* Subscales */}
                    {attempt.score?.subscales && Object.keys(attempt.score.subscales).length > 0 && (
                        <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: '#8C8C8E' }}>خرده‌مقیاس‌ها</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(attempt.score.subscales).map(([key, val]) => (
                                    <div
                                        key={key}
                                        className="flex justify-between text-xs px-3 py-1.5 rounded-lg"
                                        style={{ background: '#F3EDE3' }}
                                    >
                                        <span style={{ color: '#5C5C5E' }}>{key}</span>
                                        <span className="font-bold" style={{ color: '#1B4332' }}>
                                            {Number(val).toLocaleString('fa-IR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Insight */}
                    <AiInsightPanel attempt={attempt} onGenerated={onAiGenerated} />
                </div>
            )}
        </div>
    )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MyTestsPage() {
    const [attempts, setAttempts] = useState<Attempt[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/users/me/test-attempts?limit=100')
            .then((r) => {
                const data = (r.data as { data?: { attempts?: Attempt[] } }).data?.attempts ?? []
                setAttempts(data)
            })
            .catch(() => setAttempts([]))
            .finally(() => setLoading(false))
    }, [])

    const handleAiGenerated = (attemptId: string, result: AiRecommendations) => {
        setAttempts((prev) =>
            prev.map((a) =>
                a.id === attemptId
                    ? { ...a, aiRecommendations: result, aiGeneratedCount: (a.aiGeneratedCount ?? 0) + 1 }
                    : a,
            ),
        )
    }

    const completed = attempts.filter((a) => a.status === 'completed' || a.status === 'COMPLETED')
    const inProgress = attempts.filter((a) => a.status === 'in_progress' || a.status === 'IN_PROGRESS')

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>تست‌های من</h1>
                <Link
                    href="/tests"
                    className="text-sm font-bold px-4 py-2 rounded-xl text-white"
                    style={{ background: '#1B4332' }}
                >
                    + تست جدید
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'انجام شده', value: completed.length, icon: '✅', color: '#E8F5E9' },
                    { label: 'در حال انجام', value: inProgress.length, icon: '⏳', color: '#FFF8E1' },
                    { label: 'کل تست', value: attempts.length, icon: '🧠', color: '#F3EDE3' },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-2xl p-4 border text-center"
                        style={{ background: 'white', borderColor: '#EDE6D6' }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-2"
                            style={{ background: s.color }}
                        >
                            {s.icon}
                        </div>
                        <div className="text-2xl font-black mb-1" style={{ color: '#1C1C1E' }}>
                            {s.value.toLocaleString('fa-IR')}
                        </div>
                        <div className="text-xs" style={{ color: '#8C8C8E' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-16 rounded-2xl animate-pulse"
                            style={{ background: '#F3EDE3' }}
                        />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && attempts.length === 0 && (
                <div
                    className="text-center py-20 rounded-2xl border"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}
                >
                    <div className="text-5xl mb-4">🧠</div>
                    <p className="font-semibold mb-2" style={{ color: '#1C1C1E' }}>
                        هنوز تستی انجام ندادید
                    </p>
                    <Link
                        href="/tests"
                        className="inline-block mt-3 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: '#1B4332' }}
                    >
                        شروع اولین تست
                    </Link>
                </div>
            )}

            {/* Lists */}
            {!loading && attempts.length > 0 && (
                <div className="space-y-6">
                    {inProgress.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold mb-3" style={{ color: '#C9A84C' }}>
                                ⏳ ناتمام ({inProgress.length})
                            </p>
                            <div className="space-y-3">
                                {inProgress.map((a) => (
                                    <TestCard key={a.id} attempt={a} onAiGenerated={handleAiGenerated} />
                                ))}
                            </div>
                        </div>
                    )}

                    {completed.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold mb-3" style={{ color: '#1B4332' }}>
                                ✅ تکمیل شده ({completed.length})
                            </p>
                            <div className="space-y-3">
                                {completed.map((a) => (
                                    <TestCard key={a.id} attempt={a} onAiGenerated={handleAiGenerated} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
