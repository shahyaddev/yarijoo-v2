import type { Metadata } from 'next'
import Link from 'next/link'
import { imgUrl } from '@/lib/imgUrl'
import BlogSidebar from './BlogSidebar'
import BlogCard from './BlogCard'
import BlogHero from './BlogHero'

export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarijoo.com'
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'مجله روانشناسی | یاری‌جو',
    description: 'آخرین مقالات تخصصی سلامت روان — اضطراب، افسردگی، استرس، شخصیت‌شناسی',
    openGraph: { title: 'مجله روانشناسی | یاری‌جو', url: `${siteUrl}/blog`, type: 'website', locale: 'fa_IR' },
}

interface BlogPost {
    id: string; slug: string; title: string; excerpt: string | null
    coverImage: string | null; publishedAt: string | null; views: number; readTime: number | null
}
interface Category { id: string; name: string; slug: string }

interface PageProps {
    searchParams: Promise<{ page?: string; category?: string; search?: string }>
}

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

async function getPosts(page = 1, category = '', search = '') {
    try {
        const p = new URLSearchParams({ limit: '12', page: String(page) })
        if (category) p.set('category', category)
        if (search) p.set('search', search)
        const res = await fetch(`${API}/blog?${p}`, { next: { revalidate: 300 } })
        if (!res.ok) return { posts: [] as BlogPost[], total: 0 }
        const data = await res.json() as { data: { posts: BlogPost[]; total: number } }
        return { posts: data.data?.posts ?? [], total: data.data?.total ?? 0 }
    } catch { return { posts: [] as BlogPost[], total: 0 } }
}

async function getCategories(): Promise<Category[]> {
    try {
        const res = await fetch(`${API}/blog/categories`, { next: { revalidate: 3600 } })
        if (!res.ok) return []
        const data = await res.json() as { data: Category[] }
        return data.data ?? []
    } catch { return [] }
}

function IconPen() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    )
}
function IconNewspaper() {
    return <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
}
function IconChevronR() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg> }
function IconChevronL() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg> }

export default async function BlogPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Math.max(1, Number(params.page ?? 1))
    const category = params.category ?? ''
    const search = params.search ?? ''

    const [{ posts, total }, categories] = await Promise.all([
        getPosts(page, category, search),
        getCategories(),
    ])

    const totalPages = Math.ceil(total / 12) || 1
    const [featured, ...rest] = posts

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
            <div style={{ background: '#FAF7F2', padding: '32px 16px 0' }}>
                <div className="max-w-[1280px] mx-auto">
                    <BlogHero total={total} categories={categories.length || 6} authors={5} />
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-[1280px] mx-auto px-4 py-8">
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                    {/* SIDEBAR */}
                    <BlogSidebar categories={categories} total={total} />

                    {/* MAIN */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {posts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                                <div style={{ width: 72, height: 72, borderRadius: 20, background: '#F3EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#C8B99A' }}>
                                    <IconNewspaper />
                                </div>
                                <p style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E', marginBottom: 6 }}>مقاله‌ای یافت نشد</p>
                                <p style={{ fontSize: 13, color: '#8C8C8E' }}>فیلتر دیگری امتحان کنید</p>
                            </div>
                        ) : (
                            <>
                                {/* مقاله ویژه */}
                                {featured && page === 1 && !search && !category && (
                                    <Link href={`/blog/${featured.slug}`}
                                        className="group block rounded-2xl overflow-hidden border transition-all duration-300 featured-card"
                                        style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 4px 20px rgba(27,67,50,0.08)', textDecoration: 'none' }}>
                                        <style>{`.featured-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(27,67,50,0.13)!important;border-color:#A8D5B5!important}`}</style>
                                        <div className="flex flex-col md:flex-row">
                                            <div className="md:w-2/5 overflow-hidden" style={{ background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)', minHeight: 200 }}>
                                                {imgUrl(featured.coverImage) ? (
                                                    <img src={imgUrl(featured.coverImage)!} alt={featured.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        style={{ display: 'block', minHeight: 200 }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8A88A' }}>
                                                        <IconNewspaper />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#EDF7F0', color: '#1B4332', display: 'inline-block', marginBottom: 14, width: 'fit-content' }}>
                                                    مقاله ویژه
                                                </span>
                                                <h2 className="group-hover:text-[#1B4332] transition-colors"
                                                    style={{ fontSize: 20, fontWeight: 900, color: '#1C1C1E', margin: '0 0 10px', lineHeight: 1.6 }}>
                                                    {featured.title}
                                                </h2>
                                                {featured.excerpt && (
                                                    <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.9, margin: '0 0 14px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                        {featured.excerpt}
                                                    </p>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: '#9CA3AF' }}>
                                                    {featured.publishedAt && (
                                                        <span>{new Date(featured.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                    )}
                                                    <span>{toFarsi(featured.views)} بازدید</span>
                                                    <span style={{ color: '#1B4332', fontWeight: 700 }}>ادامه مطلب</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Section title */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 4, height: 28, borderRadius: 99, background: 'linear-gradient(to bottom,#1B4332,rgba(27,67,50,0.3))' }} />
                                    <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1C1C1E', margin: 0 }}>همه مقالات</h2>
                                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, #EDE6D6, transparent)' }} />
                                    <span style={{ fontSize: 13, color: '#8C8C8E' }}>{toFarsi(total)} مقاله</span>
                                </div>

                                {/* Grid 3 ستونه */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {(page === 1 && !search && !category ? rest : posts).map(post => (
                                        <BlogCard key={post.id} post={post} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        {page > 1 && (
                                            <Link href={`/blog?page=${page - 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E0D8CC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', cursor: 'pointer' }}>
                                                    <IconChevronR />
                                                </div>
                                            </Link>
                                        )}
                                        {pagesRange.map(p => (
                                            <Link key={p} href={`/blog?page=${p}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`} style={{ textDecoration: 'none' }}>
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
                                            <Link href={`/blog?page=${page + 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E0D8CC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', cursor: 'pointer' }}>
                                                    <IconChevronL />
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
