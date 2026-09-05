'use client'

import Link from 'next/link'
import { imgUrl } from '@/lib/imgUrl'

interface Post {
    id: string
    slug: string
    title: string
    excerpt: string | null
    coverImage: string | null
    publishedAt: string | null
    views: number
    readTime: number | null
}

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

function fmtDate(iso: string | null) {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }) }
    catch { return '' }
}

function IconNewspaper() {
    return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
}

export default function BlogCard({ post }: { post: Post }) {
    const src = imgUrl(post.coverImage)
    const date = fmtDate(post.publishedAt)

    return (
        <div className="group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300"
            style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 2px 8px rgba(27,67,50,0.05)' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 10px 28px rgba(27,67,50,0.12)'; el.style.borderColor = '#A8D5B5' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 8px rgba(27,67,50,0.05)'; el.style.borderColor = '#EDE6D6' }}>

            {/* تصویر */}
            <Link href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {src ? (
                        <img src={src} alt={post.title} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{ display: 'block' }} />
                    ) : (
                        <div style={{ color: '#B8A88A' }}><IconNewspaper /></div>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                        style={{ background: 'linear-gradient(to top, rgba(27,67,50,0.35) 0%, transparent 60%)' }} />
                </div>
            </Link>

            {/* محتوا */}
            <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>

                {/* عنوان */}
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1B4332', flexShrink: 0, marginTop: 7 }} />
                    <h3 className="font-bold text-sm line-clamp-2 leading-relaxed group-hover:text-[#1B4332] transition-colors"
                        style={{ color: '#1C1C1E', margin: 0 }}>
                        {post.title}
                    </h3>
                </Link>

                {/* meta */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px', paddingTop: 8, borderTop: '1px solid #F3EDE3', fontSize: 11, color: '#9CA3AF' }}>
                    {date && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            {date}
                        </span>
                    )}
                    {post.readTime && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            {toFarsi(post.readTime)} دقیقه
                        </span>
                    )}
                    {post.views > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            {toFarsi(post.views)}
                        </span>
                    )}
                </div>

                {/* دکمه مطالعه */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                    <Link href={`/blog/${post.slug}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 10, background: 'rgba(27,67,50,0.07)', color: '#1B4332', fontSize: 11, fontWeight: 700, textDecoration: 'none', transition: 'all .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1B4332'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,67,50,0.07)'; (e.currentTarget as HTMLElement).style.color = '#1B4332' }}>
                        مطالعه
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}
