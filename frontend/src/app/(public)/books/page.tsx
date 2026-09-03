import type { Metadata } from 'next'
import Link from 'next/link'
import { imgUrl } from '@/lib/imgUrl'

// no-cache to always get fresh data
export const revalidate = 0

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'کتاب‌های روانشناسی | یاری‌جو',
    description: 'کتاب‌های معتبر روانشناسی و سلامت روان — خرید و مطالعه آنلاین',
}

interface Book {
    id: string
    slug: string
    title: string
    author: string
    coverImage: string | null
    price: number
    isPremium: boolean
    totalPages: number | null
}

interface PageProps {
    searchParams: Promise<{ page?: string; sort?: string }>
}

function coverUrl(path: string | null | undefined): string | null {
    return imgUrl(path)
}

async function getBooks(page = 1) {
    try {
        const url = `${API}/books?limit=24&page=${page}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) return { books: [] as Book[], total: 0 }
        const json = await res.json() as { data?: { books?: Book[]; total?: number } }
        return {
            books: json.data?.books ?? [],
            total: json.data?.total ?? 0,
        }
    } catch (e) {
        console.error('Books fetch error:', e)
        return { books: [] as Book[], total: 0 }
    }
}

export default async function BooksPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Number(params.page ?? 1)
    const { books, total } = await getBooks(page)
    const totalPages = Math.ceil(total / 24) || 1

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            {/* Header with neuro pattern */}
            <div style={{
                background: '#1B4332',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='none' stroke='%23ffffff' stroke-opacity='0.07' stroke-width='1'/%3E%3Ccircle cx='50' cy='10' r='2' fill='none' stroke='%23ffffff' stroke-opacity='0.07' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='2' fill='none' stroke='%23ffffff' stroke-opacity='0.07' stroke-width='1'/%3E%3Cline x1='10' y1='10' x2='30' y2='30' stroke='%23ffffff' stroke-opacity='0.05' stroke-width='.7'/%3E%3Cline x1='50' y1='10' x2='30' y2='30' stroke='%23ffffff' stroke-opacity='0.05' stroke-width='.7'/%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px',
            }} className="py-14 px-5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">📚</span>
                        <h1 className="text-3xl md:text-4xl font-black text-white">کتاب‌خانه</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-lg">
                        {total > 0 ? `${total.toLocaleString('fa-IR')} کتاب تخصصی روانشناسی` : 'کتاب‌های معتبر روانشناسی'}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 py-10">
                {books.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-4">📖</div>
                        <p className="text-lg font-semibold mb-2" style={{ color: '#1C1C1E' }}>کتابی یافت نشد</p>
                        <p className="text-sm" style={{ color: '#8C8C8E' }}>لطفاً بعداً دوباره امتحان کنید</p>
                    </div>
                ) : (
                    <>
                        {/* Stats bar */}
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-sm font-semibold" style={{ color: '#8C8C8E' }}>
                                نمایش {books.length} کتاب از {total.toLocaleString('fa-IR')} عنوان
                            </p>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 mb-12">
                            {books.map((book) => {
                                const src = coverUrl(book.coverImage)
                                return (
                                    <Link key={book.id} href={`/books/${book.slug}`}
                                        className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                        style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 2px 8px rgba(27,67,50,0.07)' }}>

                                        {/* Cover */}
                                        <div className="relative overflow-hidden"
                                            style={{ aspectRatio: '3/4', background: 'linear-gradient(145deg,#EDE6D6 0%,#DDD5C5 100%)' }}>
                                            {src ? (
                                                <img src={src} alt={book.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                                                    <span className="text-3xl opacity-30">📖</span>
                                                    <p className="text-[10px] text-center font-medium line-clamp-2 opacity-40" style={{ color: '#1B4332' }}>
                                                        {book.title}
                                                    </p>
                                                </div>
                                            )}
                                            {/* Premium badge */}
                                            {book.isPremium && (
                                                <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-md"
                                                    style={{ background: '#C9A84C', color: 'white' }}>
                                                    پریمیوم
                                                </span>
                                            )}
                                            {/* Pages badge */}
                                            {book.totalPages && book.totalPages > 0 && (
                                                <span className="absolute bottom-2 left-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                                                    style={{ background: 'rgba(27,67,50,0.8)', color: 'white' }}>
                                                    {book.totalPages} فصل
                                                </span>
                                            )}
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{ background: 'rgba(27,67,50,0.7)' }}>
                                                <span className="text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/30">
                                                    مطالعه ←
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-3">
                                            <h3 className="font-bold text-[12px] line-clamp-2 mb-1 leading-relaxed group-hover:text-[#1B4332] transition-colors"
                                                style={{ color: '#1C1C1E' }}>
                                                {book.title}
                                            </h3>
                                            <p className="text-[10px] line-clamp-1 mb-2" style={{ color: '#8C8C8E' }}>
                                                {book.author}
                                            </p>
                                            <span className="text-[12px] font-black" style={{ color: '#1B4332' }}>
                                                {book.price === 0 ? 'رایگان' : `${book.price.toLocaleString('fa-IR')} ت`}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {page > 1 && (
                                    <Link href={`/books?page=${page - 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl font-bold border transition-colors hover:bg-[#F3EDE3]"
                                        style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}>›</Link>
                                )}
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    const p = i + 1
                                    return (
                                        <Link key={p} href={`/books?page=${p}`}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors"
                                            style={p === page
                                                ? { background: '#1B4332', color: 'white' }
                                                : { background: 'white', color: '#5C5C5E', border: '1px solid #EDE6D6' }}>
                                            {p.toLocaleString('fa-IR')}
                                        </Link>
                                    )
                                })}
                                {page < totalPages && (
                                    <Link href={`/books?page=${page + 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl font-bold border transition-colors hover:bg-[#F3EDE3]"
                                        style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}>‹</Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
