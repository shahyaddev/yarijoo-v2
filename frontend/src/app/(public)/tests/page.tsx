import type { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 0

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'تست‌های روانشناسی | یاری‌جو',
    description: 'بیش از ۱۵۰ تست معتبر روانشناسی — شخصیت، اضطراب، افسردگی، استرس و بیشتر',
}

interface Test {
    id: string
    slug: string
    title: string
    category: string
}

interface PageProps {
    searchParams: Promise<{ category?: string }>
}

/* ── Category config ─────────────────────────────────────────────── */
const CAT: Record<string, { icon: string; color: string; accent: string; desc: string }> = {
    اضطراب: { icon: '😰', color: '#FFFDE7', accent: '#F57F17', desc: 'سنجش سطح اضطراب و نگرانی' },
    افسردگی: { icon: '😢', color: '#E3F2FD', accent: '#1565C0', desc: 'ارزیابی علائم افسردگی' },
    استرس: { icon: '💪', color: '#FCE4EC', accent: '#C62828', desc: 'سنجش سطح استرس ادراک‌شده' },
    شخصیت: { icon: '🧬', color: '#E8F5E9', accent: '#1B4332', desc: 'شناخت تیپ شخصیتی' },
    'شخصیت‌شناسی': { icon: '🧬', color: '#E8F5E9', accent: '#1B4332', desc: 'شناخت تیپ شخصیتی' },
    شناختی: { icon: '🧠', color: '#E0F7FA', accent: '#00695C', desc: 'ارزیابی توانایی‌های شناختی' },
    روابط: { icon: '🤝', color: '#F3E5F5', accent: '#6A1B9A', desc: 'کیفیت روابط بین‌فردی' },
    رفتاری: { icon: '⚡', color: '#FFF3E0', accent: '#E65100', desc: 'الگوهای رفتاری و عادات' },
    خلق: { icon: '🌈', color: '#E8EAF6', accent: '#283593', desc: 'سنجش حالات خلقی' },
    وسواس: { icon: '🔄', color: '#F1F8E9', accent: '#33691E', desc: 'بررسی علائم وسواس' },
    تروما: { icon: '💫', color: '#FFF8E1', accent: '#FF6F00', desc: 'ارزیابی تجربیات آسیب‌زا' },
    هوش: { icon: '💡', color: '#E0F2F1', accent: '#004D40', desc: 'سنجش هوش هیجانی' },
}

function cat(name: string) {
    return CAT[name] ?? { icon: '🔬', color: '#F3EDE3', accent: '#1B4332', desc: 'ابزار روانشناختی' }
}

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

/* ── Test card ───────────────────────────────────────────────────── */
function TestCard({ test }: { test: Test }) {
    const c = cat(test.category)
    return (
        <Link href={`/tests/${test.slug}`}
            className="group block rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: 'white', borderColor: '#EDE6D6' }}>
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: c.color }}>
                    {c.icon}
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{ background: c.color, color: c.accent }}>رایگان</span>
            </div>
            <h3 className="font-bold text-[14px] mb-3 line-clamp-2 leading-relaxed group-hover:text-[#1B4332] transition-colors"
                style={{ color: '#1C1C1E' }}>
                {test.title}
            </h3>
            <div className="flex items-center justify-between">
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: '#F3EDE3', color: '#8C8C8E' }}>
                    آنلاین
                </span>
                <span className="text-[12px] font-bold transition-colors" style={{ color: c.accent }}>
                    شروع ←
                </span>
            </div>
        </Link>
    )
}

