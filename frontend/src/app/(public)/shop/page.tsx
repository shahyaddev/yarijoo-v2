import type { Metadata } from 'next'
import Link from 'next/link'
import ShopSidebar from './ShopSidebar'
import ShopProductCard from './ShopProductCard'

export const revalidate = 300

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'فروشگاه | یاری‌جو',
    description: 'کتاب‌ها، دوره‌های آموزشی، پکیج‌های مشاوره و محصولات تخصصی روانشناسی',
}

interface Product {
    id: string
    slug: string
    title: string
    description: string | null
    price: number
    salePrice: number | null
    images: string[]
    type: string
    isActive: boolean
}

interface PageProps {
    searchParams: Promise<{ sort?: string; type?: string; page?: string }>
}

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

async function getProducts(sort = 'newest', type = '', page = 1) {
    try {
        const p = new URLSearchParams({ limit: '24', page: String(page) })
        if (sort) p.set('sort', sort)
        if (type) p.set('type', type)
        const res = await fetch(`${API}/shop/products?${p}`, { next: { revalidate: 300 } })
        if (!res.ok) return { products: [] as Product[], total: 0 }
        const data = await res.json() as { data: { products: Product[]; total: number } }
        return { products: data.data?.products ?? [], total: data.data?.total ?? 0 }
    } catch {
        return { products: [] as Product[], total: 0 }
    }
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'جدیدترین' },
    { value: 'price_asc', label: 'ارزان‌ترین' },
    { value: 'price_desc', label: 'گران‌ترین' },
]

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconShop() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
function IconBox() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
function IconChevronR() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg> }
function IconChevronL() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg> }

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ShopPage({ searchParams }: PageProps) {
    const params = await searchParams
    const sortBy = params.sort ?? 'newest'
    const activeType = params.type ?? ''
    const page = Math.max(1, Number(params.page ?? 1))

    const { products, total } = await getProducts(sortBy, activeType, page)
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
                <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />

                <div className="max-w-[1280px] mx-auto px-4 py-14" style={{ position: 'relative' }}>
                    {/* Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                            <IconShop />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.3 }}>فروشگاه یاری‌جو</h1>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '4px 0 0' }}>
                                محصولات تخصصی سلامت روان
                            </p>
                        </div>
                    </div>

                    {/* آمار hero */}
                    <div className="flex flex-wrap gap-3" style={{ marginTop: 4 }}>
                        {[
                            { label: 'محصول', value: toFarsi(total) },
                            { label: 'پرفروش‌ترین', value: toFarsi(50) },
                            { label: 'با تخفیف', value: toFarsi(25) },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: 20, fontWeight: 900, color: '#52B788' }}>{s.value}</span>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-[1280px] mx-auto px-4 py-8">
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                    {/* SIDEBAR */}
                    <ShopSidebar total={total} />

                    {/* MAIN */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Section title + sort */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 4, height: 28, borderRadius: 99, background: 'linear-gradient(to bottom,#1B4332,rgba(27,67,50,0.3))', flexShrink: 0 }} />
                            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1C1C1E', margin: 0 }}>همه محصولات</h2>
                            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, #EDE6D6, transparent)', minWidth: 20 }} />
                            <span style={{ fontSize: 13, color: '#8C8C8E' }}>{toFarsi(total)} محصول</span>

                            {/* مرتب‌سازی */}
                            <div style={{ display: 'flex', gap: 6 }}>
                                {SORT_OPTIONS.map(opt => (
                                    <Link key={opt.value}
                                        href={`/shop?sort=${opt.value}${activeType ? `&type=${activeType}` : ''}`}
                                        style={{
                                            padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                                            textDecoration: 'none', transition: 'all .15s',
                                            ...(sortBy === opt.value
                                                ? { background: '#1B4332', color: 'white' }
                                                : { background: 'white', color: '#6B7280', border: '1px solid #EDE6D6' }),
                                        }}>
                                        {opt.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {products.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                                <div style={{ width: 72, height: 72, borderRadius: 20, background: '#F3EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#C8B99A' }}>
                                    <IconBox />
                                </div>
                                <p style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E', marginBottom: 6 }}>محصولی یافت نشد</p>
                                <p style={{ fontSize: 13, color: '#8C8C8E' }}>لطفاً فیلتر دیگری انتخاب کنید</p>
                            </div>
                        ) : (
                            <>
                                {/* Grid — 3 ستونه */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                                    {products.map(p => <ShopProductCard key={p.id} product={p} />)}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <p style={{ fontSize: 12, color: '#8C8C8E' }}>
                                            نمایش {toFarsi((page - 1) * 24 + 1)} تا {toFarsi(Math.min(page * 24, total))} از {toFarsi(total)} محصول
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {page > 1 && (
                                                <Link href={`/shop?sort=${sortBy}&page=${page - 1}${activeType ? `&type=${activeType}` : ''}`} style={{ textDecoration: 'none' }}>
                                                    <div style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E0D8CC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', cursor: 'pointer' }}>
                                                        <IconChevronR />
                                                    </div>
                                                </Link>
                                            )}
                                            {pagesRange.map(p => (
                                                <Link key={p} href={`/shop?sort=${sortBy}&page=${p}${activeType ? `&type=${activeType}` : ''}`} style={{ textDecoration: 'none' }}>
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
                                                <Link href={`/shop?sort=${sortBy}&page=${page + 1}${activeType ? `&type=${activeType}` : ''}`} style={{ textDecoration: 'none' }}>
                                                    <div style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E0D8CC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', cursor: 'pointer' }}>
                                                        <IconChevronL />
                                                    </div>
                                                </Link>
                                            )}
                                        </div>
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
