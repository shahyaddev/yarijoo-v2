import type { Metadata } from 'next'
import Link from 'next/link'
import BookCard from './BookCard'
import BooksSidebar from './BooksSidebar'

export const revalidate = 0

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'کتاب‌های روانشناسی | یاری‌جو',
    description: 'کتاب‌های معتبر روانشناسی و سلامت روان — مطالعه آنلاین',
}

interface Book {
    id: string
    slug: string
    title: string
    author: string
    coverImage: string | null
    price: number
    isPremium: boolean
    totalPages: number | null
    createdAt?: string | null
    category?: { name: string } | null
    _count?: { reviews: number }
}

interface PageProps {
    searchParams: Promise<{ page?: string; sort?: string; category_slug?: string; tags?: string }>
}

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

async function getBooks(page = 1) {
    try {
        const res = await fetch(`${API}/books?limit=24&page=${page}`, { cache: 'no-store' })
        if (!res.ok) return { books: [] as Book[], total: 0 }
        const json = await res.json() as { data?: { books?: Book[]; total?: number } }
        return { books: json.data?.books ?? [], total: json.data?.total ?? 0 }
    } catch {
        return { books: [] as Book[], total: 0 }
    }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconLibrary() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}
function IconChevronRight() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
}
function IconChevronLeft() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BooksPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Math.max(1, Number(params.page ?? 1))
    const { books, total } = await getBooks(page)
    const totalPages = Math.ceil(total / 24) || 1

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
            <div className="section-forest" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.05,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }} />
                <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />

                <div className="max-w-[1280px] mx-auto px-4 py-14" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                            <IconLibrary />
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: 0 }}>کتاب‌خانه</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, margin: 0, paddingRight: 62 }}>
                        {total > 0
                            ? `${toFarsi(total)} عنوان کتاب تخصصی روانشناسی`
                            : 'کتاب‌های معتبر روانشناسی و سلامت روان'}
                    </p>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-[1280px] mx-auto px-4 py-8">
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                    {/* ══════════ SIDEBAR ══════════ */}
                    <BooksSidebar total={total} />

                    {/* ══════════ MAIN ══════════ */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Section title + stats */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 4, height: 28, borderRadius: 99, background: 'linear-gradient(to bottom,#1B4332,rgba(27,67,50,0.3))' }} />
                            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1C1C1E', margin: 0 }}>کتاب‌های روانشناسی</h2>
                            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, #EDE6D6, transparent)' }} />
                            <span style={{ fontSize: 13, color: '#8C8C8E' }}>
                                {toFarsi(books.length)} کتاب از {toFarsi(total)} عنوان
                            </span>
                            {totalPages > 1 && (
                                <span style={{ fontSize: 12, color: '#9CA3AF', background: 'white', border: '1px solid #EDE6D6', borderRadius: 8, padding: '4px 10px' }}>
                                    صفحه {toFarsi(page)} از {toFarsi(totalPages)}
                                </span>
                            )}
                        </div>

                        {books.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                                <div style={{ width: 64, height: 64, borderRadius: 18, background: '#F3EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#C8B99A' }}>
                                    <IconLibrary />
                                </div>
                                <p style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E', marginBottom: 6 }}>کتابی یافت نشد</p>
                                <p style={{ fontSize: 13, color: '#8C8C8E' }}>لطفاً فیلتر دیگری امتحان کنید</p>
                            </div>
                        ) : (
                            <>
                                {/* Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
                                    {books.map(book => <BookCard key={book.id} book={book} />)}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        {page > 1 && (
                                            <Link href={`/books?page=${page - 1}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E0D8CC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', cursor: 'pointer' }}>
                                                    <IconChevronRight />
                                                </div>
                                            </Link>
                                        )}
                                        {pagesRange.map(p => (
                                            <Link key={p} href={`/books?page=${p}`} style={{ textDecoration: 'none' }}>
                                                <div style={{
                                                    width: 38, height: 38, borderRadius: 10,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                                    ...(p === page
                                                        ? { background: '#1B4332', color: 'white', boxShadow: '0 3px 10px rgba(27,67,50,0.3)' }
                                                        : { background: 'white', color: '#6B7280', border: '1px solid #E0D8CC' }),
                                                }}>
                                                    {toFarsi(p)}
                                                </div>
                                            </Link>
                                        ))}
                                        {page < totalPages && (
                                            <Link href={`/books?page=${page + 1}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E0D8CC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', cursor: 'pointer' }}>
                                                    <IconChevronLeft />
                                                </div>
                                            </Link>
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
