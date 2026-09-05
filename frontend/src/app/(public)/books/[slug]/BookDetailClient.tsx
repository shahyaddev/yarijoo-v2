'use client'

import Link from 'next/link'
import {
    IconBook,
    IconUser,
    IconCheck,
    IconPlay,
    IconMoney,
    IconMobile,
    IconShield,
    IconBookmark,
    IconHeadset,
    IconShare,
    IconList,
    IconDocument,
    IconAngleLeft,
    IconArrowLeft,
} from '@/components/ui/Icon'

interface Page { index: number; title: string }

interface Book {
    id: string
    slug: string
    title: string
    author: string
    description: string | null
    coverImage: string | null
    price: number
    isPremium: boolean
    totalPages: number | null
}

interface Props {
    book: Book
    coverSrc: string | null
    pages: Page[]
    totalPages: number
}

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

function MetaBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
            style={{ background: 'rgba(27,67,50,0.06)', borderColor: 'rgba(27,67,50,0.12)' }}>
            <span className="flex items-center shrink-0">{icon}</span>
            <span className="text-sm font-medium" style={{ color: '#1C1C1E' }}>{text}</span>
        </div>
    )
}

function SectionTitle({ icon, text, sub }: { icon: React.ReactNode; text: string; sub?: string }) {
    return (
        <div className="flex items-center gap-2 mb-5">
            <span className="flex items-center">{icon}</span>
            <h2 className="text-lg font-black" style={{ color: '#1C1C1E' }}>{text}</h2>
            {sub && <span className="text-sm" style={{ color: '#8C8C8E' }}>{sub}</span>}
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="feature-card flex items-center gap-4 p-5 rounded-2xl border transition-all duration-200"
            style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 2px 8px rgba(27,67,50,0.05)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#EDF7F0' }}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold mb-0.5" style={{ color: '#1C1C1E' }}>{title}</p>
                <p className="text-xs" style={{ color: '#8C8C8E' }}>{desc}</p>
            </div>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BookDetailClient({ book, coverSrc, pages, totalPages }: Props) {

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh', direction: 'rtl' }}>
            <style>{`
                /* breadcrumb */
                .bc-link { color: #8C8C8E; font-size:13px; text-decoration:none; display:flex; align-items:center; gap:5px; transition:color .2s; }
                .bc-link:hover { color: #1B4332; }
                /* read button */
                .read-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; height:52px; border-radius:16px; background:#1B4332; color:white; font-weight:700; font-size:15px; text-decoration:none; box-shadow:0 6px 20px rgba(27,67,50,0.25); transition:opacity .2s, transform .2s; }
                .read-btn:hover { opacity:.9; transform:translateY(-1px); }
                /* action buttons */
                .action-btn { width:100%; display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:12px; background:white; border:1px solid #EDE6D6; color:#5C5C5E; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; font-family:inherit; }
                .action-btn:hover { border-color:#2D6A4F; color:#1B4332; background:#F0FBF4; }
                /* table of contents items */
                .toc-item { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:14px; background:white; border:1px solid #EDE6D6; transition:all .2s; text-decoration:none; }
                .toc-item:hover { border-color:#2D6A4F; background:#F0FBF4; box-shadow:0 2px 8px rgba(27,67,50,0.08); }
                .toc-item:hover .toc-title { color:#1B4332; }
                .toc-item:hover .toc-arrow { color:#2D6A4F; }
                /* feature card hover */
                .feature-card:hover { border-color:#A8D5B5 !important; box-shadow:0 4px 16px rgba(27,67,50,0.10) !important; }
                /* back link */
                .back-link { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#8C8C8E; text-decoration:none; transition:color .2s; }
                .back-link:hover { color:#1B4332; }
                /* info rows */
                .info-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; }
                .info-row + .info-row { border-top:1px solid #EDE6D6; }
                /* sidebar card */
                .sidebar-card { background:white; border-radius:20px; border:1px solid #EDE6D6; box-shadow:0 2px 12px rgba(27,67,50,0.07); overflow:hidden; }
                /* book description — full HTML content from rich text editor */
                .book-desc { font-size:14px; line-height:2; color:#4B5563; text-align:justify; }
                .book-desc p { margin:0 0 14px; }
                .book-desc p:last-child { margin-bottom:0; }
                .book-desc h1,.book-desc h2,.book-desc h3,.book-desc h4 { color:#1C1C1E; font-weight:700; margin:18px 0 10px; line-height:1.5; }
                .book-desc h2 { font-size:16px; }
                .book-desc h3 { font-size:15px; }
                .book-desc ul,.book-desc ol { padding-right:20px; margin:0 0 14px; }
                .book-desc li { margin-bottom:6px; }
                .book-desc strong,.book-desc b { font-weight:700; color:#1C1C1E; }
                .book-desc em,.book-desc i { font-style:italic; }
                .book-desc a { color:#1B4332; text-decoration:underline; }
                .book-desc blockquote { border-right:3px solid #1B4332; padding:10px 16px; margin:14px 0; background:#F3EDE3; border-radius:0 10px 10px 0; color:#5C5C5E; }
                .book-desc span[style*="font-size"] { font-size:inherit !important; }
            `}</style>

            {/* ── Breadcrumb ── */}
            <div style={{ background: '#1B4332' }}>
                <div className="max-w-[1280px] mx-auto px-4">
                    <div className="flex items-center gap-2.5" style={{ height: 52, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        <Link href="/" className="bc-link" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            صفحه اصلی
                        </Link>
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>/</span>
                        <Link href="/books" className="bc-link" style={{ color: 'rgba(255,255,255,0.6)' }}>کتاب‌ها</Link>
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>/</span>
                        <span className="text-sm font-semibold truncate max-w-[220px]"
                            style={{ color: 'rgba(255,255,255,0.85)' }}>
                            {book.title}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-[1280px] mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ══════════════════════════════════
                        SIDEBAR  (right on desktop)
                    ══════════════════════════════════ */}
                    <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">

                        {/* Cover */}
                        <div className="sidebar-card" style={{ padding: 0 }}>
                            <div style={{
                                position: 'relative', aspectRatio: '3/4',
                                background: 'linear-gradient(145deg,#EDE6D6,#DDD5C5)',
                            }}>
                                {coverSrc ? (
                                    <img src={coverSrc} alt={book.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center flex-col gap-3">
                                        <IconBook size={56} color="#C8B99A" />
                                        <span className="text-xs" style={{ color: '#C8B99A' }}>بدون جلد</span>
                                    </div>
                                )}
                                {/* Gradient bottom overlay */}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
                                    background: 'linear-gradient(to top, rgba(27,67,50,0.18), transparent)',
                                }} />
                                {book.isPremium && (
                                    <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg"
                                        style={{ background: '#FEF3C7', color: '#78350F' }}>
                                        پریمیوم
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Price + CTA */}
                        <div className="sidebar-card p-5">
                            <div className="flex items-center justify-between pb-4 mb-4"
                                style={{ borderBottom: '1px solid #EDE6D6' }}>
                                <span className="text-sm" style={{ color: '#8C8C8E' }}>قیمت کتاب:</span>
                                <span className="text-2xl font-black" style={{ color: '#1B4332' }}>
                                    {book.price > 0
                                        ? `${toFarsi(book.price.toLocaleString())} تومان`
                                        : 'رایگان'}
                                </span>
                            </div>
                            <Link href={`/books/reader/${book.slug}`} className="read-btn">
                                <IconPlay size={18} color="white" />
                                شروع مطالعه کتاب
                            </Link>
                        </div>

                        {/* Book info */}
                        <div className="sidebar-card p-5">
                            <div className="flex items-center gap-2 mb-1">
                                <IconDocument size={15} color="#1B4332" />
                                <h3 className="text-sm font-bold" style={{ color: '#1C1C1E' }}>اطلاعات کتاب</h3>
                            </div>
                            <div>
                                {[
                                    { label: 'نویسنده',     value: book.author,   show: !!book.author },
                                    { label: 'تعداد فصل',   value: totalPages > 0 ? `${toFarsi(totalPages)} فصل` : null, show: totalPages > 0 },
                                    { label: 'قیمت',        value: book.price > 0 ? `${toFarsi(book.price.toLocaleString())} تومان` : 'رایگان', show: true },
                                    { label: 'دسترسی',      value: book.isPremium ? 'پریمیوم' : 'رایگان', show: true },
                                    { label: 'زبان',        value: 'فارسی',       show: true },
                                    { label: 'فرمت',        value: 'آنلاین',      show: true },
                                ].filter(r => r.show && r.value).map(row => (
                                    <div key={row.label} className="info-row">
                                        <span className="text-sm" style={{ color: '#8C8C8E' }}>{row.label}:</span>
                                        <span className="text-sm font-semibold" style={{ color: '#1C1C1E' }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="sidebar-card p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                </svg>
                                <h3 className="text-sm font-bold" style={{ color: '#1C1C1E' }}>عملیات سریع</h3>
                            </div>
                            <div className="flex flex-col gap-2">
                                {[
                                    { Icon: IconBookmark, label: 'ذخیره در کتابخانه' },
                                    { Icon: IconShare,    label: 'اشتراک‌گذاری کتاب' },
                                ].map(({ Icon, label }) => (
                                    <button key={label} className="action-btn">
                                        <Icon size={15} color="#1B4332" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════
                        MAIN CONTENT
                    ══════════════════════════════════ */}
                    <div className="flex-1 min-w-0 flex flex-col gap-5">

                        {/* ── Book header ── */}
                        <div className="rounded-2xl p-6 border"
                            style={{ background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)', borderColor: 'transparent', boxShadow: '0 4px 20px rgba(27,67,50,0.18)' }}>

                            {/* Title */}
                            <div className="flex items-start gap-3 mb-5">
                                <div className="w-1 rounded-full shrink-0 mt-1"
                                    style={{ minHeight: 32, background: 'linear-gradient(to bottom,#52B788,rgba(82,183,136,0.3))' }} />
                                <h1 className="text-2xl font-black leading-snug" style={{ color: '#F0F0F0' }}>
                                    {book.title}
                                </h1>
                            </div>

                            {/* Meta badges */}
                            <div className="flex flex-wrap gap-2">
                                {book.author && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <IconUser size={14} color="rgba(255,255,255,0.7)" />
                                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{book.author}</span>
                                    </div>
                                )}
                                {totalPages > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <IconBook size={14} color="rgba(255,255,255,0.7)" />
                                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{toFarsi(totalPages)} فصل</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <IconMoney size={14} color="rgba(255,255,255,0.7)" />
                                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                        {book.price > 0 ? `${toFarsi(book.price.toLocaleString())} تومان` : 'رایگان'}
                                    </span>
                                </div>
                                {book.isPremium && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                        style={{ background: 'rgba(254,243,199,0.15)', border: '1px solid rgba(254,243,199,0.25)' }}>
                                        <IconCheck size={14} color="#FDE68A" />
                                        <span className="text-sm" style={{ color: '#FDE68A' }}>پریمیوم</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Description ── */}
                        <div className="rounded-2xl p-6 border"
                            style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 2px 8px rgba(27,67,50,0.05)' }}>
                            <SectionTitle
                                icon={<IconDocument size={20} color="#1B4332" />}
                                text="درباره کتاب"
                            />
                            {book.description ? (
                                <div
                                    className="book-desc"
                                    dangerouslySetInnerHTML={{ __html: book.description }}
                                />
                            ) : (
                                <p className="text-sm italic" style={{ color: '#8C8C8E' }}>
                                    توضیحاتی برای این کتاب موجود نیست.
                                </p>
                            )}
                        </div>

                        {/* ── Feature cards ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FeatureCard
                                icon={<IconMobile size={22} color="#1B4332" />}
                                title="قابل مطالعه در همه جا"
                                desc="در موبایل، تبلت و کامپیوتر"
                            />
                            <FeatureCard
                                icon={<IconShield size={22} color="#1B4332" />}
                                title="محتوای تضمین شده"
                                desc="کیفیت بالا و کاملاً تخصصی"
                            />
                            <FeatureCard
                                icon={<IconBookmark size={22} color="#1B4332" />}
                                title="ذخیره پیشرفت"
                                desc="از جایی که خواندید ادامه دهید"
                            />
                            <FeatureCard
                                icon={<IconHeadset size={22} color="#1B4332" />}
                                title="پشتیبانی ۲۴/۷"
                                desc="همیشه در کنار شما هستیم"
                            />
                        </div>

                        {/* ── Table of contents ── */}
                        {pages.length > 0 && (
                            <div className="rounded-2xl p-6 border"
                                style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 2px 8px rgba(27,67,50,0.05)' }}>
                                <SectionTitle
                                    icon={<IconList size={20} color="#1B4332" />}
                                    text="فهرست مطالب"
                                    sub={`(${toFarsi(pages.length)} فصل)`}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {pages.map((page, i) => (
                                        <Link
                                            key={i}
                                            href={`/books/reader/${book.slug}?page=${page.index}`}
                                            className="toc-item"
                                        >
                                            {/* Number */}
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                                                style={{ background: '#EDF7F0', color: '#1B4332' }}>
                                                {toFarsi(i + 1)}
                                            </div>
                                            {/* Title */}
                                            <span className="toc-title flex-1 text-sm truncate transition-colors"
                                                style={{ color: '#5C5C5E' }}>
                                                {page.title}
                                            </span>
                                            {/* Arrow */}
                                            <span className="toc-arrow shrink-0 transition-colors" style={{ color: '#C8C8C8' }}>
                                                <IconAngleLeft size={13} color="currentColor" />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
