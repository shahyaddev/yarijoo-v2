import Link from 'next/link'
import HeroSliderSection from '@/components/features/home/HeroSliderSection'

export const revalidate = 0

/* ── Types ── */
interface BlogPost { id: string; slug: string; title: string; excerpt: string | null; coverImage: string | null; publishedAt: string | null }
interface Book { id: string; slug: string; title: string; author: string; coverImage: string | null; price: number }
interface Product { id: string; slug: string; title: string; price: number; salePrice: number | null; images: string[] | null; type: string }
interface Story { id: string; title: string | null; content: string; mediaUrl: string | null }

function img(p: string | null | undefined): string | null {
    if (!p) return null
    if (p.startsWith('http')) return p
    if (p.startsWith('/uploads')) return p
    return `/${p}`
}
function stImg(p: string | null | undefined): string | null {
    if (!p) return null
    if (p.startsWith('http')) return p
    return `/uploads/stories/${p.split('/').pop()}`
}
function strip(h: string) { return h.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().slice(0, 110) }
function fmtDate(iso: string | null) {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) } catch { return '' }
}
const PICONS: Record<string, string> = { sms: '📱', online_course: '🎓', composite: '📦', book: '📖', story: '📜', physical: '🎁', test: '🧠' }

async function getData() {
    const A = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'
    const [bR, bkR, pR, stR] = await Promise.allSettled([
        fetch(`${A}/blog?limit=6`, { cache: 'no-store' }),
        fetch(`${A}/books?limit=8`, { cache: 'no-store' }),
        fetch(`${A}/shop/products?limit=8`, { cache: 'no-store' }),
        fetch(`${A}/stories?limit=8`, { cache: 'no-store' }),
    ])
    const blogs: BlogPost[] = bR.status === 'fulfilled' && bR.value.ok ? (await bR.value.json() as any).data?.posts ?? [] : []
    const books: Book[] = bkR.status === 'fulfilled' && bkR.value.ok ? (await bkR.value.json() as any).data?.books ?? [] : []
    const prods: Product[] = pR.status === 'fulfilled' && pR.value.ok ? (await pR.value.json() as any).data?.products ?? [] : []
    let stories: Story[] = []
    if (stR.status === 'fulfilled' && stR.value.ok) {
        try { const j = (await stR.value.json() as any).data; stories = Array.isArray(j) ? j : j?.stories ?? [] } catch { }
    }
    return { blogs, books, prods, stories }
}

/* ── Section heading ── */
function H({ t, s, href, lbl }: { t: string; s?: string; href?: string; lbl?: string }) {
    return (
        <div className="flex items-end justify-between mb-8">
            <div>
                <h2 className="text-2xl md:text-3xl font-black" style={{ color: '#1C1C1E' }}>{t}</h2>
                {s && <p className="text-sm mt-1" style={{ color: '#8C8C8E' }}>{s}</p>}
            </div>
            {href && lbl && (
                <Link href={href} className="text-sm font-bold hover:opacity-70 transition-opacity flex items-center gap-1 shrink-0" style={{ color: '#1B4332' }}>
                    {lbl}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: 'scaleX(-1)' }}><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
            )}
        </div>
    )
}

