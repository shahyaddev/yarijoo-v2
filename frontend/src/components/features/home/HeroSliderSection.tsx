'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const SLIDES = [
    { src: '/slides/slide1.png', href: '/tests' },
    { src: '/slides/slide2.png', href: '/psychologists' },
    { src: '/slides/slide3.png', href: '/shop' },
]

interface Product {
    id: string
    slug: string
    title: string
    price: number
    salePrice: number | null
    type: string
}

const TYPE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
    sms: { label: 'پیامکی', color: '#1B4332', bg: '#E8F5E9' },
    online_course: { label: 'دوره', color: '#7B3F00', bg: '#FFF3E0' },
    composite: { label: 'ترکیبی', color: '#4A1D96', bg: '#F3E5F5' },
    book: { label: 'کتاب', color: '#1565C0', bg: '#E3F2FD' },
    physical: { label: 'فیزیکی', color: '#B71C1C', bg: '#FCE4EC' },
}

export default function HeroSliderSection() {
    const [cur, setCur] = useState(0)
    const [products, setProducts] = useState<Product[]>([])
    const timer = useRef<ReturnType<typeof setInterval> | null>(null)

    const start = () => {
        timer.current = setInterval(() => setCur(p => (p + 1) % SLIDES.length), 3500)
    }
    const stop = () => {
        if (timer.current) clearInterval(timer.current)
    }

    useEffect(() => {
        start()
        const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1'
        fetch(`${api}/shop/products?limit=16&sort=newest`)
            .then(r => r.json())
            .then(d => {
                const prods: Product[] = d?.data?.products ?? []
                if (prods.length > 0) setProducts(prods)
            })
            .catch(() => { })
        return stop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const go = (i: number) => { stop(); setCur(i); start() }

    // Subtle dot pattern for hero section background
    const DOT_BG = {
        background: '#FAF7F2',
        backgroundImage: `radial-gradient(circle, #1B433220 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
    }

    return (
        <section className="px-4 md:px-6 py-8 md:py-10" style={DOT_BG}>
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-4" style={{ alignItems: 'stretch' }}>

                    {/* ── Slider ── */}
                    <div
                        className="relative rounded-2xl overflow-hidden shadow-lg"
                        style={{ height: '400px', background: '#EDE6D6', minHeight: '400px' }}>

                        {SLIDES.map((s, i) => (
                            <Link
                                key={i}
                                href={s.href}
                                className={`absolute inset-0 transition-opacity duration-700 ${i === cur ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            >
                                <img
                                    src={s.src}
                                    alt={`اسلاید ${i + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    draggable={false}
                                />
                            </Link>
                        ))}

                        {/* Dot indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                            {SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => go(i)}
                                    aria-label={`اسلاید ${i + 1}`}
                                    className={`rounded-full transition-all duration-300 ${i === cur ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                                />
                            ))}
                        </div>

                        {/* Arrows */}
                        <button
                            onClick={() => go((cur - 1 + SLIDES.length) % SLIDES.length)}
                            aria-label="قبلی"
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all hover:scale-110"
                            style={{ background: 'rgba(0,0,0,0.35)' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => go((cur + 1) % SLIDES.length)}
                            aria-label="بعدی"
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all hover:scale-110"
                            style={{ background: 'rgba(0,0,0,0.35)' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>

                    {/* ── Packages panel ── */}
                    <div style={{ height: '400px' }}>
                        <PackagesPanel products={products} />
                    </div>

                </div>
            </div>
        </section>
    )
}

function PackagesPanel({ products }: { products: Product[] }) {
    const listRef = useRef<HTMLDivElement>(null)
    const items = products.length > 0 ? [...products, ...products] : []
    const animRef = useRef<number>(0)
    const posRef = useRef(0)

    useEffect(() => {
        const el = listRef.current
        if (!el || items.length === 0) return
        const speed = 0.5

        function tick() {
            posRef.current += speed
            if (posRef.current >= el!.scrollHeight / 2) posRef.current = 0
            el!.scrollTop = posRef.current
            animRef.current = requestAnimationFrame(tick)
        }

        animRef.current = requestAnimationFrame(tick)
        const pause = () => cancelAnimationFrame(animRef.current)
        const resume = () => { animRef.current = requestAnimationFrame(tick) }
        el.addEventListener('mouseenter', pause)
        el.addEventListener('mouseleave', resume)

        return () => {
            cancelAnimationFrame(animRef.current)
            el.removeEventListener('mouseenter', pause)
            el.removeEventListener('mouseleave', resume)
        }
    }, [items.length])

    const badge = (type: string) =>
        TYPE_BADGES[type] ?? { label: 'محصول', color: '#1B4332', bg: '#E8F5E9' }

    return (
        <div
            className="rounded-2xl border flex flex-col overflow-hidden"
            style={{
                height: '100%',
                background: 'white',
                borderColor: '#EDE6D6',
            }}
        >
            {/* Header */}
            <div
                className="px-4 py-3 flex items-center justify-between flex-shrink-0"
                style={{ borderBottom: '1px solid #EDE6D6' }}
            >
                <div>
                    <p className="font-bold text-[14px]" style={{ color: '#1C1C1E' }}>جدیدترین محصولات</p>
                    <p className="text-[11px]" style={{ color: '#8C8C8E' }}>بسته‌های ویژه سلامت روان</p>
                </div>
                <Link href="/shop" className="text-[11px] font-semibold hover:underline flex-shrink-0" style={{ color: '#1B4332' }}>
                    همه ←
                </Link>
            </div>

            {/* Scrolling list */}
            <div ref={listRef} className="flex-1 overflow-hidden" style={{ userSelect: 'none' }}>
                {items.length === 0 ? (
                    <div className="flex flex-col gap-0">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 animate-pulse">
                                <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: '#F3EDE3' }} />
                                <div className="flex-1">
                                    <div className="h-3 rounded mb-1" style={{ background: '#F3EDE3', width: '70%' }} />
                                    <div className="h-2.5 rounded" style={{ background: '#EDE6D6', width: '40%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {items.map((p, i) => {
                            const b = badge(p.type)
                            const displayPrice =
                                p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price
                            return (
                                <Link
                                    key={`${p.id}-${i}`}
                                    href={`/shop/${p.slug}`}
                                    className="flex items-center gap-2.5 px-3 py-2 transition-colors"
                                    style={{ borderBottom: '1px solid #F3EDE3' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAF7F2'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: b.bg }}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={b.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold truncate" style={{ color: '#1C1C1E' }}>
                                            {p.title}
                                        </p>
                                        <p className="text-[11px] font-bold" style={{ color: '#1B4332' }}>
                                            {displayPrice === 0
                                                ? 'رایگان'
                                                : `${displayPrice.toLocaleString('fa-IR')} تومان`}
                                        </p>
                                    </div>
                                    <span
                                        className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                        style={{ background: b.bg, color: b.color }}
                                    >
                                        {b.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
