'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const CATEGORIES = [
    { name: 'همه محصولات', slug: '' },
    { name: 'کتاب', slug: 'book' },
    { name: 'دوره آنلاین', slug: 'online_course' },
    { name: 'پکیج پیامکی', slug: 'sms' },
    { name: 'پکیج ترکیبی', slug: 'composite' },
    { name: 'محصول فیزیکی', slug: 'physical' },
    { name: 'دیجیتال', slug: 'digital' },
]

const PRICE_RANGES = [
    { label: 'رایگان', value: 'free' },
    { label: 'زیر ۱۰۰ هزار تومان', value: '0-100000' },
    { label: '۱۰۰ تا ۵۰۰ هزار', value: '100000-500000' },
    { label: 'بالای ۵۰۰ هزار', value: '500000+' },
]

const SPECIAL = [
    { label: 'محصولات تخفیف‌دار', value: 'discounted' },
    { label: 'محصولات جدید', value: 'new' },
    { label: 'پرفروش‌ترین‌ها', value: 'top_selling' },
]

function SidebarCard({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ borderRadius: 18, padding: 20, border: '1px solid #EDE6D6', background: 'white', boxShadow: '0 2px 8px rgba(27,67,50,0.05)' }}>
            {children}
        </div>
    )
}

function SidebarTitle({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12, marginBottom: 14, borderBottom: '1px solid #EDE6D6', position: 'relative' }}>
            <div style={{ position: 'absolute', right: -20, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom,#1B4332,rgba(27,67,50,0.3))', borderRadius: 99 }} />
            <span style={{ color: '#1B4332', display: 'flex' }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{text}</span>
        </div>
    )
}

export default function ShopSidebar({ total = 0 }: { total?: number }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState(searchParams.get('search') ?? '')
    const [selectedCat, setSelectedCat] = useState(searchParams.get('type') ?? '')
    const [selectedPrice, setSelectedPrice] = useState(searchParams.get('price') ?? '')
    const [selectedSpecials, setSelectedSpecials] = useState<string[]>(
        searchParams.get('special')?.split(',').filter(Boolean) ?? []
    )

    useEffect(() => {
        setSelectedCat(searchParams.get('type') ?? '')
        setSelectedPrice(searchParams.get('price') ?? '')
        setSearch(searchParams.get('search') ?? '')
        setSelectedSpecials(searchParams.get('special')?.split(',').filter(Boolean) ?? [])
    }, [searchParams])

    const hasFilters = searchParams.get('type') || searchParams.get('price') || searchParams.get('search') || searchParams.get('special')

    function navigate(updates: Record<string, string | null>) {
        const p = new URLSearchParams(searchParams.toString())
        for (const [k, v] of Object.entries(updates)) {
            if (!v) p.delete(k)
            else p.set(k, v)
        }
        p.delete('page')
        router.push(`${pathname}?${p.toString()}`)
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        navigate({ search: search || null })
    }

    function toggleSpecial(val: string) {
        const cur = searchParams.get('special')?.split(',').filter(Boolean) ?? []
        const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]
        navigate({ special: next.length ? next.join(',') : null })
    }

    function toFarsi(n: number) {
        return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
    }

    return (
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}
            className="hidden lg:flex sticky top-6 self-start">

            {/* پاک کردن فیلتر */}
            {hasFilters && (
                <button onClick={() => router.push(pathname)}
                    style={{ width: '100%', height: 44, borderRadius: 14, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#DC2626', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    پاک کردن فیلتر‌ها
                </button>
            )}

            {/* آمار */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
                    text="آمار فروشگاه"
                />
                <div>
                    {[
                        { label: 'کل محصولات', value: toFarsi(total) },
                        { label: 'پیشنهادهای ویژه', value: toFarsi(25) },
                        { label: 'دسته‌بندی‌ها', value: toFarsi(7) },
                    ].map((r, i, arr) => (
                        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #F3EDE3' : 'none' }}>
                            <span style={{ fontSize: 12, color: '#8C8C8E' }}>{r.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#1B4332' }}>{r.value}</span>
                        </div>
                    ))}
                </div>
            </SidebarCard>

            {/* جستجو */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}
                    text="جستجو"
                />
                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="جستجو در محصولات..."
                        style={{
                            width: '100%', height: 42, borderRadius: 12,
                            border: '1px solid #EDE6D6', background: '#FAF7F2',
                            padding: '0 12px 0 40px', fontSize: 13, color: '#1C1C1E',
                            outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#1B4332')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#EDE6D6')}
                    />
                    <button type="submit" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8C8C8E', display: 'flex' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </button>
                    {search && (
                        <button type="button" onClick={() => { setSearch(''); navigate({ search: null }) }}
                            style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 16, lineHeight: 1, display: 'flex' }}>
                            ×
                        </button>
                    )}
                </form>
            </SidebarCard>

            {/* دسته‌بندی */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>}
                    text="دسته‌بندی‌ها"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {CATEGORIES.map(cat => {
                        const isActive = selectedCat === cat.slug
                        return (
                            <button key={cat.slug || 'all'}
                                onClick={() => navigate({ type: cat.slug || null })}
                                style={{ width: '100%', textAlign: 'right', padding: '9px 12px', borderRadius: 10, border: `1px solid ${isActive ? '#1B4332' : '#EDE6D6'}`, background: isActive ? '#EDF7F0' : 'transparent', color: isActive ? '#1B4332' : '#5C5C5E', fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 8 }}
                                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#F5FBF7'; (e.currentTarget as HTMLElement).style.borderColor = '#A8D5B5' } }}
                                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = '#EDE6D6' } }}>
                                <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, border: `2px solid ${isActive ? '#1B4332' : '#C8C8C8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1B4332' }} />}
                                </div>
                                {cat.name}
                            </button>
                        )
                    })}
                </div>
            </SidebarCard>

            {/* محدوده قیمت */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                    text="محدوده قیمت"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {PRICE_RANGES.map(r => {
                        const isActive = selectedPrice === r.value
                        return (
                            <button key={r.value}
                                onClick={() => navigate({ price: isActive ? null : r.value })}
                                style={{ width: '100%', textAlign: 'right', padding: '9px 12px', borderRadius: 10, border: 'none', background: isActive ? '#EDF7F0' : 'transparent', color: isActive ? '#1B4332' : '#6B7280', fontSize: 13, fontWeight: isActive ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 8 }}
                                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#F5FBF7'; (e.currentTarget as HTMLElement).style.color = '#1C1C1E' } }}
                                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280' } }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#1B4332' : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                                {r.label}
                            </button>
                        )
                    })}
                </div>
            </SidebarCard>

            {/* پیشنهادهای ویژه */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>}
                    text="پیشنهادهای ویژه"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {SPECIAL.map(s => {
                        const isActive = selectedSpecials.includes(s.value)
                        return (
                            <button key={s.value} onClick={() => toggleSpecial(s.value)}
                                style={{ width: '100%', textAlign: 'right', padding: '10px 14px', borderRadius: 12, border: `1px solid ${isActive ? '#1B4332' : '#EDE6D6'}`, background: isActive ? '#EDF7F0' : 'white', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 10 }}>
                                {/* checkbox */}
                                <div style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${isActive ? '#1B4332' : '#C8C8C8'}`, background: isActive ? '#1B4332' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                                    {isActive && (
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                <span style={{ fontSize: 13, color: isActive ? '#1B4332' : '#5C5C5E', fontWeight: isActive ? 700 : 400, transition: 'color .15s' }}>{s.label}</span>
                            </button>
                        )
                    })}
                </div>
            </SidebarCard>
        </div>
    )
}