export default async function HomePage() {
    const { blogs, books, prods, stories } = await getData()

    return (
        <div style={{ background: '#FAF7F2' }}>

            {/* ── Hero slider ── */}
            <HeroSliderSection />

            {/* ── Stats — full-width green band ── */}
            <div style={{ background: '#1B4332' }}>
                <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                        { n: '۱۵۰+', l: 'تست روانشناسی' },
                        { n: '۵٫۰۰۰+', l: 'کاربر فعال' },
                        { n: '۵۰+', l: 'روانشناس متخصص' },
                        { n: '۱٫۰۰۰+', l: 'جلسه مشاوره' },
                    ].map(s => (
                        <div key={s.l}>
                            <div className="text-3xl md:text-4xl font-black text-white mb-1">{s.n}</div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,.55)' }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Quick links — 6 pill cards ── */}
            <section className="py-16 px-5" style={{ background: '#FAF7F2' }}>
                <div className="max-w-7xl mx-auto">
                    <H t="حوزه‌های تخصصی" s="بیش از ۱۵۰ تست در ۶ دسته‌بندی" href="/tests" lbl="همه تست‌ها" />
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {[
                            { icon: '🧬', title: 'شخصیت', slug: 'personality', bg: '#E8F5E9' },
                            { icon: '😰', title: 'اضطراب', slug: 'anxiety', bg: '#FFFDE7' },
                            { icon: '😢', title: 'افسردگی', slug: 'depression', bg: '#E3F2FD' },
                            { icon: '💪', title: 'استرس', slug: 'stress', bg: '#FCE4EC' },
                            { icon: '🤝', title: 'روابط', slug: 'relationship', bg: '#F3E5F5' },
                            { icon: '🧠', title: 'شناختی', slug: 'cognitive', bg: '#E0F7FA' },
                        ].map(c => (
                            <Link key={c.slug} href={`/tests?category=${c.slug}`}
                                className="group flex flex-col items-center gap-2.5 py-4 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md"
                                style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: c.bg }}>{c.icon}</div>
                                <span className="text-xs font-semibold group-hover:text-[#1B4332] transition-colors" style={{ color: '#3C3C3E' }}>{c.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Blog ── */}
            {blogs.length > 0 && (
                <section className="py-16 px-5" style={{ background: '#F3EDE3' }}>
                    <div className="max-w-7xl mx-auto">
                        <H t="مجله روانشناسی" s="آخرین مقالات تخصصی" href="/blog" lbl="همه مقالات" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {blogs.map(p => {
                                const src = img(p.coverImage)
                                return (
                                    <Link key={p.id} href={`/blog/${p.slug}`}
                                        className="group block rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-lg"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        <div className="aspect-[16/9] overflow-hidden" style={{ background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}>
                                            {src ? <img src={src} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📰</div>}
                                        </div>
                                        <div className="p-4">
                                            <p className="font-bold text-[14px] line-clamp-2 mb-2 group-hover:text-[#1B4332] transition-colors leading-relaxed" style={{ color: '#1C1C1E' }}>{p.title}</p>
                                            {p.excerpt && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: '#8C8C8E' }}>{p.excerpt}</p>}
                                            <div className="flex justify-between text-xs" style={{ color: '#8C8C8E' }}>
                                                <span>{fmtDate(p.publishedAt)}</span>
                                                <span className="font-semibold" style={{ color: '#1B4332' }}>ادامه ←</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Popular tests (static showcase) ── */}
            <section className="py-16 px-5" style={{ background: '#FAF7F2' }}>
                <div className="max-w-7xl mx-auto">
                    <H t="تست‌های پرطرفدار" s="شناخته‌شده‌ترین ابزارهای روانشناسی" href="/tests" lbl="مشاهده همه" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'تست MBTI شخصیت‌شناسی', cat: 'شخصیت', mins: 20, qs: 93, free: true, icon: '🧬', slug: 'mbti' },
                            { title: 'مقیاس افسردگی بک (BDI)', cat: 'افسردگی', mins: 10, qs: 21, free: true, icon: '😢', slug: 'bdi' },
                            { title: 'مقیاس اضطراب GAD-7', cat: 'اضطراب', mins: 5, qs: 7, free: true, icon: '😰', slug: 'gad7' },
                            { title: 'آزمون استرس ادراک‌شده PSS', cat: 'استرس', mins: 8, qs: 14, free: false, icon: '💪', slug: 'pss' },
                        ].map((test, i) => (
                            <Link key={i} href={`/tests/${test.slug}`}
                                className="group flex flex-col rounded-2xl p-5 border transition-all hover:-translate-y-1 hover:shadow-lg"
                                style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: '#F3EDE3' }}>{test.icon}</div>
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full"
                                        style={test.free ? { background: '#E8F5E9', color: '#1B4332' } : { background: '#FFF8E1', color: '#C9A84C' }}>
                                        {test.free ? 'رایگان' : 'پریمیوم'}
                                    </span>
                                </div>
                                <p className="font-bold text-sm flex-1 mb-3 leading-relaxed group-hover:text-[#1B4332] transition-colors" style={{ color: '#1C1C1E' }}>{test.title}</p>
                                <div className="flex items-center gap-3 text-xs mb-3" style={{ color: '#8C8C8E' }}>
                                    <span>⏱ {test.mins} دقیقه</span>
                                    <span>❓ {test.qs} سوال</span>
                                </div>
                                <div className="text-center py-2 rounded-xl text-white text-xs font-bold" style={{ background: '#1B4332' }}>شروع تست</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Books ── */}
            {books.length > 0 && (
                <section className="py-16 px-5" style={{ background: '#F3EDE3' }}>
                    <div className="max-w-7xl mx-auto">
                        <H t="کتاب‌خانه" s="کتاب‌های تخصصی روانشناسی" href="/books" lbl="همه کتاب‌ها" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                            {books.map(b => {
                                const src = img(b.coverImage)
                                return (
                                    <Link key={b.id} href={`/books/${b.slug}`}
                                        className="group block rounded-xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-md"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        <div className="aspect-[3/4] overflow-hidden" style={{ background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}>
                                            {src ? <img src={src} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-2xl opacity-25">📖</div>}
                                        </div>
                                        <div className="p-2">
                                            <p className="font-semibold text-[11px] line-clamp-2 mb-1 leading-relaxed group-hover:text-[#1B4332] transition-colors" style={{ color: '#1C1C1E' }}>{b.title}</p>
                                            <p className="text-[10px] font-bold" style={{ color: '#1B4332' }}>{b.price === 0 ? 'رایگان' : `${b.price.toLocaleString('fa-IR')} ت`}</p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Stories ── */}
            {stories.length > 0 && (
                <section className="py-16 px-5" style={{ background: '#FAF7F2' }}>
                    <div className="max-w-7xl mx-auto">
                        <H t="داستان‌های روانشناختی" s="روایت‌های واقعی برای خودشناسی" href="/stories" lbl="همه داستان‌ها" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                            {stories.map(s => {
                                const src = stImg(s.mediaUrl)
                                const excerpt = s.content ? strip(s.content) : ''
                                return (
                                    <Link key={s.id} href={`/stories/${s.id}`}
                                        className="group block rounded-xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-md"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        <div className="aspect-[3/4] overflow-hidden" style={{ background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}>
                                            {src
                                                ? <img src={src} alt={s.title ?? 'داستان'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                                : <div className="w-full h-full flex items-center justify-center text-2xl opacity-25">📖</div>}
                                        </div>
                                        <div className="p-2">
                                            {s.title && <p className="font-semibold text-[11px] line-clamp-2 mb-1 leading-relaxed group-hover:text-[#1B4332] transition-colors" style={{ color: '#1C1C1E' }}>{s.title}</p>}
                                            {excerpt && <p className="text-[10px] line-clamp-2 leading-relaxed" style={{ color: '#8C8C8E' }}>{excerpt}</p>}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Products ── */}
            {prods.length > 0 && (
                <section className="py-16 px-5" style={{ background: '#F3EDE3' }}>
                    <div className="max-w-7xl mx-auto">
                        <H t="فروشگاه" s="بسته‌ها و محصولات تخصصی" href="/shop" lbl="همه محصولات" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {prods.map(p => {
                                const imgSrc = (() => { const i = p.images?.[0]; if (!i) return null; return i.startsWith('http') ? i : `/uploads/shop/${i.split('/').pop()}` })()
                                const price = p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price
                                return (
                                    <Link key={p.id} href={`/shop/${p.slug}`}
                                        className="group block rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-lg"
                                        style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                        <div className="aspect-square overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}>
                                            {imgSrc ? <img src={imgSrc} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <span className="text-4xl opacity-30">{PICONS[p.type] ?? '📦'}</span>}
                                        </div>
                                        <div className="p-4">
                                            <p className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-[#1B4332] transition-colors leading-relaxed" style={{ color: '#1C1C1E' }}>{p.title}</p>
                                            <span className="text-sm font-black" style={{ color: '#1B4332' }}>
                                                {price === 0 ? 'رایگان' : `${price.toLocaleString('fa-IR')} `}
                                                {price > 0 && <span className="text-xs font-normal" style={{ color: '#8C8C8E' }}>تومان</span>}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA ── */}
            <section className="py-20 px-5" style={{ background: '#1B4332' }}>
                <div className="max-w-2xl mx-auto text-center">
                    <div className="text-5xl mb-5">🌱</div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-4">سفر سلامت روان را شروع کنید</h2>
                    <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,.65)' }}>با ابزارهای علمی یاری‌جو، خودتان را بهتر بشناسید.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/tests" className="px-8 py-3.5 rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity" style={{ background: 'white', color: '#1B4332' }}>شروع با تست رایگان</Link>
                        <Link href="/psychologists" className="px-8 py-3.5 rounded-xl font-bold text-[15px] border-2 text-white hover:bg-white/10 transition-colors" style={{ borderColor: 'rgba(255,255,255,.35)' }}>مشاوره با روانشناس</Link>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="py-16 px-5" style={{ background: '#FAF7F2' }}>
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-black mb-2" style={{ color: '#1C1C1E' }}>سوالات متداول</h2>
                    </div>
                    {[
                        { q: 'تست‌های روانشناسی یاری‌جو چقدر معتبر هستند؟', a: 'تمام تست‌ها از ابزارهای استاندارد بین‌المللی ترجمه و اعتباریابی شده‌اند.' },
                        { q: 'آیا نتایج تست‌ها محرمانه است؟', a: 'بله، تمام اطلاعات کاملاً محرمانه بوده و بدون رضایت شما به اشتراک گذاشته نمی‌شود.' },
                        { q: 'چگونه با روانشناس مشاوره بگیرم؟', a: 'از بخش روانشناسان، متخصص مورد نظر را انتخاب، زمان رزرو و پس از پرداخت جلسه برگزار می‌شود.' },
                        { q: 'هزینه مشاوره چقدر است؟', a: 'قیمت هر جلسه بسته به تخصص روانشناس در صفحه پروفایل نمایش داده می‌شود.' },
                    ].map((f, i) => (
                        <details key={i} className="group rounded-2xl border mb-2 overflow-hidden" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold list-none select-none hover:bg-[#F3EDE3] transition-colors" style={{ color: '#1C1C1E' }}>
                                {f.q}
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 group-open:rotate-180 transition-transform duration-300" style={{ color: '#8C8C8E' }}><polyline points="6 9 12 15 18 9" /></svg>
                            </summary>
                            <div className="px-5 pb-4 pt-1 text-sm leading-relaxed border-t" style={{ color: '#5C5C5E', borderColor: '#EDE6D6' }}>{f.a}</div>
                        </details>
                    ))}
                </div>
            </section>

        </div>
    )
}
