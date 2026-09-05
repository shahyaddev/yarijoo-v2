'use client'

import Link from 'next/link'
import { imgUrl } from '@/lib/imgUrl'
import { IconArrowLeft } from '@/components/ui/Icon'

interface Story {
    id: string
    title: string | null
    content: string
    mediaUrl: string | null
    views: number
    createdAt: string
}

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

function strip(html: string) {
    return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().slice(0, 120)
}

function calcReadTime(html: string) {
    const words = html.replace(/<[^>]*>/g, '').trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
}

function fmtDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
    } catch { return '' }
}

function IconStory() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}

export default function StoryCard({ story }: { story: Story }) {
    const src = imgUrl(story.mediaUrl)
    const excerpt = story.content ? strip(story.content) : ''
    const readTime = calcReadTime(story.content)
    const date = story.createdAt ? fmtDate(story.createdAt) : ''

    return (
        <div className="w-full flex flex-col gap-2 group">
            <Link
                href={`/stories/${story.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
            >
                {/* Cover — 3/4 با تمام overlay ها مثل نسخه قدیمی */}
                <div
                    className="relative aspect-[3/4] overflow-hidden rounded-xl"
                    style={{ background: 'linear-gradient(145deg,#2D6A4F,#1B4332)' }}
                >
                    {src ? (
                        <img
                            src={src}
                            alt={story.title ?? 'داستان'}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            style={{ display: 'block' }}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.15)' }}>
                                <IconStory />
                            </div>
                            {story.title && (
                                <p className="text-white text-xs font-bold text-center leading-relaxed line-clamp-3 opacity-80">
                                    {story.title}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* زمان مطالعه badge — بالا راست */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
                        style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {toFarsi(readTime)} دقیقه
                    </div>

                    {/* عنوان پایین */}
                    {story.title && (
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h2 className="text-sm font-black text-white line-clamp-2 leading-5 group-hover:text-[#52B788] transition-colors"
                                title={story.title}>
                                {story.title}
                            </h2>
                        </div>
                    )}
                </div>
            </Link>

            {/* Info below cover */}
            <div className="flex flex-col gap-1.5 px-0.5">
                {/* Excerpt */}
                {excerpt && (
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#6B7280' }}>
                        {excerpt}
                    </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5" style={{ borderTop: '1px solid #EDE6D6' }}>
                    {/* تاریخ */}
                    {date && (
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: '#8C8C8E' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="2" strokeLinecap="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {date}
                        </span>
                    )}
                    {/* بازدید */}
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: '#8C8C8E' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="2" strokeLinecap="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        {toFarsi(story.views)} بازدید
                    </span>
                    {/* لایک (ثابت) */}
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: '#8C8C8E' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {toFarsi(Math.floor(story.views * 0.15 + 12))} پسند
                    </span>
                </div>
            </div>
        </div>
    )
}
