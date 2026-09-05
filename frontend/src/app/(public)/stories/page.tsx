import type { Metadata } from 'next'
import Link from 'next/link'
import StoryCard from './StoryCard'
import StoriesSidebar from './StoriesSidebar'

export const revalidate = 60

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'داستان‌های الهام‌بخش | یاری‌جو',
    description: 'داستان‌های واقعی و الهام‌بخش از افرادی که با چالش‌های روانی روبرو شدند',
}

interface Story {
    id: string
    title: string | null
    content: string
    mediaUrl: string | null
    views: number
    createdAt: string
}

interface PageProps {
    searchParams: Promise<{ page?: string }>
}

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

async function getStories(page = 1) {
    try {
        const res = await fetch(`${API}/stories?limit=12&page=${page}`, { cache: 'no-store' })
        if (!res.ok) return { stories: [] as Story[], total: 0 }
        const json = await res.json() as { data: Story[] | { stories: Story[]; total: number } }
        const d = json.data
        if (Array.isArray(d)) return { stories: d, total: d.length }
        return { stories: (d as { stories: Story[] }).stories ?? [], total: (d as { total: number }).total ?? 0 }
    } catch {
        return { stories: [] as Story[], total: 0 }
    }
}

// ─── Icons ─────────────────────────────────────────────────────────────────
function IconStories() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}
function IconChevronR() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
}
function IconChevronL() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
}
function IconEmpty() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}

const CATS = [
    { name: 'موفقیت' },
    { name: 'عشق و رابطه' },
    { name: 'تاب‌آوری' },
    { name: 'الهام‌بخش' },
    { name: 'خودشناسی' },
    { name: 'شادی' },
]

// ─── Pagination component (server-safe) ────────────────────────────────────
function PaginationLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E0D8CC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', cursor: 'pointer' }}>
                {children}
            </div>
        </Link>
    )
}

function PageLink({ p, current }: { p: number; current: boolean }) {
    return (
        <Link href={`/stories?page=${p}`} style={{ textDecoration: 'none' }}>
            <div style={{
                width: 38, height: 38, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                ...(current
                    ? { background: '#1B4332', color: 'white', boxShadow: '0 3px 10px rgba(27,67,50,0.3)' }
                    : { background: 'white', color: '#6B7280', border: '1px solid #E0D8CC' }),
            }}>
                {toFarsi(p)}
            </div>
        </Link>
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default async function StoriesPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Math.max(1, Number(params.page ?? 1))
    const { stories, total } = await getStories(page)
    const totalPages = Math.ceil(total / 12) || 1

    const pagesRange = (() => {
        const max = 7
        let s = Math.max(1, page - Math.floor(max / 2))
        const e = Math.min(totalPages, s + max - 1)
        if (e - s < max - 1) s = Math.max(1, e - max + 1)
        return Array.from({ length: e - s + 1 }, (_, i) => s + i)
    })()

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh', direction: 'rtl' }}>

            {/* ── Hero ── */}
            <div className="section-forest py-14 px-5">
                <div className="max-w-[1280px] mx-auto">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: 'rgba(255,255,255,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', flexShrink: 0,
                        }}>
                            <IconStories />
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: 0 }}>داستان‌های الهام‌بخش</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, margin: 0, paddingRight: 62 }}>
                        {total > 0
                            ? `${toFarsi(total)} داستان واقعی از افرادی که چالش‌های روانی را پشت سر گذاشتند`
                            : 'داستان‌های واقعی و الهام‌بخش'}
                    </p>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-4 py-8">
                <div className="flex gap-6 items-start">

                    {/* ══════════ SIDEBAR ══════════ */}
                    <StoriesSidebar total={total} />

                    {/* ══════════ MAIN ══════════ */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Section title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 4, height: 28, borderRadius: 99, background: 'linear-gradient(to bottom,#1B4332,rgba(27,67,50,0.3))' }} />
                            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1C1C1E', margin: 0 }}>داستان‌های الهام‌بخش</h2>
                            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, #EDE6D6, transparent)' }} />
                            <span style={{ fontSize: 13, color: '#8C8C8E' }}>{toFarsi(stories.length)} داستان</span>
                        </div>

                        {stories.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                                <div style={{ width: 72, height: 72, borderRadius: 20, background: '#F3EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#C8B99A' }}>
                                    <IconEmpty />
                                </div>
                                <p style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E', marginBottom: 8 }}>داستانی موجود نیست</p>
                                <p style={{ fontSize: 13, color: '#8C8C8E' }}>به زودی داستان‌های جدید اضافه می‌شوند</p>
                            </div>
                        ) : (
                            <>
                                {/* Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
                                    {stories.map(s => <StoryCard key={s.id} story={s} />)}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        {page > 1 && (
                                            <PaginationLink href={`/stories?page=${page - 1}`}>
                                                <IconChevronR />
                                            </PaginationLink>
                                        )}
                                        {pagesRange.map(p => <PageLink key={p} p={p} current={p === page} />)}
                                        {page < totalPages && (
                                            <PaginationLink href={`/stories?page=${page + 1}`}>
                                                <IconChevronL />
                                            </PaginationLink>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
