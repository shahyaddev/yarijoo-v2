'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

interface BookPage { index: number; title: string; content: string }
interface Book {
    id: string; slug: string; title: string; author: string
    coverImage: string | null; price: number; isPremium: boolean
}
interface Props { book: Book; coverSrc: string | null; pages: BookPage[] }

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

// ─── Themes ──────────────────────────────────────────────────────────────────
const THEMES = {
    cream:  { label: 'کرم',    bg: '#FAF7F2', content: '#F3EDE3', text: '#2C2C2E', title: '#1B4332', border: '#DDD5C5', dot: '#1B4332' },
    white:  { label: 'سفید',   bg: '#FFFFFF', content: '#F8F8F8', text: '#1C1C1E', title: '#1B4332', border: '#E0E0E0', dot: '#1B4332' },
    sepia:  { label: 'سپیا',   bg: '#F5ECD7', content: '#EDE0C4', text: '#3D2B1F', title: '#5C3D1E', border: '#C8B896', dot: '#5C3D1E' },
    forest: { label: 'جنگلی',  bg: '#E8F5EE', content: '#D8EAE0', text: '#1B3A2A', title: '#1B4332', border: '#9DC4AE', dot: '#1B4332' },
    night:  { label: 'شب',     bg: '#1A1D23', content: '#22262E', text: '#DDE1E7', title: '#52B788', border: '#2E3440', dot: '#52B788' },
} as const
type ThemeKey = keyof typeof THEMES

