import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

interface PageProps {
    params: Promise<{ slug: string }>
}

function imgUrl(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    return path.startsWith('/') ? path : `/${path}`
}

async function getBook(slug: string): Promise<Book | null> {
    try {
        const res = await fetch(`${API}/books/${slug}`, { next: { revalidate: 300 } })
        if (!res.ok) return null
        const json = await res.json() as { data: Book }
        return json.data
    } catch {
        return null
    }
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

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            <div className="max-w-5xl mx-auto px-5 py-12">
                {/* Back */}
                <Link href="/books" className="inline-flex items-center gap-2 text-sm font-semibold mb-8 hover:opacity-70 transition-opacity"
                    style={{ color: '#1B4332' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                    بازگشت به کتاب‌خانه
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
                    {/* Cover + CTA */}
                    <div>
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-6"
                            style={{ aspectRatio: '3/4', background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}>
                            {src
                                ? <img src={src} alt={book.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">📖</div>}
                        </div>

                        {/* Price & CTA */}
                        <div className="rounded-2xl p-5 border" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                            <div className="text-2xl font-black mb-1" style={{ color: '#1B4332' }}>
                                {book.price > 0 ? `${book.price.toLocaleString('fa-IR')} تومان` : 'رایگان'}
                            </div>
                            {book.isPremium && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full mb-3 inline-block"
                                    style={{ background: '#FFF8E1', color: '#C9A84C' }}>پریمیوم</span>
                            )}
                            <div className="flex flex-col gap-2 mt-4">
                                <Link href={`/books/reader/${book.slug}`}
                                    className="block text-center py-3 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                                    style={{ background: '#1B4332' }}>
                                    📖 مطالعه آنلاین
                                </Link>
                                {book.price > 0 && (
                                    <button className="w-full py-3 font-bold rounded-xl border-2 transition-colors hover:bg-[#F3EDE3]"
                                        style={{ borderColor: '#1B4332', color: '#1B4332', background: 'transparent' }}>
                                        🛒 خرید کتاب
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="mt-4 rounded-2xl p-4 border" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: '#8C8C8E' }}>نویسنده</span>
                                    <span className="font-semibold" style={{ color: '#1C1C1E' }}>{book.author}</span>
                                </div>
                                {book.totalPages && (
                                    <div className="flex justify-between">
                                        <span style={{ color: '#8C8C8E' }}>تعداد صفحات</span>
                                        <span className="font-semibold" style={{ color: '#1C1C1E' }}>{book.totalPages.toLocaleString('fa-IR')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span style={{ color: '#8C8C8E' }}>دسترسی</span>
                                    <span className="font-semibold" style={{ color: book.isPremium ? '#C9A84C' : '#1B4332' }}>
                                        {book.isPremium ? 'پریمیوم' : 'رایگان'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black mb-2 leading-relaxed" style={{ color: '#1C1C1E' }}>
                            {book.title}
                        </h1>
                        <p className="text-base mb-6 font-medium" style={{ color: '#8C8C8E' }}>{book.author}</p>

                        {book.description && (
                            <div className="rounded-2xl p-6 border mb-6" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <h2 className="font-bold text-lg mb-4" style={{ color: '#1C1C1E' }}>درباره کتاب</h2>
                                <div
                                    className="text-[15px] leading-[2]"
                                    style={{ color: '#5C5C5E' }}
                                    dangerouslySetInnerHTML={{ __html: book.description }}
                                />
                            </div>
                        )}

                        {/* Read CTA */}
                        <div className="rounded-2xl p-6 border" style={{ background: '#E8F5E9', borderColor: '#B2DFDB' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">📚</span>
                                <div>
                                    <p className="font-bold" style={{ color: '#1B4332' }}>مطالعه آنلاین</p>
                                    <p className="text-[13px]" style={{ color: '#2D6A4F' }}>
                                        با book reader یاری‌جو، کتاب را مستقیم در مرورگر بخوانید
                                    </p>
                                </div>
                            </div>
                            <Link href={`/books/reader/${book.slug}`}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[14px] text-white hover:opacity-90 transition-opacity"
                                style={{ background: '#1B4332' }}>
                                شروع مطالعه ←
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
