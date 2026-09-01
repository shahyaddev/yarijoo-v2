import type { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarijoo.com'
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'فروشگاه محصولات روانشناسی | یاری‌جو',
    description: 'خرید محصولات و بسته‌های کمک به سلامت روان — پکیج‌های تخصصی با بهترین قیمت',
    openGraph: {
        title: 'فروشگاه | یاری‌جو',
        description: 'خرید محصولات و بسته‌های کمک به سلامت روان',
        url: `${siteUrl}/shop`,
        type: 'website',
        locale: 'fa_IR',
    },
    alternates: { canonical: `${siteUrl}/shop` },
}

interface Product {
    id: string
    slug: string
    title: string
    description: string | null
    price: number
    salePrice: number | null
    images: string[]
    type: string
    isActive: boolean
}

interface PageProps {
    searchParams: Promise<{ sort?: string; type?: string }>
}

function imgUrl(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    const filename = path.split('/').pop()
    return `/uploads/shop/${filename}`
}

function formatPrice(price: number): string {
    if (price === 0) return 'رایگان'
    return `${price.toLocaleString('fa-IR')} تومان`
}

function getDiscount(price: number, salePrice: number): number {
    return Math.round(((price - salePrice) / price) * 100)
}

async function getProducts(sort = 'newest', type = '') {
    try {
        const params = new URLSearchParams({ limit: '50', page: '1' })
        if (sort) params.set('sort', sort)
        if (type) params.set('type', type)

        const res = await fetch(`${API}/shop/products?${params}`, {
            next: { revalidate: 300 },
        })
        if (!res.ok) return { products: [], total: 0 }
        const data = await res.json() as { data: { products: Product[]; total: number } }
        return { products: data.data?.products ?? [], total: data.data?.total ?? 0 }
    } catch {
        return { products: [], total: 0 }
    }
}

const TYPE_LABELS: Record<string, string> = {
    physical: 'فیزیکی',
    sms: 'پیامکی',
    book: 'کتاب',
    story: 'داستان',
    test: 'تست',
    online_course: 'دوره آنلاین',
    composite: 'ترکیبی',
}

const TYPES = ['', 'physical', 'sms', 'book', 'story', 'test', 'online_course']

const SORT_OPTIONS = [
    { value: 'newest', label: 'جدیدترین' },
    { value: 'price_asc', label: 'ارزان‌ترین' },
    { value: 'price_desc', label: 'گران‌ترین' },
]

export default async function ShopPage({ searchParams }: PageProps) {
    const params = await searchParams
    const sortBy = params.sort ?? 'newest'
    const activeType = params.type ?? ''

    const { products, total } = await getProducts(sortBy, activeType)

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: '#1B4332' }} className="py-14 px-5">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">فروشگاه یاری‌جو</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-lg">
                        بسته‌ها و محصولات تخصصی سلامت روان
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 py-10">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    {/* Type filter */}
                    <div className="flex flex-wrap gap-2">
                        {TYPES.map((t) => (
                            <Link
                                key={t || 'all'}
                                href={`/shop?sort=${sortBy}${t ? `&type=${t}` : ''}`}
                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                style={
                                    activeType === t
                                        ? { background: '#1B4332', color: 'white' }
                                        : { background: 'white', color: '#5C5C5E', border: '1.5px solid #EDE6D6' }
                                }
                            >
                                {t ? (TYPE_LABELS[t] ?? t) : 'همه'}
                            </Link>
                        ))}
                    </div>

                    {/* Sort + count */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ color: '#8C8C8E' }}>
                            {total.toLocaleString('fa-IR')} محصول
                        </span>
                        <div className="flex gap-1">
                            {SORT_OPTIONS.map((opt) => (
                                <Link
                                    key={opt.value}
                                    href={`/shop?sort=${opt.value}${activeType ? `&type=${activeType}` : ''}`}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                    style={
                                        sortBy === opt.value
                                            ? { background: '#1B4332', color: 'white' }
                                            : { background: 'white', color: '#8C8C8E', border: '1px solid #EDE6D6' }
                                    }
                                >
                                    {opt.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-4">🛍️</div>
                        <p className="text-lg font-semibold mb-2" style={{ color: '#1C1C1E' }}>محصولی یافت نشد</p>
                        <p className="text-sm" style={{ color: '#8C8C8E' }}>لطفاً فیلتر دیگری انتخاب کنید</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {products.map((product) => {
                            const img = product.images?.[0]
                            const imgSrc = imgUrl(img)

                            const discount = product.salePrice && product.price > 0
                                ? getDiscount(product.price, product.salePrice)
                                : 0

                            return (
                                <Link
                                    key={product.id}
                                    href={`/shop/${product.slug}`}
                                    className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                                    style={{
                                        background: 'white',
                                        borderColor: '#EDE6D6',
                                        boxShadow: '0 2px 8px rgba(27,67,50,0.06)',
                                    }}
                                >
                                    {/* Image */}
                                    <div
                                        className="aspect-[4/3] overflow-hidden relative flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}
                                    >
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="text-5xl opacity-40">🛍️</span>
                                        )}
                                        {discount > 0 && (
                                            <span
                                                className="absolute top-2 right-2 text-xs font-black px-2 py-1 rounded-lg"
                                                style={{ background: '#E53E3E', color: 'white' }}
                                            >
                                                {discount}% تخفیف
                                            </span>
                                        )}
                                        {product.type && (
                                            <span
                                                className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-lg"
                                                style={{ background: 'rgba(27,67,50,0.85)', color: 'white' }}
                                            >
                                                {TYPE_LABELS[product.type] ?? product.type}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3
                                            className="font-bold text-[14px] line-clamp-2 mb-3 leading-relaxed transition-colors group-hover:text-[#1B4332]"
                                            style={{ color: '#1C1C1E' }}
                                        >
                                            {product.title}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {product.salePrice && product.salePrice < product.price ? (
                                                    <div>
                                                        <span className="text-[11px] line-through" style={{ color: '#C8C8CA' }}>
                                                            {product.price.toLocaleString('fa-IR')}
                                                        </span>
                                                        <div className="text-[14px] font-black" style={{ color: '#1B4332' }}>
                                                            {product.salePrice === 0
                                                                ? 'رایگان'
                                                                : `${product.salePrice.toLocaleString('fa-IR')} تومان`}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[14px] font-black" style={{ color: '#1B4332' }}>
                                                        {formatPrice(product.price)}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors group-hover:opacity-90"
                                                style={{ background: '#E8F5E9', color: '#1B4332' }}
                                            >
                                                خرید
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
