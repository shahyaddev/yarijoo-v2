'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const CATEGORIES = [
    { name: 'همه کتاب‌ها', slug: 'all' },
    { name: 'روانشناسی', slug: 'psychology' },
    { name: 'خودشناسی', slug: 'self-awareness' },
    { name: 'رشد فردی', slug: 'personal-growth' },
    { name: 'روابط', slug: 'relationships' },
    { name: 'کودک و نوجوان', slug: 'children' },
]

const SORTS = [
    { label: 'پرفروش‌ترین‌ها', value: 'popular' },
    { label: 'جدیدترین', value: 'newest' },
    { label: 'قدیمی‌ترین', value: 'oldest' },
    { label: 'رایگان‌ها', value: 'free' },
]

const POPULAR_TAGS = [
    'اضطراب', 'افسردگی', 'رابطه', 'خودشناسی', 'استرس', 'شادی', 'تاب‌آوری', 'ذهن‌آگاهی',
]

function SidebarCard({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            borderRadius: 18, padding: 20,
            border: '1px solid #EDE6D6',
            background: 'white',
            boxShadow: '0 2px 8px rgba(27,67,50,0.05)',
        }}>
            {children}
        </div>
    )
}

function SidebarTitle({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            paddingBottom: 12, marginBottom: 14,
            borderBottom: '1px solid #EDE6D6',
            position: 'relative',
        }}>
            <div style={{
                position: 'absolute', right: -20, top: 0, bottom: 0,
                width: 3, background: 'linear-gradient(to bottom,#1B4332,rgba(27,67,50,0.3))',
                borderRadius: 99,
            }} />
            <span style={{ color: '#1B4332', display: 'flex' }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{text}</span>
        </div>
    )
}

export default function BooksSidebar({ total = 0 }: { total?: number }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [selectedCat, setSelectedCat] = useState(searchParams.get('category_slug') ?? 'all')
    const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') ?? '')
    const [selectedTags, setSelectedTags] = useState<string[]>(
        searchParams.get('tags')?.split(',').filter(Boolean) ?? []
    )

    useEffect(() => {
        setSelectedCat(searchParams.get('category_slug') ?? 'all')
        setSelectedSort(searchParams.get('sort') ?? '')
        setSelectedTags(searchParams.get('tags')?.split(',').filter(Boolean) ?? [])
    }, [searchParams])

    const hasFilters = searchParams.get('category_slug') || searchParams.get('sort') || searchParams.get('tags')

    function navigate(updates: Record<string, string | null>) {
        const p = new URLSearchParams(searchParams.toString())
        for (const [k, v] of Object.entries(updates)) {
            if (!v) p.delete(k)
            else p.set(k, v)
        }
        p.delete('page')
        router.push(`${pathname}?${p.toString()}`)
    }

    function toggleTag(tag: string) {
        const current = searchParams.get('tags')?.split(',').filter(Boolean) ?? []
        const next = current.includes(tag)
            ? current.filter(t => t !== tag)
            : [...current, tag]
        navigate({ tags: next.length ? next.join(',') : null })
    }

    function toFarsi(n: number) {
        return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
    }

    return (
        <div
            style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}
            className="hidden lg:flex sticky top-6 self-start"
        >
            {/* پاک کردن فیلتر */}
            {hasFilters && (
                <button
                    onClick={() => router.push(pathname)}
                    style={{
                        width: '100%', height: 44, borderRadius: 14,
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
                        color: '#DC2626', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                >
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
                    text="آمار کتاب‌خانه"
                />
                <div>
                    {[
                        { label: 'کل کتاب‌ها', value: toFarsi(total) },
                        { label: 'کتاب‌های رایگان', value: toFarsi(Math.floor(total * 0.7)) },
                        { label: 'دسته‌بندی‌ها', value: toFarsi(6) },
                    ].map((r, i, arr) => (
                        <div key={r.label} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '9px 0',
                            borderBottom: i < arr.length - 1 ? '1px solid #F3EDE3' : 'none',
                        }}>
                            <span style={{ fontSize: 12, color: '#8C8C8E' }}>{r.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#1B4332' }}>{r.value}</span>
                        </div>
                    ))}
                </div>
            </SidebarCard>

            {/* دسته‌بندی */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>}
                    text="دسته‌بندی کتاب‌ها"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {CATEGORIES.map(cat => {
                        const isActive = selectedCat === cat.slug || (cat.slug === 'all' && !selectedCat)
                        return (
                            <button key={cat.slug}
                                onClick={() => navigate({ category_slug: cat.slug === 'all' ? null : cat.slug })}
                                style={{
                                    width: '100%', textAlign: 'right', padding: '9px 12px',
                                    borderRadius: 10,
                                    border: `1px solid ${isActive ? '#1B4332' : '#EDE6D6'}`,
                                    background: isActive ? '#EDF7F0' : 'transparent',
                                    color: isActive ? '#1B4332' : '#5C5C5E',
                                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}
                                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#F5FBF7'; (e.currentTarget as HTMLElement).style.borderColor = '#A8D5B5' } }}
                                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = '#EDE6D6' } }}
                            >
                                <div style={{
                                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                                    border: `2px solid ${isActive ? '#1B4332' : '#C8C8C8'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1B4332' }} />}
                                </div>
                                {cat.name}
                            </button>
                        )
                    })}
                </div>
            </SidebarCard>

            {/* مرتب‌سازی */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="9" y1="18" x2="15" y2="18" /></svg>}
                    text="مرتب‌سازی"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {SORTS.map(sort => {
                        const isActive = selectedSort === sort.value
                        return (
                            <button key={sort.value}
                                onClick={() => navigate({ sort: isActive ? null : sort.value })}
                                style={{
                                    width: '100%', textAlign: 'right', padding: '9px 12px',
                                    borderRadius: 10, border: 'none',
                                    background: isActive ? '#EDF7F0' : 'transparent',
                                    color: isActive ? '#1B4332' : '#6B7280',
                                    fontSize: 13, fontWeight: isActive ? 700 : 400,
                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}
                                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#F5FBF7'; (e.currentTarget as HTMLElement).style.color = '#1C1C1E' } }}
                                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280' } }}
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#1B4332' : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                                {sort.label}
                            </button>
                        )
                    })}
                </div>
            </SidebarCard>

            {/* تگ‌های محبوب */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>}
                    text="تگ‌های محبوب"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {POPULAR_TAGS.map(tag => {
                        const isActive = selectedTags.includes(tag)
                        return (
                            <button key={tag}
                                onClick={() => toggleTag(tag)}
                                style={{
                                    padding: '5px 12px', borderRadius: 20, fontSize: 12,
                                    fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                                    fontFamily: 'inherit', transition: 'all .15s',
                                    border: `1px solid ${isActive ? '#1B4332' : '#EDE6D6'}`,
                                    background: isActive ? '#1B4332' : 'transparent',
                                    color: isActive ? 'white' : '#6B7280',
                                }}
                                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#EDF7F0'; (e.currentTarget as HTMLElement).style.color = '#1B4332'; (e.currentTarget as HTMLElement).style.borderColor = '#1B4332' } }}
                                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; (e.currentTarget as HTMLElement).style.borderColor = '#EDE6D6' } }}
                            >
                                {tag}
                            </button>
                        )
                    })}
                </div>
            </SidebarCard>
        </div>
    )
}
