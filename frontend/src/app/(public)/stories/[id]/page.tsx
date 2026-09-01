import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

interface Story {
    id: string
    title: string | null
    content: string
    mediaUrl: string | null
    views: number
    createdAt: string
}

interface PageProps {
    params: Promise<{ id: string }>
}

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
    } catch {
        return null
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const story = await getStory(id)
    return {
        title: story?.title ? `${story.title} | یاری‌جو` : 'داستان | یاری‌جو',
    }
}

export default async function StoryDetailPage({ params }: PageProps) {
    const { id } = await params
    const story = await getStory(id)
    if (!story) notFound()

    const src = storyImg(story.mediaUrl)

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            <div className="max-w-3xl mx-auto px-5 py-12">
                {/* Back */}
                <Link href="/stories" className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-opacity hover:opacity-70"
                    style={{ color: '#1B4332' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    بازگشت به داستان‌ها
                </Link>

                {/* Cover */}
                {src && (
                    <div className="rounded-2xl overflow-hidden mb-8 shadow-lg" style={{ maxHeight: '400px' }}>
                        <img src={src} alt={story.title ?? 'داستان'} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Title */}
                {story.title && (
                    <h1 className="text-2xl md:text-3xl font-black mb-6 leading-relaxed" style={{ color: '#1C1C1E' }}>
                        {story.title}
                    </h1>
                )}

                {/* Content */}
                <article
                    className="prose-fa text-[16px] leading-[2] rounded-2xl p-8 border"
                    style={{
                        background: 'white',
                        borderColor: '#EDE6D6',
                        color: '#2C2C2E',
                        lineHeight: '2.2',
                    }}
                    dangerouslySetInnerHTML={{ __html: story.content }}
                />

                {/* Footer */}
                <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#8C8C8E' }}>
                        👁 {story.views.toLocaleString('fa-IR')} بازدید
                    </span>
                    <Link href="/stories" className="text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: '#1B4332' }}>
                        داستان‌های بیشتر ←
                    </Link>
                </div>
            </div>
        </div>
    )
}
