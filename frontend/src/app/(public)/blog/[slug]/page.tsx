import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarijoo.com'

interface BlogPost {
    id: string
    slug: string
    title: string
    excerpt: string | null
    content: string
    coverImage: string | null
    publishedAt: string | null
    views: number
    readTime: number | null
    tags: string[]
}

interface PageProps { params: Promise<{ slug: string }> }

function imgUrl(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    return path.startsWith('/') ? path : `/${path}`
}

async function getPost(slug: string): Promise<BlogPost | null> {
    try {
        const res = await fetch(`${API}/blog/${slug}`, { cache: 'no-store' })
        if (!res.ok) return null
        const json = await res.json() as { data: BlogPost }
        return json.data
    } catch { return null }
}

async function getRelated(slug: string): Promise<BlogPost[]> {
    try {
        const res = await fetch(`${API}/blog?limit=3`, { cache: 'no-store' })
        if (!res.ok) return []
        const json = await res.json() as { data: { posts: BlogPost[] } }
        return (json.data?.posts ?? []).filter(p => p.slug !== slug).slice(0, 3)
    } catch { return [] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getPost(slug)
    if (!post) return { title: 'مقاله | یاری‌جو' }
    const img = imgUrl(post.coverImage)
    return {
        title: `${post.title} | یاری‌جو`,
        description: post.excerpt ?? undefined,
        openGraph: {
            title: post.title,
            description: post.excerpt ?? '',
            url: `${siteUrl}/blog/${slug}`,
            type: 'article',
            locale: 'fa_IR',
            images: img ? [{ url: img, width: 1200, height: 630 }] : [],
        },
        alternates: { canonical: `${siteUrl}/blog/${slug}` },
    }
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params
    const [post, related] = await Promise.all([getPost(slug), getRelated(slug)])
    if (!post) notFound()

    const src = imgUrl(post.coverImage)
    const date = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
        : ''

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            <article className="max-w-3xl mx-auto px-5 py-12">
                {/* Back */}
                <Link href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-semibold mb-8 hover:opacity-70 transition-opacity"
                    style={{ color: '#1B4332' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                    بازگشت به مجله
                </Link>

                {/* Cover image */}
                {src && (
                    <div className="rounded-2xl overflow-hidden mb-8 shadow-md" style={{ maxHeight: '420px' }}>
                        <img src={src} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Meta */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4 flex-wrap text-sm" style={{ color: '#8C8C8E' }}>
                        {date && <span>📅 {date}</span>}
                        {post.readTime && <span>⏱ {post.readTime} دقیقه مطالعه</span>}
                        <span>👁 {post.views.toLocaleString('fa-IR')} بازدید</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black mb-4 leading-relaxed" style={{ color: '#1C1C1E' }}>
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-base leading-relaxed mb-4" style={{ color: '#5C5C5E' }}>
                            {post.excerpt}
                        </p>
                    )}

                    {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div
                    className="rounded-2xl p-6 md:p-8 mb-10 border"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}
                >
                    <div
                        className="blog-content"
                        style={{
                            fontSize: '16px',
                            lineHeight: '2.2',
                            color: '#2C2C2E',
                            direction: 'rtl',
                        }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>

                {/* Share */}
                <div className="flex items-center gap-3 py-5 border-t border-b mb-10 flex-wrap" style={{ borderColor: '#EDE6D6' }}>
                    <span className="text-sm font-semibold" style={{ color: '#5C5C5E' }}>اشتراک‌گذاری:</span>
                    {[
                        { label: '📱 واتساپ', bg: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(post.title + ' ' + siteUrl + '/blog/' + slug)}` },
                        { label: '✈️ تلگرام', bg: '#2CA5E0', href: `https://t.me/share/url?url=${encodeURIComponent(siteUrl + '/blog/' + slug)}&text=${encodeURIComponent(post.title)}` },
                    ].map(s => (
                        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                            style={{ background: s.bg }}>
                            {s.label}
                        </a>
                    ))}
                </div>

                {/* Related */}
                {related.length > 0 && (
                    <section>
                        <h2 className="text-xl font-black mb-5" style={{ color: '#1C1C1E' }}>مقالات مرتبط</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {related.map(p => {
                                const rsrc = imgUrl(p.coverImage)
                                return (
                                    <Link key={p.id} href={`/blog/${p.slug}`}
                                        className="group block rounded-2xl overflow-hidden border hover:-translate-y-1 hover:shadow-md transition-all"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        <div className="aspect-[16/9] overflow-hidden" style={{ background: '#F3EDE3' }}>
                                            {rsrc
                                                ? <img src={rsrc} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                                : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📰</div>}
                                        </div>
                                        <div className="p-3">
                                            <p className="font-semibold text-sm line-clamp-2 group-hover:text-[#1B4332] transition-colors" style={{ color: '#1C1C1E' }}>
                                                {p.title}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                )}
            </article>

            <style>{`
                .blog-content h1, .blog-content h2, .blog-content h3 { font-weight: 800; margin: 24px 0 12px; color: #1C1C1E; }
                .blog-content h2 { font-size: 20px; }
                .blog-content h3 { font-size: 17px; }
                .blog-content p { margin: 0 0 14px; }
                .blog-content ul, .blog-content ol { padding-right: 24px; margin: 0 0 14px; }
                .blog-content li { margin-bottom: 8px; }
                .blog-content strong { font-weight: 700; }
                .blog-content a { color: #1B4332; text-decoration: underline; }
                .blog-content img { border-radius: 12px; max-width: 100%; margin: 16px 0; }
                .blog-content blockquote { border-right: 4px solid #1B4332; padding-right: 16px; margin: 16px 0; color: #5C5C5E; font-style: italic; }
            `}</style>
        </div>
    )
}
