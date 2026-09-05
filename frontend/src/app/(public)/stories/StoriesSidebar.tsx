'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const CATEGORIES = [
    { name: 'همه داستان‌ها', slug: 'all' },
    { name: 'موفقیت و پیروزی', slug: 'success' },
    { name: 'غلبه بر افسردگی', slug: 'depression' },
    { name: 'رهایی از اضطراب', slug: 'anxiety' },
    { name: 'بهبود روابط', slug: 'relationships' },
    { name: 'خودشناسی', slug: 'self-awareness' },
]

const MOODS = [
    { label: 'انگیزشی',   slug: 'motivational' },
    { label: 'آرام‌بخش',  slug: 'calming' },
    { label: 'قدرت‌بخش',  slug: 'empowering' },
    { label: 'احساسی',    slug: 'emotional' },
    { label: 'الهام‌بخش', slug: 'inspiring' },
]

function SidebarCard({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            width: '100%', borderRadius: 18, padding: 20, overflow: 'hidden',
            border: '1px solid #EDE6D6', background: 'white',
            boxShadow: '0 2px 8px rgba(27,67,50,0.05)',
        }}>
            {children}
        </div>
    )
}

function SidebarTitle({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, position: 'relative', paddingBottom: 12, borderBottom: '1px solid #EDE6D6' }}>
            {/* accent bar */}
            <div style={{ position: 'absolute', right: -20, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom,#1B4332,rgba(27,67,50,0.3))', borderRadius: 99 }} />
            <span style={{ color: '#1B4332', display: 'flex' }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{text}</span>
        </div>
    )
}

export default function StoriesSidebar({ total = 0 }: { total?: number }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [selectedCat, setSelectedCat] = useState(searchParams.get('category_slug') ?? 'all')
    const [selectedMood, setSelectedMood] = useState(searchParams.get('mood_slug') ?? '')

    useEffect(() => {
        setSelectedCat(searchParams.get('category_slug') ?? 'all')
        setSelectedMood(searchParams.get('mood_slug') ?? '')
    }, [searchParams])

    const hasFilters = searchParams.get('category_slug') || searchParams.get('mood_slug')

    function navigate(key: string, value: string | null) {
        const p = new URLSearchParams(searchParams.toString())
        if (!value) p.delete(key)
        else p.set(key, value)
        p.delete('page')
        router.push(`${pathname}?${p.toString()}`)
    }

    function clearAll() {
        router.push(pathname)
    }

    function toFarsi(n: number) {
        return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
    }

    return (
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}
            className="hidden lg:flex sticky top-6 self-start">

            {/* پاک کردن فیلتر */}
            {hasFilters && (
                <button onClick={clearAll} style={{
                    width: '100%', height: 44, borderRadius: 14,
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#DC2626', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'inherit', transition: 'background .2s',
                }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    پاک کردن فیلتر‌ها
                </button>
            )}

            {/* آمار */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
                    text="آمار داستان‌ها"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                        { label: 'کل داستان‌ها', value: toFarsi(total) },
                        { label: 'محبوب‌ترین‌ها', value: toFarsi(25) },
                        { label: 'نویسندگان', value: toFarsi(8) },
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
                    text="دسته‌بندی داستان‌ها"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {CATEGORIES.map(cat => {
                        const isActive = selectedCat === cat.slug || (cat.slug === 'all' && !selectedCat)
                        return (
                            <button key={cat.slug}
                                onClick={() => navigate('category_slug', cat.slug === 'all' ? null : cat.slug)}
                                style={{
                                    width: '100%', textAlign: 'right', padding: '9px 12px',
                                    borderRadius: 10, border: `1px solid ${isActive ? '#1B4332' : '#EDE6D6'}`,
                                    background: isActive ? '#EDF7F0' : 'transparent',
                                    color: isActive ? '#1B4332' : '#5C5C5E',
                                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}
                                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#F5FBF7'; (e.currentTarget as HTMLElement).style.borderColor = '#A8D5B5' } }}
                                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = '#EDE6D6' } }}
                            >
                                {/* radio circle */}
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

            {/* حال و هوا */}
            <SidebarCard>
                <SidebarTitle
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>}
                    text="حال و هوا"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {MOODS.map(mood => {
                        const isActive = selectedMood === mood.slug
                        return (
                            <button key={mood.slug}
                                onClick={() => navigate('mood_slug', isActive ? null : mood.slug)}
                                style={{
                                    width: '100%', textAlign: 'right', padding: '9px 12px',
                                    borderRadius: 10, border: 'none',
                                    background: isActive ? '#EDF7F0' : 'transparent',
                                    color: isActive ? '#1B4332' : '#6B7280',
                                    fontSize: 13, fontWeight: isActive ? 700 : 400,
                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                                }}
                                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#F5FBF7'; (e.currentTarget as HTMLElement).style.color = '#1C1C1E' } }}
                                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280' } }}
                            >
                                {mood.label}
                            </button>
                        )
                    })}
                </div>
            </SidebarCard>
        </div>
    )
}
