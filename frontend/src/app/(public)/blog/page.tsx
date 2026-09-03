import type { Metadata } from 'next'
import Link from 'next/link'
import { imgUrl } from '@/lib/imgUrl'

export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarijoo.com'
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'مجله روانشناسی | یاری‌جو',
    description: 'آخرین مقالات تخصصی سلامت روان — اضطراب، افسردگی، استرس، شخصیت‌شناسی',
    openGraph: {
        title: 'مجله روانشناسی | یاری‌جو',
        description: 'آخرین مقالات تخصصی سلامت روان',
        url: `${siteUrl}/blog`,
        type: 'website',
        locale: 'fa_IR',
    },
    alternates: { canonical: `${siteUrl}/blog` },
}

interface BlogPost {
    id: string
    slug: string
    title: string
    excerpt: string | null
    coverImage: string | null
    publishedAt: string | null
    views: number
    readTime: number | null
}

interface PageProps {
    searchParams: Promise<{ page?: string; category?: string }>
}


async function getPosts(page = 1) {
    try {
        const res = await fetch(`${API}/blog?limit=12&page=${page}`, { next: { revalidate: 300 } })
        if (!res.ok) return { posts: [], total: 0 }
        const data = await res.json() as { data: { posts: BlogPost[]; total: number } }
        return { posts: data.data?.posts ?? [], total: data.data?.total ?? 0 }
    } catch {
        return { posts: [], total: 0 }
    }
}

export default async function BlogPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Number(params.page ?? 1)
    const { posts, total } = await getPosts(page)
    const totalPages = Math.ceil(total / 12)
    const [featured, ...rest] = posts

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: '#1B4332' }} className="py-14 px-5">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">مجله روانشناسی</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-lg">
                        آخرین مقالات تخصصی سلامت روان — {total.toLocaleString('fa-IR')} مقاله
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 py-10">
                {posts.length === 0 ? (
                    <p className="text-center py-24 text-lg" style={{ color: '#8C8C8E' }}>مقاله‌ای یافت نشد</p>
                ) : (
                    <>
                        {/* Featured */}
                        {featured && (
                            <Link
                                href={`/blog/${featured.slug}`}
                                className="group block rounded-2xl overflow-hidden border mb-10 transition-all hover:-translate-y-1"
                                style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 4px 20px rgba(27,67,50,0.08)' }}
                            >
                                <div className="md:flex">
                                    <div className="md:w-2/5 h-56 md:h-auto overflow-hidden" style={{ background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}>
                                        {imgUrl(featured.coverImage) ? (
                                            <img
                                                src={imgUrl(featured.coverImage)!}
                                                alt={featured.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">📰</div>
                                        )}
                                    </div>
                                    <div className="p-8 flex flex-col justify-center">
                                        <span className="text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block" style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                            ویژه
                                        </span>
                                        <h2 className="text-2xl font-black mb-3 group-hover:text-[#1B4332] transition-colors" style={{ color: '#1C1C1E' }}>
                                            {featured.title}
                                        </h2>
                                        {featured.excerpt && (
                                            <p className="text-sm leading-relaxed line-clamp-3 mb-4" style={{ color: '#8C8C8E' }}>
                                                {featured.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs" style={{ color: '#8C8C8E' }}>
                                            {featured.publishedAt && (
                                                <span>{new Date(featured.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            )}
                                            <span>{featured.views.toLocaleString('fa-IR')} بازدید</span>
                                            <span className="font-semibold" style={{ color: '#1B4332' }}>ادامه مطلب ←</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                            {rest.map((post) => {
                                const src = imgUrl(post.coverImage)
                                return (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                                        style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 2px 8px rgba(27,67,50,0.06)' }}
                                    >
                                        <div className="aspect-[16/9] overflow-hidden" style={{ background: '#F3EDE3' }}>
                                            {src ? (
                                                <img src={src} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📰</div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-[15px] mb-2 line-clamp-2 group-hover:text-[#1B4332] transition-colors" style={{ color: '#1C1C1E' }}>
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-[13px] line-clamp-2 mb-3" style={{ color: '#8C8C8E' }}>
                                                    {post.excerpt}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-[12px]" style={{ color: '#8C8C8E' }}>
                                                {post.publishedAt && (
                                                    <span>{new Date(post.publishedAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}</span>
                                                )}
                                                <span className="font-semibold" style={{ color: '#1B4332' }}>ادامه مطلب ←</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {page > 1 && (
                                    <Link
                                        href={`/blog?page=${page - 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl border font-bold transition-colors"
                                        style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                                    >
                                        ›
                                    </Link>
                                )}
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    const p = i + 1
                                    return (
                                        <Link
                                            key={p}
                                            href={`/blog?page=${p}`}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors"
                                            style={
                                                p === page
                                                    ? { background: '#1B4332', color: 'white' }
                                                    : { borderColor: '#EDE6D6', background: 'white', color: '#5C5C5E', border: '1px solid #EDE6D6' }
                                            }
                                        >
                                            {p.toLocaleString('fa-IR')}
                                        </Link>
                                    )
                                })}
                                {page < totalPages && (
                                    <Link
                                        href={`/blog?page=${page + 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl border font-bold transition-colors"
                                        style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                                    >
                                        ‹
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