export default function BookReaderClient({ book, pages }: Props) {
    const [cur, setCur] = useState(0)
    const [fontSize, setFontSize] = useState(17)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [theme, setTheme] = useState<ThemeKey>('cream')
    const topRef = useRef<HTMLDivElement>(null)
    const total = pages.length
    const currentPage = pages[cur] ?? null
    const t = THEMES[theme]

    // Scroll to top on page change
    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [cur])

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') prev()
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next()
            if (e.key === 'Escape') setSettingsOpen(false)
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    })

    const prev = useCallback(() => { if (cur > 0) setCur(p => p - 1) }, [cur])
    const next = useCallback(() => { if (cur < total - 1) setCur(p => p + 1) }, [cur, total])

    return (
        <div ref={topRef} style={{ width: '100%', minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>

            {/* ── Settings Modal ── */}
            {settingsOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                    onClick={() => setSettingsOpen(false)}
                >
                    <div
                        style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE6D6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                <span style={{ fontWeight: 700, color: '#1C1C1E', fontSize: 15 }}>تنظیمات خواندن</span>
                            </div>
                            <button onClick={() => setSettingsOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C8C8E', fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
                        </div>

                        {/* Font size preview */}
                        <div style={{ padding: '12px 20px', background: t.content, borderBottom: '1px solid #EDE6D6', textAlign: 'center' }}>
                            <span style={{ fontSize: `${fontSize}px`, color: t.text, fontWeight: 500 }}>نمونه متن — اندازه {toFarsi(fontSize)}</span>
                        </div>

                        {/* ── Font size ── */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3EDE3' }}>
                            <p style={{ fontSize: 12, color: '#8C8C8E', margin: '0 0 10px', fontWeight: 600 }}>اندازه متن</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                {/* Increase */}
                                <button onClick={() => setFontSize(f => Math.min(24, f + 1))}
                                    style={{ height: 48, borderRadius: 12, background: '#1B4332', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, fontFamily: 'inherit' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                    افزایش
                                </button>
                                {/* Decrease */}
                                <button onClick={() => setFontSize(f => Math.max(12, f - 1))}
                                    style={{ height: 48, borderRadius: 12, background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, fontFamily: 'inherit' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                    کاهش
                                </button>
                                {/* Reset */}
                                <button onClick={() => setFontSize(17)}
                                    style={{ height: 48, borderRadius: 12, background: '#E8E0D0', color: '#5C5C5E', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, fontFamily: 'inherit' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                    پیش‌فرض
                                </button>
                            </div>
                        </div>

                        {/* ── Theme ── */}
                        <div style={{ padding: '16px 20px' }}>
                            <p style={{ fontSize: 12, color: '#8C8C8E', margin: '0 0 10px', fontWeight: 600 }}>تم خواندن</p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, th]) => (
                                    <button key={key} onClick={() => setTheme(key)}
                                        style={{
                                            flex: 1, minWidth: 60, height: 52, borderRadius: 12,
                                            background: th.content, border: `2px solid ${key === theme ? th.dot : th.border}`,
                                            cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center', gap: 4,
                                            transition: 'border-color .15s', fontFamily: 'inherit',
                                            boxShadow: key === theme ? `0 0 0 2px ${th.dot}40` : 'none',
                                        }}>
                                        {/* Color dot */}
                                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: th.dot, border: '2px solid rgba(0,0,0,0.1)' }} />
                                        <span style={{ fontSize: 11, color: th.text, fontWeight: key === theme ? 700 : 500 }}>{th.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Close */}
                        <div style={{ padding: '0 20px 18px', textAlign: 'center' }}>
                            <button onClick={() => setSettingsOpen(false)}
                                style={{ background: 'none', border: '1px solid #EDE6D6', borderRadius: 12, padding: '8px 32px', color: '#8C8C8E', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                                بستن
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Top bar ── */}
            <div style={{ background: '#1B4332', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

                    {/* Book title link */}
                    <Link href={`/books/${book.slug}`}
                        style={{ color: '#52B788', fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, transition: 'opacity .2s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        {book.title}
                    </Link>

                    {/* Page number pills — desktop */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', flexShrink: 1, padding: '2px 0' }}
                        className="hidden lg:flex scrollbar-none">
                        {pages.map((_, i) => (
                            <button key={i} onClick={() => setCur(i)}
                                style={{
                                    minWidth: 38, height: 38, borderRadius: 10, border: 'none',
                                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                    fontFamily: 'inherit', transition: 'all .15s',
                                    ...(i === cur
                                        ? { background: '#52B788', color: '#1B4332' }
                                        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }),
                                }}
                                onMouseEnter={e => { if (i !== cur) (e.currentTarget.style.background = 'rgba(255,255,255,0.18)') }}
                                onMouseLeave={e => { if (i !== cur) (e.currentTarget.style.background = 'rgba(255,255,255,0.1)') }}
                            >
                                {toFarsi(i + 1)}
                            </button>
                        ))}
                    </div>

                    {/* Mobile: page indicator */}
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }} className="lg:hidden">
                        {toFarsi(cur + 1)} / {toFarsi(total)}
                    </span>

                    {/* Settings button */}
                    <button onClick={() => setSettingsOpen(true)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', flexShrink: 0, transition: 'background .2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: t.border }}>
                <div style={{ height: '100%', background: t.dot, width: `${Math.round(((cur + 1) / total) * 100)}%`, transition: 'width .3s ease' }} />
            </div>

            {/* ── Content ── */}
            <div style={{ flex: 1, background: t.content, paddingBottom: 40 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>

                    {/* Chapter title */}
                    {currentPage && (
                        <h3 style={{
                            fontSize: 22, fontWeight: 900, color: t.title,
                            textAlign: 'center', padding: '24px 0 20px',
                            borderBottom: `2px solid ${t.border}`, marginBottom: 28,
                        }}>
                            {currentPage.title}
                        </h3>
                    )}

                    {/* Body text */}
                    <div>
                        <style>{`
                            .reader-body p { margin: 0 0 16px; }
                            .reader-body h1,.reader-body h2,.reader-body h3 { font-weight:700; margin:20px 0 12px; line-height:1.5; }
                            .reader-body h2 { font-size:1.15em; }
                            .reader-body h3 { font-size:1.05em; }
                            .reader-body ul,.reader-body ol { padding-right:22px; margin:0 0 16px; }
                            .reader-body li { margin-bottom:8px; }
                            .reader-body strong { font-weight:700; }
                            .reader-body a { text-decoration:underline; }
                            .reader-body span[style*="font-size"] { font-size:inherit !important; }
                        `}</style>
                        <div
                            className="reader-body"
                            style={{ fontSize: `${fontSize}px`, lineHeight: 2.1, color: t.text, textAlign: 'justify', direction: 'rtl' }}
                            dangerouslySetInnerHTML={{ __html: currentPage?.content ?? '' }}
                        />
                    </div>

                    {/* ── Prev / Next buttons ── */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48 }}>

                        {/* Prev */}
                        <button onClick={prev}
                            style={{
                                maxWidth: 180, width: '100%', height: 56, borderRadius: 16,
                                border: `2px solid ${t.border}`, background: 'transparent',
                                color: t.text, fontSize: 14, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                cursor: cur === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all .2s', fontFamily: 'inherit',
                                visibility: cur === 0 ? 'hidden' : 'visible',
                                opacity: cur === 0 ? 0 : 1,
                            }}
                            onMouseEnter={e => { if (cur > 0) { (e.currentTarget as HTMLElement).style.borderColor = t.dot; (e.currentTarget as HTMLElement).style.color = t.dot } }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = t.border; (e.currentTarget as HTMLElement).style.color = t.text }}
                        >
                            {/* arrow right (RTL = go back) */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                            صفحه قبلی
                        </button>

                        {/* Next */}
                        <button onClick={next}
                            style={{
                                maxWidth: 340, width: '100%', height: 56, borderRadius: 16,
                                border: 'none', background: t.dot,
                                color: theme === 'night' ? '#1A1D23' : 'white',
                                fontSize: 14, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                cursor: cur >= total - 1 ? 'not-allowed' : 'pointer',
                                transition: 'opacity .2s', fontFamily: 'inherit',
                                boxShadow: `0 4px 16px ${t.dot}40`,
                                visibility: cur >= total - 1 ? 'hidden' : 'visible',
                                opacity: cur >= total - 1 ? 0 : 1,
                            }}
                            onMouseEnter={e => { if (cur < total - 1) (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                        >
                            صفحه بعدی
                            {/* arrow left (RTL = go forward) */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Finished */}
                    {cur >= total - 1 && total > 0 && (
                        <div style={{ textAlign: 'center', marginTop: 40, padding: '28px 24px', background: t.bg, borderRadius: 20, border: `1px solid ${t.border}` }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={t.dot} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <p style={{ fontSize: 17, fontWeight: 700, color: t.title, marginBottom: 6 }}>کتاب به پایان رسید</p>
                            <p style={{ fontSize: 13, color: t.text, opacity: .6, marginBottom: 20 }}>امیدواریم این کتاب برایتان مفید بوده باشد</p>
                            <Link href={`/books/${book.slug}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: t.dot, color: theme === 'night' ? '#1A1D23' : 'white', textDecoration: 'none', padding: '10px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700 }}>
                                بازگشت به کتاب
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
