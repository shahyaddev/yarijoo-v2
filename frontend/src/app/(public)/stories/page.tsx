import type { Metadata } from 'next'
import Link from 'next/link'
import { imgUrl } from '@/lib/imgUrl'

export const revalidate = 60

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'داستان‌های روانشناختی | یاری‌جو',
    description: 'داستان‌های کوتاه روانشناختی برای رشد شخصی و شناخت بهتر خود',
}

interface Story {
    id: string
    title: string | null
    content: string
    mediaUrl: string | null
}

interface StoryResponse {
    stories?: Story[]
    total?: number
}

interface PageProps {
    searchParams: Promise<{ page?: string }>
}

function storyImg(path: string | null | undefined): string | null {
    return imgUrl(path)
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().slice(0, 150)
}

async function getStories(page = 1) {
    try {
        const res = await fetch(`${API}/stories?limit=24&page=${page}`, { cache: 'no-store' })
        if (!res.ok) return { stories: [], total: 0 }
        const text = await res.text()
        const json = JSON.parse(text) as { data: Story[] | StoryResponse }
        const d = json.data
        if (Array.isArray(d)) return { stories: d as Story[], total: d.length }
        return { stories: (d as StoryResponse).stories ?? [], total: (d as StoryResponse).total ?? 0 }
    } catch {
        return { stories: [], total: 0 }
    }
}

export default async function StoriesPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Number(params.page ?? 1)
    const { stories, total } = await getStories(page)
    const totalPages = Math.ceil(total / 24) || 1

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: '#1B4332' }} className="py-14 px-5">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">داستان‌های روانشناختی</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-lg">
                        {total > 0 ? `${total.toLocaleString('fa-IR')} داستان کوتاه` : 'داستان‌های آموزنده روانشناسی'}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 py-10">
                {stories.length === 0 ? (
                    <p className="text-center py-24 text-lg" style={{ color: '#8C8C8E' }}>داستانی یافت نشد</p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-10">
                            {stories.map((s) => {
                                const src = storyImg(s.mediaUrl)
                                const excerpt = s.content ? stripHtml(s.content) : ''
                                return (
                                    <Link
                                        key={s.id}
                                        href={`/stories/${s.id}`}
                                        className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}
                                    >
                                        <div className="aspect-[3/4] overflow-hidden relative"
                                            style={{ background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}>
                                            {src ? (
                                                <img src={src} alt={s.title ?? 'داستان'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📖</div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            {s.title && (
                                                <div className="absolute bottom-0 inset-x-0 p-2">
                                                    <p className="text-white text-[11px] font-bold line-clamp-2 leading-tight">{s.title}</p>
                                                </div>
                                            )}
                                        </div>
                                        {excerpt && (
                                            <div className="p-3">
                                                <p className="text-[11px] line-clamp-3 leading-relaxed" style={{ color: '#8C8C8E' }}>{excerpt}</p>
                                            </div>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {page > 1 && (
                                    <Link href={`/stories?page=${page - 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-colors"
                                        style={{ background: 'white', color: '#1C1C1E', border: '1px solid #EDE6D6' }}>›</Link>
                                )}
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    const p = i + 1
                                    return (
                                        <Link key={p} href={`/stories?page=${p}`}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors"
                                            style={p === page
                                                ? { background: '#1B4332', color: 'white' }
                                                : { background: 'white', color: '#5C5C5E', border: '1px solid #EDE6D6' }}>
                                            {p.toLocaleString('fa-IR')}
                                        </Link>
                                    )
                                })}
                                {page < totalPages && (
                                    <Link href={`/stories?page=${page + 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-colors"
                                        style={{ background: 'white', color: '#1C1C1E', border: '1px solid #EDE6D6' }}>‹</Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
