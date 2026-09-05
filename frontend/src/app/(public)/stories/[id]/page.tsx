import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { imgUrl } from '@/lib/imgUrl'
import { IconCalendar } from '@/components/ui/Icon'
import StorySidebar from './StorySidebar'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

interface Story {
    id: string
    title: string | null
    content: string
    mediaUrl: string | null
    views: number
    createdAt: string
}

interface PageProps { params: Promise<{ id: string }> }

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

function calcReadTime(html: string) {
    const words = html.replace(/<[^>]*>/g, '').trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
}

async function getStory(id: string): Promise<Story | null> {
    try {
        const res = await fetch(`${API}/stories/${id}`, { next: { revalidate: 60 } })
        if (!res.ok) return null
        const json = await res.json() as { data: Story }
        return json.data
    } catch { return null }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const story = await getStory(id)
    return {
        title: story?.title ? `${story.title} | یاری‌جو` : 'داستان | یاری‌جو',
        description: story?.content.replace(/<[^>]*>/g, '').slice(0, 160),
    }
}

export default async function StoryDetailPage({ params }: PageProps) {
    const { id } = await params
    const story = await getStory(id)
    if (!story) notFound()

    const src = imgUrl(story.mediaUrl)
    const date = story.createdAt
        ? new Date(story.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
        : null
    const readTime = calcReadTime(story.content)

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh', direction: 'rtl' }}>

            {/* ── Breadcrumb bar ── */}
            <div style={{ background: '#1B4332' }}>
                <div className="max-w-[1280px] mx-auto px-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
                            className="hover:!text-white transition-colors">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            صفحه اصلی
                        </Link>
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>/</span>
                        <Link href="/stories" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none' }}
                            className="hover:!text-white transition-colors">
                            داستان‌ها
                        </Link>
                        {story.title && (
                            <>
                                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>/</span>
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {story.title}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ══════════ SIDEBAR (Client Component) ══════════ */}
                    <StorySidebar coverSrc={src} title={story.title} />

                    {/* ══════════ MAIN CONTENT ══════════ */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                            borderRadius: 20, padding: 24,
                            boxShadow: '0 4px 20px rgba(27,67,50,0.18)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
                                <div style={{ width: 4, minHeight: 28, borderRadius: 99, background: 'linear-gradient(to bottom,#52B788,rgba(82,183,136,0.3))', flexShrink: 0, marginTop: 4 }} />
                                <h1 style={{ fontSize: 22, fontWeight: 900, color: '#F0F0F0', margin: 0, lineHeight: 1.6 }}>
                                    {story.title ?? 'داستان'}
                                </h1>
                            </div>

                            {/* Meta badges */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <IconCalendar size={13} color="rgba(255,255,255,0.7)" />
                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{date}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{toFarsi(readTime)} دقیقه</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{toFarsi(story.views)} بازدید</span>
                                </div>
                            </div>
                        </div>

                        {/* Story body */}
                        <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', border: '1px solid #EDE6D6', boxShadow: '0 2px 8px rgba(27,67,50,0.05)' }}>
                            <style>{`
                                .story-body { font-size:15px; line-height:2.1; color:#2C2C2E; text-align:justify; }
                                .story-body p { margin:0 0 16px; }
                                .story-body p:last-child { margin-bottom:0; }
                                .story-body h1,.story-body h2,.story-body h3 { color:#1C1C1E; font-weight:700; margin:20px 0 12px; line-height:1.5; }
                                .story-body h2 { font-size:17px; }
                                .story-body h3 { font-size:15px; }
                                .story-body ul,.story-body ol { padding-right:20px; margin:0 0 16px; }
                                .story-body li { margin-bottom:8px; }
                                .story-body strong { font-weight:700; color:#1C1C1E; }
                                .story-body blockquote { border-right:3px solid #1B4332; padding:12px 16px; margin:16px 0; background:#F3EDE3; border-radius:0 12px 12px 0; color:#5C5C5E; }
                                .story-body a { color:#1B4332; text-decoration:underline; }
                                .story-body span[style*="font-size"] { font-size:inherit!important; }
                            `}</style>
                            <div className="story-body" dangerouslySetInnerHTML={{ __html: story.content }} />
                        </div>

                        {/* Footer nav */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                            <Link href="/stories" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', textDecoration: 'none' }}
                                className="hover:!text-[#1B4332] transition-colors">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                                بازگشت به داستان‌ها
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                امیدواریم این داستان الهام‌بخش بوده باشد
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
