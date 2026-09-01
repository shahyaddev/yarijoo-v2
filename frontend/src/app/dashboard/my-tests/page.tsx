'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

interface Attempt {
    id: string
    status: string
    score: number | null
    createdAt: string
    completedAt: string | null
    test: { id: string; slug: string; title: string; category: string }
}

const CAT_ICON: Record<string, string> = {
    اضطراب: '😰', افسردگی: '😢', استرس: '💪', شخصیت: '🧬', 'شخصیت‌شناسی': '🧬',
    شناختی: '🧠', روابط: '🤝', رفتاری: '⚡', خلق: '🌈', وسواس: '🔄', تروما: '💫',
}

export default function MyTestsPage() {
    const [attempts, setAttempts] = useState<Attempt[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/users/me/test-attempts?limit=100')
            .then(r => setAttempts((r.data as any)?.data?.attempts ?? []))
            .catch(() => setAttempts([]))
            .finally(() => setLoading(false))
    }, [])

    const completed = attempts.filter(a => a.status === 'COMPLETED')
    const inProgress = attempts.filter(a => a.status === 'IN_PROGRESS')

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>تست‌های من</h1>
                <Link href="/tests" className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{ background: '#1B4332' }}>
                    + تست جدید
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'انجام شده', value: completed.length, icon: '✅', color: '#E8F5E9' },
                    { label: 'در حال انجام', value: inProgress.length, icon: '⏳', color: '#FFF8E1' },
                    { label: 'کل تست', value: attempts.length, icon: '🧠', color: '#F3EDE3' },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4 border text-center" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-2" style={{ background: s.color }}>{s.icon}</div>
                        <div className="text-2xl font-black mb-1" style={{ color: '#1C1C1E' }}>{s.value.toLocaleString('fa-IR')}</div>
                        <div className="text-xs" style={{ color: '#8C8C8E' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />)}</div>
            ) : attempts.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="text-5xl mb-4">🧠</div>
                    <p className="font-semibold mb-2" style={{ color: '#1C1C1E' }}>هنوز تستی انجام ندادید</p>
                    <Link href="/tests" className="inline-block mt-3 px-6 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: '#1B4332' }}>شروع اولین تست</Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {inProgress.length > 0 && (
                        <div className="mb-2">
                            <p className="text-sm font-semibold mb-3" style={{ color: '#C9A84C' }}>⏳ ناتمام ({inProgress.length})</p>
                            {inProgress.map(a => <TestCard key={a.id} attempt={a} />)}
                        </div>
                    )}
                    {completed.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold mb-3" style={{ color: '#1B4332' }}>✅ تکمیل شده ({completed.length})</p>
                            {completed.map(a => <TestCard key={a.id} attempt={a} />)}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function TestCard({ attempt }: { attempt: Attempt }) {
    const icon = CAT_ICON[attempt.test?.category] ?? '🔬'
    const isCompleted = attempt.status === 'COMPLETED'
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm"
            style={{ background: 'white', borderColor: '#EDE6D6' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: isCompleted ? '#E8F5E9' : '#FFF8E1' }}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1" style={{ color: '#1C1C1E' }}>{attempt.test?.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                    {attempt.test?.category} · {new Date(attempt.createdAt).toLocaleDateString('fa-IR')}
                </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                {attempt.score !== null && (
                    <span className="text-sm font-black" style={{ color: '#1B4332' }}>
                        {attempt.score.toLocaleString('fa-IR')}
                    </span>
                )}
                {isCompleted ? (
                    <Link href={`/tests/${attempt.test?.slug}/result/${attempt.id}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl"
                        style={{ background: '#E8F5E9', color: '#1B4332' }}>نتیجه</Link>
                ) : (
                    <Link href={`/tests/${attempt.test?.slug}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl"
                        style={{ background: '#FFF8E1', color: '#C9A84C' }}>ادامه</Link>
                )}
            </div>
        </div>
    )
}
