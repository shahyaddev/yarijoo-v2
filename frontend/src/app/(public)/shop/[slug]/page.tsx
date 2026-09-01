import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddToCartButton from './AddToCartButton'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

interface Product {
    id: string
    slug: string
    title: string
    description: string | null
    price: number
    salePrice: number | null
    stock: number
    images: string[]
    type: string
    isActive: boolean
}

interface PageProps { params: Promise<{ slug: string }> }

const TYPE_LABELS: Record<string, string> = {
    physical: 'فیزیکی', sms: 'پیامکی', book: 'کتاب',
    story: 'داستان', test: 'تست', online_course: 'دوره آنلاین', composite: 'ترکیبی',
}

async function getProduct(slug: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API}/shop/products/${slug}`, { cache: 'no-store' })
        if (!res.ok) return null
        const json = await res.json() as { data: Product }
        return json.data
    } catch { return null }
}

function imgUrl(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    const filename = path.split('/').pop()
    return `/uploads/shop/${filename}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const p = await getProduct(slug)
    return { title: p ? `${p.title} | فروشگاه یاری‌جو` : 'محصول | یاری‌جو' }
}

export default async function ShopDetailPage({ params }: PageProps) {
    const { slug } = await params
    const product = await getProduct(slug)
    if (!product) notFound()

    const img = product.images?.[0]
    const src = img ? imgUrl(img) : null
    const displayPrice = product.salePrice != null && product.salePrice < product.price
        ? product.salePrice : product.price
    const discount = product.salePrice != null && product.salePrice < product.price
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0
    const inStock = product.stock === 0 || product.stock > 0

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            <div className="max-w-5xl mx-auto px-5 py-12">
                <Link href="/shop"
                    className="inline-flex items-center gap-2 text-sm font-semibold mb-8 hover:opacity-70 transition-opacity"
                    style={{ color: '#1B4332' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                    بازگشت به فروشگاه
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-10">
                    {/* Image */}
                    <div>
                        <div className="rounded-2xl overflow-hidden shadow-xl mb-4"
                            style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)' }}>
                            {src
                                ? <img src={src} alt={product.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🛍️</div>}
                        </div>

                        {/* Price card */}
                        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                            <div className="flex items-end gap-3 mb-4">
                                <div className="text-2xl font-black" style={{ color: '#1B4332' }}>
                                    {displayPrice === 0 ? 'رایگان' : `${displayPrice.toLocaleString('fa-IR')} تومان`}
                                </div>
                                {discount > 0 && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm line-through" style={{ color: '#C8C8CA' }}>
                                            {product.price.toLocaleString('fa-IR')}
                                        </span>
                                        <span className="text-xs font-black px-2 py-0.5 rounded-lg text-white" style={{ background: '#C62828' }}>
                                            {discount}% تخفیف
                                        </span>
                                    </div>
                                )}
                            </div>
                            <AddToCartButton product={product} src={src} displayPrice={displayPrice} inStock={inStock} />
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                {TYPE_LABELS[product.type] ?? product.type}
                            </span>
                            {inStock ? (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#E8F5E9', color: '#1B4332' }}>موجود</span>
                            ) : (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FCE4EC', color: '#C62828' }}>ناموجود</span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black mb-4 leading-relaxed" style={{ color: '#1C1C1E' }}>
                            {product.title}
                        </h1>

                        {product.description && (
                            <div className="rounded-2xl border p-5 mb-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <h2 className="font-bold mb-3" style={{ color: '#1C1C1E' }}>توضیحات محصول</h2>
                                <div
                                    className="text-sm leading-relaxed"
                                    style={{ color: '#5C5C5E' }}
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        )}

                        <div className="rounded-2xl border p-4 text-sm" style={{ background: '#F9F5EF', borderColor: '#EDE6D6' }}>
                            <div className="flex items-center gap-2 mb-2 font-semibold" style={{ color: '#1B4332' }}>
                                🛡️ ضمانت رضایت
                            </div>
                            <p style={{ color: '#5C5C5E' }}>در صورت عدم رضایت، هزینه شما کامل برگشت داده می‌شود.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
