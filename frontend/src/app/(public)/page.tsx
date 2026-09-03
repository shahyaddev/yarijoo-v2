import Link from 'next/link'
import HeroSliderSection from '@/components/features/home/HeroSliderSection'
import { imgUrl } from '@/lib/imgUrl'

export const revalidate = 60

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

/* ── Types ────────────────────────────────────────────────────────────────── */
interface BlogPost  { id: string; slug: string; title: string; excerpt: string | null; coverImage: string | null; publishedAt: string | null; readTime: number | null }
interface Book      { id: string; slug: string; title: string; author: string; coverImage: string | null; price: number; isPremium: boolean }
interface Course    { id: string; slug: string; title: string; price: number; salePrice: number | null; totalLessons: number; rating: number | null; enrolledCount: number; thumbnail: string | null; category?: { name: string } | null }
interface Product   { id: string; slug: string; title: string; price: number; salePrice: number | null; images: string[] | null; type: string }
interface Story     { id: string; title: string | null; content: string; mediaUrl: string | null }
interface Test      { id: string; slug: string; title: string; category: string; duration: number | null; isPremium: boolean }

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function strip(h: string) {
    return h.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().slice(0, 120)
}
function fmtDate(iso: string | null) {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) } catch { return '' }
}

/* ── Data fetcher ─────────────────────────────────────────────────────────── */
async function getData() {
    const fetches = await Promise.allSettled([
        fetch(`${API}/blog?limit=6`, { next: { revalidate: 60 } }),
        fetch(`${API}/books?limit=8`, { next: { revalidate: 60 } }),
        fetch(`${API}/courses?limit=4`, { next: { revalidate: 60 } }),
        fetch(`${API}/shop/products?limit=6`, { next: { revalidate: 60 } }),
        fetch(`${API}/stories?limit=6`, { next: { revalidate: 60 } }),
        fetch(`${API}/tests?limit=4&status=PUBLISHED`, { next: { revalidate: 60 } }),
    ])

    const safe = async <T,>(r: PromiseSettledResult<Response>, getter: (d: unknown) => T[]): Promise<T[]> => {
        if (r.status !== 'fulfilled' || !r.value.ok) return []
        try { return getter(await r.value.json()) } catch { return [] }
    }

    const [blogs, books, courses, prods, stories, tests] = await Promise.all([
        safe<BlogPost>(fetches[0], (d: unknown) => (d as { data?: { posts?: BlogPost[] } }).data?.posts ?? []),
        safe<Book>(fetches[1], (d: unknown) => (d as { data?: { books?: Book[] } }).data?.books ?? []),
        safe<Course>(fetches[2], (d: unknown) => (d as { data?: { courses?: Course[] } }).data?.courses ?? []),
        safe<Product>(fetches[3], (d: unknown) => (d as { data?: { products?: Product[] } }).data?.products ?? []),
        safe<Story>(fetches[4], (d: unknown) => {
            const j = (d as { data?: unknown }).data
            return Array.isArray(j) ? j : (j as { stories?: Story[] })?.stories ?? []
        }),
        safe<Test>(fetches[5], (d: unknown) => (d as { data?: { tests?: Test[] } }).data?.tests ?? []),
    ])

    return { blogs, books, courses, prods, stories, tests }
}

