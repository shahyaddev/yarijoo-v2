'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth.store'

const NAV = [
    { href: '/tests', label: 'تست‌ها' },
    { href: '/blog', label: 'مجله' },
    { href: '/books', label: 'کتاب‌ها' },
    { href: '/stories', label: 'داستان‌ها' },
    { href: '/shop', label: 'فروشگاه' },
    { href: '/courses', label: 'دوره‌ها' },
    { href: '/psychologists', label: 'روانشناسان' },
]

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileOpen, setMobileOpen] = useState(false)
    const searchRef = useRef<HTMLInputElement>(null)
    const pathname = usePathname()
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()

    useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
            setSearchOpen(false); setSearchQuery('')
        }
    }

    const active = (href: string) => pathname.startsWith(href)

    const hStyle: React.CSSProperties = {
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(250,247,242,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #DDD5C5',
    }

    return (
        <>
            <header style={hStyle}>
                <div className="max-w-7xl mx-auto px-5 flex items-center gap-4" style={{ height: '66px' }}>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <img src="/yarijoo-logo.png" alt="یاری‌جو" style={{ height: '38px', width: 'auto' }}
                            onError={(e) => {
                                const t = e.target as HTMLImageElement
                                t.style.display = 'none'
                                const next = t.nextElementSibling as HTMLElement
                                if (next) next.style.display = 'flex'
                            }}
                        />
                        <div className="w-9 h-9 rounded-xl items-center justify-center text-white font-black text-lg"
                            style={{ background: '#1B4332', display: 'none' }}>ی</div>
                    </Link>

                    {/* Nav desktop */}
                    <nav className="hidden lg:flex items-center gap-0.5 mr-2">
                        {NAV.map(l => (
                            <Link key={l.href} href={l.href}
                                className="px-3.5 py-2 text-[14px] font-medium rounded-lg transition-colors duration-150"
                                style={active(l.href)
                                    ? { color: '#1B4332', background: '#EDE6D6', fontWeight: 600 }
                                    : { color: '#5C5C5E' }
                                }
                                onMouseEnter={e => { if (!active(l.href)) (e.target as HTMLElement).style.color = '#1B4332'; (e.target as HTMLElement).style.background = '#F3EDE3' }}
                                onMouseLeave={e => { if (!active(l.href)) (e.target as HTMLElement).style.color = '#5C5C5E'; (e.target as HTMLElement).style.background = 'transparent' }}
                            >{l.label}</Link>
                        ))}
                    </nav>

                    <div className="flex-1" />

                    {/* Search */}
                    <AnimatePresence mode="wait">
                        {searchOpen ? (
                            <motion.form key="open" initial={{ width: 36, opacity: 0.5 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 36, opacity: 0 }}
                                transition={{ duration: 0.22 }} onSubmit={handleSearch} className="relative flex items-center overflow-hidden">
                                <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
                                    placeholder="جستجو در یاری‌جو..."
                                    style={{
                                        width: '100%', height: '36px', paddingRight: '12px', paddingLeft: '32px', fontSize: '13px',
                                        background: '#F3EDE3', border: '1px solid #DDD5C5', borderRadius: '999px',
                                        color: '#1C1C1E', outline: 'none', fontFamily: 'Vazirmatn,Tahoma,sans-serif'
                                    }}
                                />
                                <button type="submit" aria-label="جستجو" style={{ position: 'absolute', left: '10px', color: '#8C8C8E', lineHeight: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                                    </svg>
                                </button>
                            </motion.form>
                        ) : (
                            <motion.button key="closed" onClick={() => setSearchOpen(true)} aria-label="جستجو"
                                className="flex items-center justify-center rounded-full transition-colors"
                                style={{ width: '36px', height: '36px', color: '#5C5C5E', background: 'none' }}
                                whileHover={{ background: '#F3EDE3' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                                </svg>
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Auth */}
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-2">
                            <Link href="/checkout"
                                className="hidden sm:flex items-center justify-center rounded-full transition-colors relative"
                                style={{ width: '36px', height: '36px', color: '#5C5C5E', background: 'none' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                            </Link>
                            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1B4332', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                                    {(user.fullName ?? user.phone).charAt(0)}
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/auth/login" className="hidden sm:inline-flex items-center px-4 py-2 text-white text-[14px] font-semibold rounded-xl transition-colors hover:opacity-90"
                            style={{ background: '#1B4332' }}>ورود</Link>
                    )}

                    {/* Mobile trigger */}
                    <button onClick={() => setMobileOpen(true)} aria-label="باز کردن منو"
                        className="lg:hidden flex items-center justify-center rounded-lg transition-colors"
                        style={{ width: '36px', height: '36px', color: '#5C5C5E', background: 'none' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setMobileOpen(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.28 }}
                            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col shadow-2xl" style={{ width: '280px', background: '#FAF7F2' }}>
                            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #DDD5C5' }}>
                                <img src="/yarijoo-logo.png" alt="یاری‌جو" style={{ height: '32px', width: 'auto' }} />
                                <button onClick={() => setMobileOpen(false)} aria-label="بستن"
                                    className="flex items-center justify-center rounded-lg transition-colors"
                                    style={{ width: '32px', height: '32px', color: '#8C8C8E', background: 'none' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <nav className="flex flex-col p-3 gap-0.5">
                                {NAV.map(l => (
                                    <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                                        className="px-4 py-3 rounded-xl text-[15px] font-medium transition-colors"
                                        style={active(l.href) ? { background: '#EDE6D6', color: '#1B4332', fontWeight: 600 } : { color: '#5C5C5E' }}>
                                        {l.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto p-4" style={{ borderTop: '1px solid #DDD5C5' }}>
                                <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                                    className="block w-full text-center py-3 text-white text-[14px] font-semibold rounded-xl transition-colors hover:opacity-90"
                                    style={{ background: '#1B4332' }}>ورود به حساب</Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
