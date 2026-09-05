'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

export default function ShopHero({ total = 0 }: { total?: number }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('search') ?? '')

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        const p = new URLSearchParams(searchParams.toString())
        if (query.trim()) p.set('search', query.trim())
        else p.delete('search')
        p.delete('page')
        router.push(`${pathname}?${p.toString()}`)
    }

    const features = [
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            ),
            label: 'محصولات', value: toFarsi(total),
        },
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                </svg>
            ),
            label: 'پرفروش‌ترین', value: toFarsi(50),
        },
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
            ),
            label: 'با تخفیف', value: toFarsi(25),
        },
    ]

    return (
        <div style={{
            width: '100%', borderRadius: 24, padding: '40px 40px 36px',
            background: 'linear-gradient(135deg, #EDF7F0 0%, #F3EDE3 60%, #EDF7F0 100%)',
            border: '1px solid #C8E6D4',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(27,67,50,0.08)',
            marginBottom: 8,
        }}>
            {/* decorative blobs */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: '#1B4332', opacity: 0.05, filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: '#52B788', opacity: 0.08, filter: 'blur(50px)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: '#D1FAE5', color: '#065F46', marginBottom: 14 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        فروشگاه یاری‌جو
                    </span>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1C1C1E', margin: '0 0 10px', lineHeight: 1.4 }}>
                        فروشگاه محصولات روانشناسی
                    </h1>
                    <p style={{ fontSize: 15, color: '#5C5C5E', maxWidth: 540, margin: '0 auto', lineHeight: 1.8 }}>
                        کتاب‌ها، دوره‌های آموزشی، پکیج‌های مشاوره و محصولات تخصصی روانشناسی
                    </p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} style={{ maxWidth: 560, margin: '0 auto 28px', position: 'relative' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="جستجوی محصولات... (نام، دسته‌بندی، کلمات کلیدی)"
                        style={{
                            width: '100%', height: 52, borderRadius: 16,
                            border: '1.5px solid #C8E6D4', background: 'white',
                            padding: '0 16px 0 52px', fontSize: 14, color: '#1C1C1E',
                            outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                            boxShadow: '0 2px 10px rgba(27,67,50,0.07)',
                            transition: 'border-color .2s, box-shadow .2s',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#1B4332'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(27,67,50,0.12)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#C8E6D4'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(27,67,50,0.07)' }}
                    />
                    <button type="submit" style={{
                        position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                        width: 38, height: 38, borderRadius: 12, border: 'none',
                        background: '#1B4332', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'opacity .2s',
                    }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </form>

                {/* Feature stats */}
                <div className="grid grid-cols-3 gap-4" style={{ maxWidth: 560, margin: '0 auto' }}>
                    {features.map((f, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                            borderRadius: 16, background: 'white',
                            border: '1px solid #E8F5EE',
                            boxShadow: '0 2px 8px rgba(27,67,50,0.06)',
                        }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#EDF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332', flexShrink: 0 }}>
                                {f.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: '#1B4332', lineHeight: 1.2 }}>{f.value}</div>
                                <div style={{ fontSize: 11, color: '#8C8C8E', marginTop: 2 }}>{f.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