/* ── SVG Icons ────────────────────────────────────────────────────────────── */
function IconBrain({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.967-.516" /><path d="M19.967 17.484A4 4 0 0 1 18 18" />
        </svg>
    )
}
function IconBook({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
        </svg>
    )
}
function IconPen({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
        </svg>
    )
}
function IconPlay({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
        </svg>
    )
}
function IconShop({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
function IconStory({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
function IconStar({ size = 14, color = '#C9A84C' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}
function IconClock({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
function IconUsers({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
function IconArrowLeft({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    )
}
function IconChevronDown({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    )
}

/* ── Section Header ────────────────────────────────────────────────────────── */
function SectionHeader({
    icon, title, subtitle, href, linkLabel, light = false,
}: {
    icon: React.ReactNode
    title: string
    subtitle?: string
    href?: string
    linkLabel?: string
    light?: boolean
}) {
    return (
        <div className="flex items-end justify-between mb-8">
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: light ? 'rgba(255,255,255,0.15)' : '#1B4332' }}
                >
                    {icon}
                </div>
                <div>
                    <h2
                        className="text-2xl md:text-3xl font-black"
                        style={{ color: light ? 'white' : '#1C1C1E' }}
                    >
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm mt-0.5" style={{ color: light ? 'rgba(255,255,255,0.6)' : '#8C8C8E' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {href && linkLabel && (
                <Link
                    href={href}
                    className="text-sm font-bold hover:opacity-70 transition-opacity flex items-center gap-1 flex-shrink-0"
                    style={{ color: light ? 'rgba(255,255,255,0.85)' : '#1B4332' }}
                >
                    {linkLabel}
                    <IconArrowLeft size={14} color={light ? 'rgba(255,255,255,0.85)' : '#1B4332'} />
                </Link>
            )}
        </div>
    )
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*                               PAGE COMPONENT                                 */
/* ──────────────────────────────────────────────────────────────────────────── */

export default async function HomePage() {
    const { blogs, books, courses, prods, stories, tests } = await getData()

    return (
        <div style={{ background: '#FAF7F2' }}>

            {/* ━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <HeroSliderSection />

            {/* ━━━━ STATS BAND ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div style={{ background: '#1B4332' }}>
                <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                        { n: '۱۵۰+', l: 'تست روانشناسی', icon: <IconBrain size={22} color="rgba(255,255,255,0.7)" /> },
                        { n: '۵٫۰۰۰+', l: 'کاربر فعال',    icon: <IconUsers size={22} color="rgba(255,255,255,0.7)" /> },
                        { n: '۵۰+',    l: 'روانشناس متخصص', icon: (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        )},
                        { n: '۱٫۰۰۰+', l: 'جلسه مشاوره',  icon: (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        )},
                    ].map(s => (
                        <div key={s.l} className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                {s.icon}
                            </div>
                            <div className="text-3xl md:text-4xl font-black text-white">{s.n}</div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,.55)' }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ━━━━ TEST CATEGORIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 px-5" style={{ background: '#FAF7F2' }}>
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        icon={<IconBrain size={22} color="white" />}
                        title="حوزه‌های تخصصی"
                        subtitle="بیش از ۱۵۰ تست در ۶ دسته‌بندی"
                        href="/tests"
                        linkLabel="همه تست‌ها"
                    />
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {[
                            { img: '/uploads/shop/69e361c6acff5.png',  title: 'استرس',    cat: 'استرس',    bg: '#FCE4EC', color: '#C62828' },
                            { img: '/uploads/shop/69e352330a67d.png',  title: 'اضطراب',   cat: 'اضطراب',   bg: '#FFFDE7', color: '#C9A84C' },
                            { img: '/uploads/shop/69e361e1b783f.png',  title: 'ترس',      cat: 'ترس',      bg: '#FFF3E0', color: '#E65100' },
                            { img: '/uploads/shop/69e361eef3621.png',  title: 'موفقیت',   cat: 'موفقیت',   bg: '#E8F5E9', color: '#1B4332' },
                            { img: '/uploads/shop/69e361d2ed414.png',  title: 'مشاوره',   cat: 'مشاوره',   bg: '#E3F2FD', color: '#1565C0' },
                            { img: '/uploads/shop/69e35052446de.png',  title: 'زوج درمانی', cat: 'زوج',   bg: '#F3E5F5', color: '#6A1B9A' },
                        ].map(c => (
                            <Link key={c.cat} href={`/tests?category=${encodeURIComponent(c.cat)}`}
                                className="group flex flex-col items-center gap-0 rounded-2xl border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
                                style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <div className="w-full h-24 overflow-hidden flex-shrink-0" style={{ background: c.bg }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={c.img} alt={c.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy" />
                                </div>
                                <div className="py-2.5 px-1 w-full text-center">
                                    <span className="text-xs font-bold group-hover:text-[#1B4332] transition-colors" style={{ color: '#3C3C3E' }}>{c.title}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━━ TESTS — Popular ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 px-5" style={{ background: '#1B4332' }}>
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        icon={<IconBrain size={22} color="#1B4332" />}
                        title="تست‌های پرطرفدار"
                        subtitle="شناخته‌شده‌ترین ابزارهای روانشناسی"
                        href="/tests"
                        linkLabel="مشاهده همه"
                        light
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(tests.length > 0 ? tests : [
                            { id: '1', slug: 'gad7',     title: 'مقیاس اضطراب GAD-7',            category: 'اضطراب',  duration: 5,  isPremium: false },
                            { id: '2', slug: 'bdi',      title: 'مقیاس افسردگی بک (BDI-II)',      category: 'افسردگی', duration: 10, isPremium: false },
                            { id: '3', slug: 'pss',      title: 'مقیاس استرس ادراک‌شده (PSS-10)', category: 'استرس',   duration: 8,  isPremium: false },
                            { id: '4', slug: 'mbti-short', title: 'تست شخصیت‌شناسی MBTI',        category: 'شخصیت',   duration: 15, isPremium: false },
                        ] as Test[]).slice(0, 4).map(test => (
                            <Link key={test.id} href={`/tests/${test.slug}`}
                                className="group flex flex-col rounded-2xl p-5 border transition-all hover:-translate-y-1 hover:shadow-xl"
                                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                        <IconBrain size={20} color="white" />
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={test.isPremium
                                            ? { background: '#FFF8E1', color: '#C9A84C' }
                                            : { background: '#E8F5E9', color: '#1B4332' }}>
                                        {test.isPremium ? 'پریمیوم' : 'رایگان'}
                                    </span>
                                </div>
                                <p className="font-bold text-sm flex-1 mb-3 leading-relaxed text-white group-hover:text-green-200 transition-colors">
                                    {test.title}
                                </p>
                                <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    {test.duration && (
                                        <span className="flex items-center gap-1">
                                            <IconClock size={11} color="rgba(255,255,255,0.55)" />
                                            {test.duration} دقیقه
                                        </span>
                                    )}
                                    <span className="w-1 h-1 rounded-full bg-white/30" />
                                    <span>{test.category}</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors group-hover:bg-white/25"
                                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                                    <IconPlay size={14} color="white" />
                                    شروع تست
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━━ COURSES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {courses.length > 0 && (
                <section className="py-16 px-5" style={{ background: '#FAF7F2' }}>
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader
                            icon={<IconPlay size={22} color="white" />}
                            title="دوره‌های آموزشی"
                            subtitle="یادگیری ساختارمند با متخصصان سلامت روان"
                            href="/courses"
                            linkLabel="همه دوره‌ها"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {courses.map(course => {
                                const price = course.salePrice ?? course.price
                                return (
                                    <Link key={course.id} href={`/courses/${course.slug}`}
                                        className="group flex flex-col rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-lg"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        {/* Thumbnail */}
                                        <div className="relative h-40 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)' }}>
                                            {course.thumbnail ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                                        <IconPlay size={28} color="white" />
                                                    </div>
                                                </div>
                                            )}
                                            {course.salePrice && course.salePrice < course.price && (
                                                <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#C62828', color: 'white' }}>
                                                    تخفیف
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            {course.category?.name && (
                                                <span className="text-xs font-semibold mb-2 self-start px-2.5 py-1 rounded-full" style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                                    {course.category.name}
                                                </span>
                                            )}
                                            <p className="font-bold text-sm leading-snug line-clamp-2 flex-1 mb-3 group-hover:text-[#1B4332] transition-colors" style={{ color: '#1C1C1E' }}>
                                                {course.title}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs mb-3" style={{ color: '#8C8C8E' }}>
                                                {course.rating && (
                                                    <span className="flex items-center gap-1">
                                                        <IconStar size={11} />
                                                        {course.rating.toFixed(1)}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <IconUsers size={11} />
                                                    {course.enrolledCount.toLocaleString('fa-IR')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <IconPlay size={11} />
                                                    {course.totalLessons} درس
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#F3EDE3' }}>
                                                <span className="font-black text-sm" style={{ color: '#1B4332' }}>
                                                    {price === 0 ? 'رایگان' : `${price.toLocaleString('fa-IR')} ت`}
                                                </span>
                                                {course.salePrice && course.price > course.salePrice && (
                                                    <span className="text-xs line-through" style={{ color: '#C0B8AE' }}>
                                                        {course.price.toLocaleString('fa-IR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ━━━━ BOOKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {books.length > 0 && (
                <section className="py-16 px-5" style={{ background: '#FAF7F2' }}>
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader
                            icon={<IconBook size={22} color="white" />}
                            title="کتاب‌خانه"
                            subtitle="کتاب‌های تخصصی روانشناسی"
                            href="/books"
                            linkLabel="همه کتاب‌ها"
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-5">
                            {books.slice(0, 4).map(b => {
                                const src = imgUrl(b.coverImage)
                                return (
                                    <Link key={b.id} href={`/books/${b.slug}`}
                                        className="group flex flex-col rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-lg"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        {/* Book cover */}
                                        <div className="aspect-[3/4] overflow-hidden relative" style={{ background: 'linear-gradient(145deg,#2D6A4F,#1B4332)' }}>
                                            {src ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={src} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                                        <IconBook size={24} color="white" />
                                                    </div>
                                                    <p className="text-white text-xs font-bold text-center leading-relaxed line-clamp-3 opacity-80">{b.title}</p>
                                                </div>
                                            )}
                                            {b.isPremium && (
                                                <div className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#C9A84C', color: 'white' }}>
                                                    ویژه
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <p className="font-bold text-xs line-clamp-2 mb-1 leading-relaxed group-hover:text-[#1B4332] transition-colors" style={{ color: '#1C1C1E' }}>
                                                {b.title}
                                            </p>
                                            <p className="text-xs mb-2" style={{ color: '#8C8C8E' }}>{b.author}</p>
                                            <p className="text-xs font-black" style={{ color: '#1B4332' }}>
                                                {b.price === 0 ? 'رایگان' : `${b.price.toLocaleString('fa-IR')} ت`}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ━━━━ STORIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {stories.length > 0 && (
                <section className="py-16 px-5" style={{ background: '#F3EDE3' }}>
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader
                            icon={<IconStory size={20} color="white" />}
                            title="داستان‌های روانشناختی"
                            subtitle="روایت‌های واقعی برای خودشناسی"
                            href="/stories"
                            linkLabel="همه داستان‌ها"
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {stories.slice(0, 4).map(s => {
                                const storySrc = imgUrl(s.mediaUrl)
                                const excerpt = s.content ? strip(s.content) : ''
                                return (
                                    <Link key={s.id} href={`/stories/${s.id}`}
                                        className="group flex flex-col rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-lg"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        {/* Cover — same aspect as books */}
                                        <div className="aspect-[3/4] overflow-hidden relative" style={{ background: 'linear-gradient(145deg,#2D6A4F,#1B4332)' }}>
                                            {storySrc ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={storySrc} alt={s.title ?? 'داستان'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                                        <IconStory size={24} color="white" />
                                                    </div>
                                                    {s.title && <p className="text-white text-xs font-bold text-center leading-relaxed line-clamp-3 opacity-80">{s.title}</p>}
                                                </div>
                                            )}
                                            {/* overlay gradient for readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                        </div>
                                        <div className="p-3">
                                            {s.title && (
                                                <p className="font-bold text-xs line-clamp-2 mb-1 leading-relaxed group-hover:text-[#1B4332] transition-colors" style={{ color: '#1C1C1E' }}>
                                                    {s.title}
                                                </p>
                                            )}
                                            {excerpt && (
                                                <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: '#8C8C8E' }}>
                                                    {excerpt}
                                                </p>
                                            )}
                                            <p className="text-xs font-semibold mt-2 flex items-center gap-1" style={{ color: '#1B4332' }}>
                                                خواندن
                                                <IconArrowLeft size={11} color="#1B4332" />
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ━━━━ SHOP / PRODUCTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {prods.length > 0 && (
                <section className="py-16 px-5" style={{ background: '#FAF7F2' }}>
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader
                            icon={<IconShop size={20} color="white" />}
                            title="فروشگاه"
                            subtitle="بسته‌ها و دوره‌های تخصصی سلامت روان"
                            href="/shop"
                            linkLabel="همه محصولات"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {prods.slice(0, 6).map(p => {
                                const price = p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price
                                const hasDiscount = p.salePrice != null && p.salePrice < p.price
                                const discountPct = hasDiscount ? Math.round((1 - p.salePrice! / p.price) * 100) : 0
                                const typeLabel: Record<string, string> = { digital: 'دیجیتال', physical: 'فیزیکی', sms: 'پیامکی', online_course: 'دوره آنلاین', composite: 'پکیج ترکیبی' }
                                const typeBg: Record<string, string> = { digital: '#E3F2FD', physical: '#FCE4EC', sms: '#E8F5E9', online_course: '#FFF3E0', composite: '#F3E5F5' }
                                const typeColor: Record<string, string> = { digital: '#1565C0', physical: '#C62828', sms: '#1B4332', online_course: '#E65100', composite: '#6A1B9A' }
                                const prodImgSrc = imgUrl(p.images?.[0])
                                return (
                                    <Link key={p.id} href={`/shop/${p.slug}`}
                                        className="group flex flex-col rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-xl"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        {/* Product image */}
                                        <div className="relative h-44 overflow-hidden flex-shrink-0"
                                            style={{ background: `linear-gradient(135deg, ${typeBg[p.type] ?? '#F3EDE3'}, #EDE6D6)` }}>
                                            {prodImgSrc ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={prodImgSrc} alt={p.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                                        style={{ background: 'rgba(27,67,50,0.1)' }}>
                                                        <IconShop size={30} color="#1B4332" />
                                                    </div>
                                                </div>
                                            )}
                                            <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
                                                style={{ background: typeBg[p.type] ?? '#F3EDE3', color: typeColor[p.type] ?? '#1B4332' }}>
                                                {typeLabel[p.type] ?? 'محصول'}
                                            </span>
                                            {hasDiscount && (
                                                <span className="absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-full shadow-sm"
                                                    style={{ background: '#C62828', color: 'white' }}>
                                                    {discountPct}٪ تخفیف
                                                </span>
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <p className="font-bold text-sm line-clamp-2 leading-relaxed flex-1 mb-3 group-hover:text-[#1B4332] transition-colors"
                                                style={{ color: '#1C1C1E' }}>
                                                {p.title}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 border-t"
                                                style={{ borderColor: '#F3EDE3' }}>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-black text-base" style={{ color: '#1B4332' }}>
                                                        {price === 0 ? 'رایگان' : `${(price / 10).toLocaleString('fa-IR')} تومان`}
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="text-xs line-through" style={{ color: '#C0B8AE' }}>
                                                            {(p.price / 10).toLocaleString('fa-IR')}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#1B4332' }}>
                                                    خرید
                                                    <IconArrowLeft size={12} color="#1B4332" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ━━━━ BLOG ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {blogs.length > 0 && (
                <section className="py-16 px-5" style={{ background: '#F3EDE3' }}>
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader
                            icon={<IconPen size={20} color="white" />}
                            title="مجله روانشناسی"
                            subtitle="آخرین مقالات تخصصی"
                            href="/blog"
                            linkLabel="همه مقالات"
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {blogs.slice(0, 8).map(p => {
                                const src = imgUrl(p.coverImage)
                                return (
                                    <Link key={p.id} href={`/blog/${p.slug}`}
                                        className="group flex flex-col rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-lg"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        <div className="aspect-[16/9] overflow-hidden relative flex-shrink-0" style={{ background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}>
                                            {src ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={src} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(27,67,50,0.12)' }}>
                                                        <IconPen size={18} color="#1B4332" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col flex-1">
                                            <p className="font-bold text-xs line-clamp-2 mb-1.5 group-hover:text-[#1B4332] transition-colors leading-relaxed flex-1" style={{ color: '#1C1C1E' }}>
                                                {p.title}
                                            </p>
                                            <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ color: '#8C8C8E', borderColor: '#F3EDE3' }}>
                                                <div className="flex items-center gap-1.5">
                                                    {p.readTime && (
                                                        <span className="flex items-center gap-0.5">
                                                            <IconClock size={10} />
                                                            {p.readTime} دقیقه
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-semibold flex items-center gap-0.5" style={{ color: '#1B4332' }}>
                                                    ادامه
                                                    <IconArrowLeft size={11} color="#1B4332" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ━━━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-20 px-5" style={{ background: '#1B4332' }}>
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-4">سفر سلامت روان را شروع کنید</h2>
                    <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,.65)' }}>
                        با ابزارهای علمی یاری‌جو، خودتان را بهتر بشناسید.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/tests"
                            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity"
                            style={{ background: 'white', color: '#1B4332' }}>
                            <IconBrain size={18} color="#1B4332" />
                            شروع با تست رایگان
                        </Link>
                        <Link href="/psychologists"
                            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base border-2 text-white hover:bg-white/10 transition-colors"
                            style={{ borderColor: 'rgba(255,255,255,.35)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            مشاوره با روانشناس
                        </Link>
                    </div>
                </div>
            </section>

            {/* ━━━━ FAQ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-16 px-5" style={{ background: '#FAF7F2' }}>
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#1B4332' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                        </div>
                        <h2 className="text-2xl font-black" style={{ color: '#1C1C1E' }}>سوالات متداول</h2>
                    </div>
                    <div className="space-y-2">
                        {[
                            { q: 'تست‌های روانشناسی یاری‌جو چقدر معتبر هستند؟', a: 'تمام تست‌ها از ابزارهای استاندارد بین‌المللی ترجمه و اعتباریابی شده‌اند.' },
                            { q: 'آیا نتایج تست‌ها محرمانه است؟', a: 'بله، تمام اطلاعات کاملاً محرمانه بوده و بدون رضایت شما به اشتراک گذاشته نمی‌شود.' },
                            { q: 'چگونه با روانشناس مشاوره بگیرم؟', a: 'از بخش روانشناسان، متخصص مورد نظر را انتخاب، زمان رزرو و پس از پرداخت جلسه برگزار می‌شود.' },
                            { q: 'هزینه مشاوره چقدر است؟', a: 'قیمت هر جلسه بسته به تخصص روانشناس در صفحه پروفایل نمایش داده می‌شود.' },
                        ].map((f, i) => (
                            <details key={i} className="group rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold list-none select-none hover:bg-[#F3EDE3] transition-colors" style={{ color: '#1C1C1E' }}>
                                    {f.q}
                                    <span className="flex-shrink-0 group-open:rotate-180 transition-transform duration-300">
                                        <IconChevronDown size={15} color="#8C8C8E" />
                                    </span>
                                </summary>
                                <div className="px-5 pb-4 pt-1 text-sm leading-relaxed border-t" style={{ color: '#5C5C5E', borderColor: '#EDE6D6' }}>
                                    {f.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}
