import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    IconHeart,
    IconNewspaper,
    IconCalendar,
} from '@/components/ui/Icon'

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

function storyImg(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `/uploads/stories/${path.split('/').pop()}`
}

async function getStory(id: string): Promise<Story | null> {
    try {
        const res = await fetch(`${API}/stories`, { next: { revalidate: 60 } })
        if (!res.ok) return null
        const json = await res.json() as { data: Story[] | { stories: Story[] } }
        const stories = Array.isArray(json.data) ? json.data : (json.data as { stories: Story[] }).stories ?? []
        return stories.find(s => s.id === id) ?? null
    } catch { return null }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const story = await getStory(id)
    return { title: story?.title ? `${story.title} | یاری‌جو` : 'داستان | یاری‌جو' }
}

export default async function StoryDetailPage({ params }: PageProps) {
    const { id } = await params
    const story = await getStory(id)
    if (!story) notFound()

    const src = storyImg(story.mediaUrl)
    const date = story.createdAt
        ? new Date(story.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
        : null

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            {/* Top bar */}
            <div style={{ background: '#1B4332' }}>
                <div className="max-w-3xl mx-auto px-5 py-4">
                    <nav className="flex items-center gap-2 text-sm" aria-label="breadcrumb">
                        <Link href="/stories"
                            className="flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity"
                            style={{ color: 'rgba(255,255,255,0.75)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            داستان‌ها
                        </Link>
                        {story.title && (
                            <>
                                <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
                                <span className="truncate max-w-[200px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{story.title}</span>
                            </>
                        )}
                    </nav>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-5 py-10">

                {/* Cover image */}
                {src && (
                    <div className="rounded-2xl overflow-hidden mb-8"
                        style={{ maxHeight: 400, boxShadow: '0 4px 24px rgba(27,67,50,0.12)' }}>
                        <img src={src} alt={story.title ?? 'داستان'} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Title */}
                {story.title && (
                    <h1 className="text-2xl md:text-3xl font-black mb-4 leading-snug" style={{ color: '#1C1C1E' }}>
                        {story.title}
                    </h1>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mb-8 text-xs">
                    {date && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{ background: '#F3EDE3', color: '#6B7280' }}>
                            <IconCalendar size={11} color="#9CA3AF" />
                            {date}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: '#F3EDE3', color: '#6B7280' }}>
                        <IconNewspaper size={11} color="#9CA3AF" />
                        {story.views.toLocaleString('fa-IR')} بازدید
                    </span>
                </div>

                {/* Content */}
                <article
                    className="rounded-2xl p-6 md:p-8 border mb-8"
                    style={{ background: 'white', borderColor: '#EDE6D6', color: '#2C2C2E', fontSize: 16, lineHeight: '2.2' }}
                    dangerouslySetInnerHTML={{ __html: story.content }}
                />

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#9CA3AF' }}>
                        <IconHeart size={14} color="#9CA3AF" />
                        <span>امیدواریم این داستان برایتان الهام‌بخش بوده باشد</span>
                    </div>
                    <Link href="/stories"
                        className="flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
                        style={{ color: '#1B4332' }}>
                        داستان‌های بیشتر
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1B4332"
                            strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                            style={{ transform: 'rotate(180deg)' }}>
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}
