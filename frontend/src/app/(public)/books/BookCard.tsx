'use client'

import Link from 'next/link'
import { imgUrl } from '@/lib/imgUrl'

interface Book {
    id: string
    slug: string
    title: string
    author: string
    coverImage: string | null
    price: number
    isPremium: boolean
    totalPages: number | null
    createdAt?: string | null
    category?: { name: string } | null
    _count?: { reviews: number }
}

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

function fmtDate(iso?: string | null) {
    if (!iso) return ''
    try {
        return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short' })
    } catch { return '' }
}

function IconBookPlaceholder() {
    return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}

export default function BookCard({ book }: { book: Book }) {
    const src = imgUrl(book.coverImage)
    const date = fmtDate(book.createdAt)
    const reviewCount = book._count?.reviews ?? 0
    const categoryName = book.category?.name

    return (
        <div
            className="group flex flex-col gap-0 rounded-2xl overflow-hidden border transition-all duration-300"
            style={{
                background: 'white',
                borderColor: '#EDE6D6',
                boxShadow: '0 2px 10px rgba(27,67,50,0.06)',
            }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 10px 30px rgba(27,67,50,0.13)'
                el.style.borderColor = '#A8D5B5'
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 2px 10px rgba(27,67,50,0.06)'
                el.style.borderColor = '#EDE6D6'
            }}
        >
            {/* ── Cover ── */}
            <Link href={`/books/${book.slug}`} style={{ display: 'block', textDecoration: 'none', position: 'relative' }}>
                <div style={{
                    position: 'relative', aspectRatio: '3/4', overflow: 'hidden',
                    background: 'linear-gradient(145deg,#EDE6D6,#D8CEBC)',
                }}>
                    {src ? (
                        <img src={src} alt={book.title} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{ display: 'block' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 }}>
                            <div style={{ color: '#B8A88A' }}><IconBookPlaceholder /></div>
                            <p style={{ fontSize: 10, textAlign: 'center', color: '#A89878', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {book.title}
                            </p>
                        </div>
                    )}

                    {/* hover overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                        style={{ background: 'linear-gradient(to top, rgba(27,67,50,0.6) 0%, transparent 55%)' }} />

                    {/* premium badge */}
                    {book.isPremium && (
                        <span style={{
                            position: 'absolute', top: 8, right: 8,
                            background: 'linear-gradient(135deg,#B8860B,#D4A017)',
                            color: 'white', fontSize: 9, fontWeight: 800,
                            padding: '3px 8px', borderRadius: 6,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}>
                            پریمیوم
                        </span>
                    )}

                    {/* free badge */}
                    {book.price === 0 && (
                        <span style={{
                            position: 'absolute', top: 8, left: 8,
                            background: '#D1FAE5', color: '#065F46',
                            fontSize: 9, fontWeight: 800,
                            padding: '3px 8px', borderRadius: 6,
                        }}>
                            رایگان
                        </span>
                    )}

                    {/* chapters badge */}
                    {book.totalPages && book.totalPages > 0 && (
                        <span style={{
                            position: 'absolute', bottom: 8, right: 8,
                            background: 'rgba(27,67,50,0.85)', backdropFilter: 'blur(4px)',
                            color: 'white', fontSize: 9, fontWeight: 600,
                            padding: '3px 8px', borderRadius: 6,
                            display: 'flex', alignItems: 'center', gap: 3,
                        }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                            {toFarsi(book.totalPages)} فصل
                        </span>
                    )}
                </div>
            </Link>

            {/* ── Info ── */}
            <div style={{ padding: '12px 13px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>

                {/* title */}
                <Link href={`/books/${book.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-[#1B4332] transition-colors"
                        style={{ color: '#1C1C1E', margin: 0 }}
                        title={book.title}>
                        {book.title}
                    </h3>
                </Link>

                {/* author */}
                {book.author && (
                    <p style={{ fontSize: 11, color: '#8C8C8E', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {book.author}
                    </p>
                )}

                {/* meta row: امتیاز، دسته، تاریخ، نظرات */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 10px' }}>

                    {/* امتیاز */}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#F59E0B' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span style={{ fontWeight: 600 }}>۵.۰</span>
                    </span>

                    {/* نظرات */}
                    {reviewCount > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#9CA3AF' }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            {toFarsi(reviewCount)} نظر
                        </span>
                    )}

                    {/* دسته‌بندی */}
                    {categoryName && (
                        <span style={{ fontSize: 10, color: '#1B4332', fontWeight: 600 }}>
                            {categoryName}
                        </span>
                    )}

                    {/* تاریخ */}
                    {date && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#9CA3AF' }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {date}
                        </span>
                    )}
                </div>

                {/* divider */}
                <div style={{ height: 1, background: '#F3EDE3', margin: '2px 0' }} />

                {/* price + cta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                        fontSize: 14, fontWeight: 900,
                        color: book.price === 0 ? '#1B4332' : '#1C1C1E',
                    }}>
                        {book.price === 0
                            ? 'رایگان'
                            : `${toFarsi(book.price.toLocaleString())} ت`}
                    </span>

                    <Link href={`/books/${book.slug}`}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 700,
                            background: '#1B4332', color: 'white',
                            padding: '5px 12px', borderRadius: 8,
                            textDecoration: 'none', transition: 'opacity .2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        مطالعه
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}
