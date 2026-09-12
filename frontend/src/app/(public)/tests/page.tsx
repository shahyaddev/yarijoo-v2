import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const revalidate = 0

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'تست‌های روانشناسی | یاری‌جو',
    description: 'تست‌های معتبر روانشناسی — اضطراب، افسردگی، استرس، شخصیت و هوش هیجانی',
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Test {
    id: string
    slug: string
    title: string
    category: string
    description: string | null
    duration: number | null
    isPremium: boolean
    _count?: { questions: number; attempts: number }
}

// ─── Active test slugs (real backend data with questions) ─────────────────────

const ACTIVE_SLUGS = ['gad7', 'bdi', 'pss', 'mbti-short', 'eq-test']

// ─── Category SVG icons ───────────────────────────────────────────────────────

function IcoAnxiety({ size = 22, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
        </svg>
    )
}
function IcoDepression({ size = 22, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15s1.5-2 4-2 4 2 4 2" />
            <line x1="9" x2="9.01" y1="9" y2="9" />
            <line x1="15" x2="15.01" y1="9" y2="9" />
        </svg>
    )
}
function IcoStress({ size = 22, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
    )
}
function IcoBrain({ size = 22, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        </svg>
    )
}
function IcoHeart({ size = 22, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    )
}
function IcoPerson({ size = 22, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
function IcoOcd({ size = 22, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
        </svg>
    )
}
function IcoStar({ size = 16, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
function IcoQuestion({ size = 13, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
        </svg>
    )
}
function IcoLock({ size = 13, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

// ─── Category config with SVG icons ──────────────────────────────────────────

type CatConfig = {
    icon: (props: { size?: number; color?: string }) => React.ReactElement
    bg: string
    accent: string
    desc: string
}

const CAT: Record<string, CatConfig> = {
    اضطراب:   { icon: IcoAnxiety,    bg: '#FEF9C3', accent: '#854D0E', desc: 'سنجش سطح اضطراب و نگرانی' },
    افسردگی:  { icon: IcoDepression, bg: '#DBEAFE', accent: '#1565C0', desc: 'ارزیابی علائم افسردگی' },
    استرس:    { icon: IcoStress,     bg: '#FEE2E2', accent: '#991B1B', desc: 'سنجش استرس ادراک‌شده' },
    شخصیت:   { icon: IcoBrain,      bg: '#E8F5E9', accent: '#1B4332', desc: 'شناخت تیپ شخصیتی' },
    هوش:      { icon: IcoStar as unknown as (p: { size?: number; color?: string }) => React.ReactElement,
                                     bg: '#EDE9FE', accent: '#6B21A8', desc: 'سنجش هوش هیجانی' },
    روابط:    { icon: IcoHeart,     bg: '#FCE7F3', accent: '#9D174D', desc: 'کیفیت روابط بین‌فردی' },
    وسواس:   { icon: IcoOcd,        bg: '#DCFCE7', accent: '#166534', desc: 'بررسی علائم وسواس' },
}

function cat(name: string): CatConfig {
    return CAT[name] ?? { icon: IcoBrain, bg: '#F3EDE3', accent: '#1B4332', desc: 'ابزار روانشناختی' }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function getAllTests(): Promise<Test[]> {
    try {
        const res = await fetch(`${API}/tests?limit=200`, { cache: 'no-store' })
        if (!res.ok) return []
        const json = await res.json() as { data?: { tests?: Test[] } }
        return json.data?.tests ?? []
    } catch {
        return []
    }
}

// ─── Test Card ────────────────────────────────────────────────────────────────

function TestCard({ test }: { test: Test }) {
    const c = cat(test.category)
    const Icon = c.icon
    const isActive = ACTIVE_SLUGS.includes(test.slug)
    const qCount = test._count?.questions ?? 0

    return (
        <div className="relative group rounded-2xl border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{
                background: isActive ? 'white' : '#FDFBF8',
                borderColor: '#EDE6D6',
                opacity: isActive ? 1 : 0.75,
            }}>

            {/* Coming soon badge */}
            {!isActive && (
                <div className="absolute top-3 left-3 z-10 text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: '#F3EDE3', color: '#C4B8A8' }}>
                    به زودی
                </div>
            )}

            {/* Premium badge */}
            {test.isPremium && isActive && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: '#FEF9C3', color: '#854D0E' }}>
                    <IcoLock size={10} color="#854D0E" />
                    پریمیوم
                </div>
            )}

            {isActive ? (
                <Link href={`/tests/${test.slug}`} className="block p-5">
                    <CardInner test={test} Icon={Icon} c={c} qCount={qCount} isActive={isActive} />
                </Link>
            ) : (
                <div className="block p-5 cursor-not-allowed">
                    <CardInner test={test} Icon={Icon} c={c} qCount={qCount} isActive={isActive} />
                </div>
            )}
        </div>
    )
}

function CardInner({ test, Icon, c, qCount, isActive }: {
    test: Test
    Icon: (props: { size?: number; color?: string }) => React.ReactElement
    c: CatConfig
    qCount: number
    isActive: boolean
}) {
    return (
        <>
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: c.bg }}>
                    <Icon size={22} color={c.accent} />
                </div>
                {!test.isPremium && isActive && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{ background: '#E8F5E9', color: '#1B4332' }}>رایگان</span>
                )}
            </div>

            <span className="text-[11px] font-semibold mb-1 block"
                style={{ color: c.accent }}>{test.category}</span>

            <h3 className="font-bold text-sm leading-snug mb-3 line-clamp-2"
                style={{ color: isActive ? '#1C1C1E' : '#8C8C8E' }}>
                {test.title}
            </h3>

            {test.description && (
                <p className="text-xs leading-relaxed mb-3 line-clamp-2"
                    style={{ color: '#8C8C8E' }}>
                    {test.description}
                </p>
            )}

            <div className="flex items-center gap-3 text-xs" style={{ color: '#C4B8A8' }}>
                {qCount > 0 && (
                    <span className="flex items-center gap-1">
                        <IcoQuestion size={12} color="#C4B8A8" />
                        {qCount.toLocaleString('fa-IR')} سوال
                    </span>
                )}
                {test.duration && (
                    <span className="flex items-center gap-1">
                        <IcoClock size={12} color="#C4B8A8" />
                        {test.duration.toLocaleString('fa-IR')} دقیقه
                    </span>
                )}
            </div>

            {isActive && (
                <div className="mt-4 flex items-center justify-end">
                    <span className="text-xs font-bold transition-colors group-hover:opacity-80"
                        style={{ color: c.accent }}>
                        شروع تست ←
                    </span>
                </div>
            )}
        </>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TestsPage() {
    const allTests = await getAllTests()

    // Separate active vs coming-soon
    const activeTests = allTests.filter(t => ACTIVE_SLUGS.includes(t.slug))
    const comingTests = allTests.filter(t => !ACTIVE_SLUGS.includes(t.slug))

    // Count per category (active only)
    const activeCats = [...new Set(activeTests.map(t => t.category))]

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 60%,#52B788 100%)' }} className="relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                <div className="relative max-w-5xl mx-auto px-5 py-14">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                            <IcoBrain size={24} color="white" />
                        </div>
                        <h1 className="text-3xl font-black text-white">تست‌های روانشناسی</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-base">
                        {activeTests.length.toLocaleString('fa-IR')} تست فعال در {activeCats.length.toLocaleString('fa-IR')} حوزه تخصصی
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-5 py-10 space-y-12">

                {/* ── Active tests ── */}
                {activeCats.map(catName => {
                    const c = cat(catName)
                    const Icon = c.icon
                    const tests = activeTests.filter(t => t.category === catName)
                    return (
                        <section key={catName}>
                            {/* Section header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                                    style={{ background: c.bg }}>
                                    <Icon size={20} color={c.accent} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black" style={{ color: '#1C1C1E' }}>{catName}</h2>
                                    <p className="text-xs" style={{ color: '#8C8C8E' }}>{c.desc}</p>
                                </div>
                            </div>
                            <div className="h-px mb-6"
                                style={{ background: `linear-gradient(to left, transparent, ${c.accent}40, transparent)` }} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tests.map(t => <TestCard key={t.id} test={t} />)}
                            </div>
                        </section>
                    )
                })}

                {/* ── Coming soon ── */}
                {comingTests.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ background: '#F3EDE3' }}>
                                <IcoClock size={20} color="#C4B8A8" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black" style={{ color: '#1C1C1E' }}>به زودی</h2>
                                <p className="text-xs" style={{ color: '#8C8C8E' }}>
                                    {comingTests.length.toLocaleString('fa-IR')} تست دیگر در حال آماده‌سازی
                                </p>
                            </div>
                        </div>
                        <div className="h-px mb-6" style={{ background: '#EDE6D6' }} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {comingTests.map(t => <TestCard key={t.id} test={t} />)}
                        </div>
                    </section>
                )}

            </div>
        </div>
    )
}
