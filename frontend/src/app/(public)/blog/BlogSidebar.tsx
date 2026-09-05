'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const POPULAR_TAGS = [
    'اضطراب', 'افسردگی', 'استرس', 'روابط', 'خودشناسی',
    'ذهن‌آگاهی', 'تاب‌آوری', 'شخصیت', 'خواب', 'اعتماد به نفس', 'مدیریت خشم', 'والدین',
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

interface Category { id: string; name: string; slug: string }

export default function BlogSidebar({ categories = [], total = 0 }: { categories?: Category[]; total?: number }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState(searchParams.get('search') ?? '')
    const [selectedCat, setSelectedCat] = useState(searchParams.get('category') ?? '')
    const [selectedTags, setSelectedTags] = useState<string[]>(
        searchParams.get('tags')?.split(',').filter(Boolean) ?? []
    )

    useEffect(() => {
        setSearch(searchParams.get('search') ?? '')
        setSelectedCat(searchParams.get('category') ?? '')
        setSelectedTags(searchParams.get('tags')?.split(',').filter(Boolean) ?? [])
    }, [searchParams])

    const hasFilters = searchParams.get('search') || searchParams.get('category') || searchParams.get('tags')

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

    function toggleTag(tag: string) {
        const cur = searchParams.get('tags')?.split(',').filter(Boolean) ?? []
        const next = cur.includes(tag) ? cur.filter(x => x !== tag) : [...cur, tag]
        navigate({ tags: next.length ? next.join(',') : null })
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
                    text="آمار مجله"
                />
                <div>
                    {[
                        { label: 'کل مقالات', value: toFarsi(total) },
                        { label: 'دسته‌بندی‌ها', value: toFarsi(categories.length || 6) },
                        { label: 'برچسب‌ها', value: toFarsi(POPULAR_TAGS.length) },
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
                    text="جستجو در مقالات"
                />
                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="جستجو..."
                        style={{ width: '100%', height: 42, borderRadius: 12, border: '1px solid #EDE6D6', background: '#FAF7F2', padding: '0 12px 0 40px', fontSize: 13, color: '#1C1C1E', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#1B4332')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#EDE6D6')} />
                    <button type="submit" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8C8C8E', display: 'flex' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </button>
                    {search && (
                        <button type="button" onClick={() => { setSearch(''); navigate({ search: null }) }}
                            style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 18, lineHeight: 1 }}>
                            ×
                        </button>
                    )}
                </form>
            </SidebarCard>

            {/* دسته‌بندی */}
            {categories.length > 0 && (
                <SidebarCard>
                    <SidebarTitle
                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>}
                        text="دسته‌بندی‌ها"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[{ id: '', name: 'همه مقالات', slug: '' }, ...categories].map(cat => {
                            const isActive = selectedCat === cat.slug
                            return (
                                <button key={cat.slug || 'all'}
                                    onClick={() => navigate({ category: cat.slug || null })}
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
            )}

            {/* برچسب‌های محبوب */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>}
                    text="برچسب‌های محبوب"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {POPULAR_TAGS.map(tag => {
                        const isActive = selectedTags.includes(tag)
                        return (
                            <button key={tag} onClick={() => toggleTag(tag)}
                                style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', border: `1px solid ${isActive ? '#1B4332' : '#EDE6D6'}`, background: isActive ? '#1B4332' : 'transparent', color: isActive ? 'white' : '#6B7280' }}
                                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#EDF7F0'; (e.currentTarget as HTMLElement).style.color = '#1B4332'; (e.currentTarget as HTMLElement).style.borderColor = '#1B4332' } }}
                                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; (e.currentTarget as HTMLElement).style.borderColor = '#EDE6D6' } }}>
                                {tag}
                            </button>
                        )
                    })}
                </div>
            </SidebarCard>
        </div>
    )
}
