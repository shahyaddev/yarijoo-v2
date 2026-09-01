'use client'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'

interface BookPage { index: number; title: string; content: string }
interface Book { id: string; slug: string; title: string; author: string; coverImage: string | null; price: number; isPremium: boolean }
interface Props { book: Book; coverSrc: string | null; pages: BookPage[] }

// All themes are light-based — no dark background
const THEMES = {
    sepia: { bg: '#EDE0C4', page: '#FBF5E6', text: '#3D2B1F', border: '#C8B896', bar: '#F0E4C8', barText: '#3D2B1F' },
    light: { bg: '#E8E8E8', page: '#FFFFFF', text: '#1C1C1E', border: '#DEDEDE', bar: '#F5F5F5', barText: '#1C1C1E' },
    forest: { bg: '#C8DDD0', page: '#F2FAF5', text: '#1B4332', border: '#9DC4AE', bar: '#D8EAE0', barText: '#1B4332' },
    night: { bg: '#2C3E50', page: '#34495E', text: '#ECF0F1', border: '#4A6278', bar: '#243342', barText: '#ECF0F1' },
}
type TK = keyof typeof THEMES
const THEME_LIST: TK[] = ['sepia', 'light', 'forest', 'night']
const THEME_LABELS: Record<TK, string> = { sepia: '📜 سپیا', light: '☀️ روشن', forest: '🌿 جنگلی', night: '🌙 شب' }