/* ── Page ────────────────────────────────────────────────────────── */
export default async function TestsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const activeCategory = params.category ?? ''
    const allTests = await getAllTests()

    // Count per category
    const counts = allTests.reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + 1
        return acc
    }, {})

    // Sorted categories
    const categories = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([c]) => c)

    // Filtered list
    const filtered = activeCategory
        ? allTests.filter(t => t.category === activeCategory)
        : allTests

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

            {/* Header — concentric circles pattern */}
            <div style={{
                background: '#1B4332',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='32' fill='none' stroke='%23fff' stroke-opacity='0.05' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23fff' stroke-opacity='0.05' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='8' fill='%23fff' fill-opacity='0.06'/%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px',
            }} className="py-14 px-5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">🧠</span>
                        <h1 className="text-3xl md:text-4xl font-black text-white">تست‌های روانشناسی</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-lg">
                        {allTests.length} تست معتبر در {categories.length} حوزه تخصصی
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 py-10">

                {/* Category filter pills */}
                <div className="flex flex-wrap gap-2 mb-10">
                    <Link href="/tests"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={!activeCategory
                            ? { background: '#1B4332', color: 'white' }
                            : { background: 'white', color: '#5C5C5E', border: '1.5px solid #EDE6D6' }}>
                        🔬 همه ({allTests.length})
                    </Link>
                    {categories.map(name => {
                        const c = cat(name)
                        return (
                            <Link key={name} href={`/tests?category=${encodeURIComponent(name)}`}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                style={activeCategory === name
                                    ? { background: c.accent, color: 'white' }
                                    : { background: 'white', color: '#5C5C5E', border: '1.5px solid #EDE6D6' }}>
                                {c.icon} {name}
                                <span className="text-[11px] opacity-60">({counts[name]})</span>
                            </Link>
                        )
                    })}
                </div>

                {allTests.length === 0 ? (
                    <p className="text-center py-24 text-lg" style={{ color: '#8C8C8E' }}>در حال بارگذاری...</p>
                ) : activeCategory ? (
                    /* ── Single category filtered view ── */
                    <>
                        <div className="flex items-center gap-3 mb-6 p-5 rounded-2xl border"
                            style={{ background: 'white', borderColor: '#EDE6D6' }}>
                            <span className="text-3xl">{cat(activeCategory).icon}</span>
                            <div>
                                <h2 className="text-xl font-black" style={{ color: '#1C1C1E' }}>{activeCategory}</h2>
                                <p className="text-sm" style={{ color: '#8C8C8E' }}>
                                    {cat(activeCategory).desc} — {filtered.length} تست
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(t => <TestCard key={t.id} test={t} />)}
                        </div>
                    </>
                ) : (
                    /* ── All categories grouped ── */
                    <div className="flex flex-col gap-14">
                        {categories.map(name => {
                            const c = cat(name)
                            const tests = allTests.filter(t => t.category === name)
                            const shown = tests.slice(0, 4)
                            return (
                                <section key={name}>
                                    {/* Section header */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                                                style={{ background: c.color }}>
                                                {c.icon}
                                            </div>
                                            <div>
                                                <h2 className="text-[18px] font-black" style={{ color: '#1C1C1E' }}>{name}</h2>
                                                <p className="text-[12px]" style={{ color: '#8C8C8E' }}>{c.desc}</p>
                                            </div>
                                        </div>
                                        <Link href={`/tests?category=${encodeURIComponent(name)}`}
                                            className="text-[12px] font-bold flex items-center gap-1 hover:opacity-70 transition-opacity flex-shrink-0"
                                            style={{ color: c.accent }}>
                                            همه {tests.length} تست
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: 'scaleX(-1)' }}>
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </Link>
                                    </div>

                                    {/* Gradient divider */}
                                    <div className="h-px mb-5"
                                        style={{ background: `linear-gradient(to left, transparent, ${c.accent}50, transparent)` }} />

                                    {/* Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {shown.map(t => <TestCard key={t.id} test={t} />)}
                                    </div>

                                    {/* Show more button */}
                                    {tests.length > 4 && (
                                        <div className="mt-4 text-center">
                                            <Link href={`/tests?category=${encodeURIComponent(name)}`}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5"
                                                style={{ borderColor: c.accent, color: c.accent, background: c.color }}>
                                                + {(tests.length - 4).toLocaleString('fa-IR')} تست دیگر در این دسته
                                            </Link>
                                        </div>
                                    )}
                                </section>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
