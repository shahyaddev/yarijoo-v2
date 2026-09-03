import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    IconArrowLeft,
    IconBook,
    IconUser,
    IconInfo,
    IconCheck,
    IconStar,
    IconDownload,
    IconMoney,
    IconPlay,
} from '@/components/ui/Icon'
import { imgUrl } from '@/lib/imgUrl'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

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

interface PageProps { params: Promise<{ slug: string }> }


async function getBook(slug: string): Promise<Book | null> {
    try {
        const res = await fetch(`${API}/books/${slug}`, { next: { revalidate: 300 } })
        if (!res.ok) return null
        const json = await res.json() as { data: Book }
        return json.data
    } catch { return null }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const book = await getBook(slug)
    return {
        title: book ? `${book.title} | یاری‌جو` : 'کتاب | یاری‌جو',
        description: book?.description?.replace(/<[^>]*>/g, '').slice(0, 160),
    }
}

export default async function BookDetailPage({ params }: PageProps) {
    const { slug } = await params
    const book = await getBook(slug)
    if (!book) notFound()

    const src = imgUrl(book.coverImage)

    const metaRows = [
        { Icon: IconUser,     label: 'نویسنده',      value: book.author },
        { Icon: IconMoney,    label: 'قیمت',          value: book.price > 0 ? `${book.price.toLocaleString('fa-IR')} تومان` : 'رایگان' },
        { Icon: IconStar,     label: 'دسترسی',        value: book.isPremium ? 'پریمیوم' : 'رایگان', highlight: book.isPremium },
        ...(book.totalPages ? [{ Icon: IconBook, label: 'تعداد صفحات', value: book.totalPages.toLocaleString('fa-IR'), highlight: false }] : []),
    ] as { Icon: React.FC<{ size?: number; color?: string }>; label: string; value: string; highlight?: boolean }[]

    const features = [
        'مطالعه آنلاین در مرورگر',
        'دسترسی دائمی پس از خرید',
        'قابل خواندن روی موبایل',
        'بدون نیاز به نصب برنامه',
    ]

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            {/* Top bar */}
            <div style={{ background: '#1B4332' }}>
                <div className="max-w-5xl mx-auto px-5 py-4">
                    <nav className="flex items-center gap-2 text-sm" aria-label="breadcrumb">
                        <Link href="/books"
                            className="flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity"
                            style={{ color: 'rgba(255,255,255,0.75)' }}>
                            <IconArrowLeft size={14} color="rgba(255,255,255,0.75)" />
                            کتاب‌خانه
                        </Link>
                        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
                        <span className="truncate max-w-[200px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{book.title}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-5 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

                    {/* ── Content column ── */}
                    <div className="space-y-6 order-2 lg:order-1">

                        {/* Cover with badge */}
                        <div className="relative">
                            <div className="rounded-2xl overflow-hidden"
                                style={{ aspectRatio: '3/2', background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)', boxShadow: '0 4px 24px rgba(27,67,50,0.10)' }}>
                                {src
                                    ? <img src={src} alt={book.title} className="w-full h-full object-cover" />
                                    : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                            <IconBook size={56} color="#C8B99A" />
                                            <span className="text-xs" style={{ color: '#C8B99A' }}>بدون جلد</span>
                                        </div>
                                    )}
                            </div>
                            {book.isPremium && (
                                <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full z-10"
                                    style={{ background: '#FEF3C7', color: '#78350F', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                                    پریمیوم
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-2xl md:text-[28px] font-black leading-snug" style={{ color: '#1C1C1E' }}>
                                {book.title}
                            </h1>
                            <p className="text-sm mt-1.5 flex items-center gap-1.5" style={{ color: '#6B7280' }}>
                                <IconUser size={13} color="#9CA3AF" />
                                {book.author}
                            </p>
                        </div>

                        {/* Specs */}
                        <div>
                            <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1C1C1E' }}>
                                <span className="w-1 h-4 rounded-full inline-block shrink-0" style={{ background: '#1B4332' }} />
                                مشخصات
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {metaRows.map(({ Icon, label, value, highlight }) => (
                                    <div key={label}
                                        className="flex items-center gap-2.5 p-3 rounded-xl"
                                        style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: highlight ? '#FEF3C7' : '#F3EDE3' }}>
                                            <Icon size={13} color={highlight ? '#78350F' : '#1B4332'} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] leading-none mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
                                            <p className="text-xs font-bold truncate" style={{ color: highlight ? '#92400E' : '#1C1C1E' }}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px" style={{ background: '#EDE6D6' }} />

                        {/* Description */}
                        {book.description ? (
                            <div>
                                <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1C1C1E' }}>
                                    <span className="w-1 h-4 rounded-full inline-block shrink-0" style={{ background: '#1B4332' }} />
                                    درباره این کتاب
                                </h2>
                                <div className="text-sm leading-8" style={{ color: '#4B5563' }}
                                    dangerouslySetInnerHTML={{ __html: book.description }} />
                            </div>
                        ) : (
                            <p className="text-sm italic" style={{ color: '#9CA3AF' }}>توضیحاتی ثبت نشده است.</p>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-4 order-1 lg:order-2 lg:sticky lg:top-6">

                        {/* Buy card */}
                        <div className="rounded-2xl overflow-hidden"
                            style={{ background: 'white', border: '1px solid #E8E0D4', boxShadow: '0 2px 20px rgba(27,67,50,0.08)' }}>

                            <div className="px-5 py-4" style={{ borderBottom: '1px solid #F3EDE3' }}>
                                <div className="text-[22px] font-black" style={{ color: '#1B4332' }}>
                                    {book.price > 0 ? `${book.price.toLocaleString('fa-IR')} تومان` : 'رایگان'}
                                </div>
                                {book.isPremium && (
                                    <p className="text-xs mt-0.5" style={{ color: '#92400E' }}>نیاز به اشتراک پریمیوم</p>
                                )}
                            </div>

                            <div className="p-4 space-y-2.5">
                                <Link href={`/books/reader/${book.slug}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                                    style={{ background: '#1B4332' }}>
                                    <IconPlay size={16} color="white" />
                                    مطالعه آنلاین
                                </Link>
                                {book.price > 0 && (
                                    <button className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm border-2 transition-colors hover:opacity-80"
                                        style={{ borderColor: '#1B4332', color: '#1B4332', background: 'transparent' }}>
                                        <IconDownload size={15} color="#1B4332" />
                                        خرید کتاب
                                    </button>
                                )}
                            </div>

                            <div className="px-5 pb-4 space-y-2">
                                {features.map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                                        <span className="w-4 h-4 rounded-md flex items-center justify-center shrink-0" style={{ background: '#D1FAE5' }}>
                                            <IconCheck size={10} color="#065F46" strokeWidth={3} />
                                        </span>
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Read CTA card */}
                        <div className="rounded-2xl p-4 flex items-start gap-3"
                            style={{ background: '#F0FDF4', border: '1px solid #A7F3D0' }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#D1FAE5' }}>
                                <IconInfo size={15} color="#065F46" />
                            </div>
                            <div>
                                <p className="font-bold text-sm" style={{ color: '#065F46' }}>مطالعه آنلاین</p>
                                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#047857' }}>
                                    با book reader یاری‌جو، کتاب را مستقیم در مرورگر بخوانید.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