export default function BookReaderClient({ book, coverSrc, pages }: Props) {
    const total = pages.length
    const [cur, setCur] = useState(0)
    const [dir, setDir] = useState<'n' | 'p'>('n')
    const [anim, setAnim] = useState(false)
    const [fs, setFs] = useState(16)
    const [theme, setTheme] = useState<TK>('sepia')
    const [toc, setToc] = useState(false)
    const t = THEMES[theme]

    const goNext = useCallback(() => {
        if (anim || cur >= total) return
        setDir('n'); setAnim(true)
        setTimeout(() => { setCur(p => p + 1); setAnim(false) }, 280)
    }, [anim, cur, total])

    const goPrev = useCallback(() => {
        if (anim || cur <= 0) return
        setDir('p'); setAnim(true)
        setTimeout(() => { setCur(p => p - 1); setAnim(false) }, 280)
    }, [anim, cur])

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') goNext()
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') goPrev()
            if (e.key === 'Escape') setToc(false)
        }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [goNext, goPrev])

    let tx0 = 0
    const onTS = (e: React.TouchEvent) => { tx0 = e.touches[0].clientX }
    const onTE = (e: React.TouchEvent) => {
        const d = tx0 - e.changedTouches[0].clientX
        if (d > 50) goNext()
        if (d < -50) goPrev()
    }

    const progress = total > 0 ? Math.round((cur / total) * 100) : 0
    const page = cur > 0 ? pages[cur - 1] : null

    const coverHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:380px;text-align:center;gap:18px;padding:32px 16px">
            ${coverSrc
            ? `<img src="${coverSrc}" alt="${book.title}" style="width:130px;border-radius:14px;box-shadow:0 10px 32px rgba(0,0,0,0.2);margin-bottom:4px"/>`
            : '<div style="font-size:56px;margin-bottom:4px">📖</div>'}
            <h1 style="font-size:20px;font-weight:900;line-height:1.5;margin:0;color:${t.text}">${book.title}</h1>
            <p style="font-size:13px;margin:0;opacity:0.55;color:${t.text}">${book.author}</p>
            <div style="width:36px;height:3px;border-radius:99px;background:#1B4332;margin:2px 0"></div>
            <p style="font-size:12px;margin:0;opacity:0.35;color:${t.text}">${total} بخش</p>
            <p style="font-size:11px;margin-top:6px;opacity:0.28;color:${t.text}">← → یا swipe برای ورق زدن</p>
        </div>`

    return (
        <>
            <style>{`
                @keyframes fN{0%{transform:perspective(1200px) rotateY(0);opacity:1}45%{transform:perspective(1200px) rotateY(-10deg) scale(.97);opacity:.5}100%{transform:perspective(1200px) rotateY(0);opacity:1}}
                @keyframes fP{0%{transform:perspective(1200px) rotateY(0);opacity:1}45%{transform:perspective(1200px) rotateY(10deg) scale(.97);opacity:.5}100%{transform:perspective(1200px) rotateY(0);opacity:1}}
                .fn{animation:fN .28s ease}.fp{animation:fP .28s ease}
                .rp p{margin:0 0 13px}.rp h1,.rp h2,.rp h3{margin:0 0 13px;line-height:1.5}
                .rp ul,.rp ol{padding-right:20px;margin:0 0 13px}.rp li{margin-bottom:7px}
                .rp strong{font-weight:700}.rp a{color:#1B4332;text-decoration:underline}
                .rp span[style*="font-size"]{font-size:inherit!important}
                /* scrollbar inside page */
                .rp-scroll::-webkit-scrollbar{width:4px}.rp-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:99px}
            `}</style>

            {/* TOC */}
            {toc && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setToc(false)}>
                    <div style={{ background: t.page, borderRadius: '20px', width: '340px', maxHeight: '68vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: t.text, fontSize: '14px' }}>فهرست مطالب</span>
                            <button onClick={() => setToc(false)} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer', fontSize: '20px', opacity: .4, lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ overflowY: 'auto' }}>
                            <button onClick={() => { setCur(0); setToc(false) }}
                                style={{ width: '100%', textAlign: 'right', padding: '10px 18px', background: cur === 0 ? `${t.bar}` : 'transparent', border: 'none', cursor: 'pointer', color: cur === 0 ? '#1B4332' : t.text, fontSize: '13px', fontWeight: cur === 0 ? 700 : 400, borderBottom: `1px solid ${t.border}40` }}>
                                📖 جلد کتاب
                            </button>
                            {pages.map((p, i) => (
                                <button key={i} onClick={() => { setCur(i + 1); setToc(false) }}
                                    style={{ width: '100%', textAlign: 'right', padding: '10px 18px', background: cur === i + 1 ? `${t.bar}` : 'transparent', border: 'none', cursor: 'pointer', color: cur === i + 1 ? '#1B4332' : t.text, fontSize: '13px', fontWeight: cur === i + 1 ? 700 : 400, borderBottom: `1px solid ${t.border}30`, display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '10px', opacity: .35, minWidth: '18px' }}>{p.index}</span>
                                    <span style={{ flex: 1 }}>{p.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

                {/* Top bar */}
                <div style={{ background: t.bar, borderBottom: `1px solid ${t.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <Link href={`/books/${book.slug}`}
                        style={{ color: t.barText, opacity: .6, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', textDecoration: 'none', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                        خروج
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: t.barText, fontSize: '13px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                        <p style={{ color: t.barText, opacity: .5, fontSize: '11px', margin: 0 }}>{page?.title || 'جلد کتاب'}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={() => setToc(true)} style={{ background: `${t.text}18`, border: 'none', color: t.barText, width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>
                        <button onClick={() => setFs(f => Math.max(12, f - 1))} style={{ background: `${t.text}18`, border: 'none', color: t.barText, width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>−</button>
                        <span style={{ color: t.barText, opacity: .5, fontSize: '11px', minWidth: '22px', textAlign: 'center' }}>{fs}</span>
                        <button onClick={() => setFs(f => Math.min(24, f + 1))} style={{ background: `${t.text}18`, border: 'none', color: t.barText, width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>+</button>
                        <button onClick={() => setTheme(k => { const i = THEME_LIST.indexOf(k); return THEME_LIST[(i + 1) % THEME_LIST.length] })}
                            style={{ background: `${t.text}18`, border: 'none', color: t.barText, height: '32px', padding: '0 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap', fontWeight: 600 }}>
                            {THEME_LABELS[theme]}
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: '3px', background: `${t.border}80`, flexShrink: 0 }}>
                    <div style={{ height: '100%', background: '#1B4332', width: `${progress}%`, transition: 'width .3s ease' }} />
                </div>

                {/* Content area */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 12px', gap: '12px' }}
                    onTouchStart={onTS} onTouchEnd={onTE}>

                    {/* Prev */}
                    <button onClick={goPrev} disabled={cur === 0}
                        style={{ background: cur === 0 ? `${t.border}40` : `${t.text}15`, border: `1px solid ${t.border}`, color: cur === 0 ? `${t.text}40` : t.text, width: '40px', height: '40px', borderRadius: '50%', cursor: cur === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>

                    {/* Page */}
                    <div className={anim ? (dir === 'n' ? 'fn' : 'fp') : ''}
                        style={{
                            width: '100%', maxWidth: '680px', minHeight: '500px', background: t.page, borderRadius: '18px',
                            boxShadow: `0 8px 40px rgba(0,0,0,0.18), 4px 0 12px rgba(0,0,0,0.08)`,
                            padding: '48px 40px 40px', position: 'relative',
                            borderRight: `3px solid ${t.border}`
                        }}>

                        {/* Page indicator */}
                        <div style={{ position: 'absolute', top: '13px', insetInline: '18px', display: 'flex', justifyContent: 'space-between', opacity: .4 }}>
                            <span style={{ fontSize: '10px', color: t.text }}>{page?.title || 'جلد'}</span>
                            <span style={{ fontSize: '10px', color: t.text }}>{cur} / {total}</span>
                        </div>

                        {/* Text */}
                        <div className="rp rp-scroll"
                            style={{ fontSize: `${fs}px`, lineHeight: '2.1', color: t.text, direction: 'rtl', textAlign: 'justify', maxHeight: '72vh', overflowY: 'auto', paddingLeft: '4px' }}
                            dangerouslySetInnerHTML={{ __html: cur === 0 ? coverHtml : (page?.content ?? '') }}
                        />

                        {/* Corner fold */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, width: '26px', height: '26px',
                            background: `linear-gradient(225deg,${t.page} 50%,${t.border} 50%)`, borderRadius: '0 8px 0 18px'
                        }} />
                    </div>

                    {/* Next */}
                    <button onClick={goNext} disabled={cur >= total}
                        style={{ background: cur >= total ? `${t.border}40` : '#1B4332', border: `1px solid ${cur >= total ? t.border : '#1B4332'}`, color: cur >= total ? `${t.text}40` : 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: cur >= total ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                </div>

                {/* Bottom bar */}
                <div style={{ background: t.bar, borderTop: `1px solid ${t.border}`, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <span style={{ color: t.barText, opacity: .4, fontSize: '11px' }}>← → یا swipe برای ورق زدن</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: t.barText, opacity: .5, fontSize: '11px' }}>برو:</span>
                        <input type="number" min={0} max={total} value={cur}
                            onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0 && v <= total) setCur(v) }}
                            style={{ background: t.page, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '3px 6px', width: '52px', fontSize: '12px', textAlign: 'center' }} />
                        <span style={{ color: t.barText, opacity: .4, fontSize: '11px' }}>از {total}</span>
                    </div>
                    <span style={{ color: t.barText, opacity: .4, fontSize: '11px' }}>
                        {cur === 0 ? 'جلد' : `${progress}% خوانده شد`}
                    </span>
                </div>
            </div>
        </>
    )
}
