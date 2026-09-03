import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ImageGallery from './ImageGallery'
import ProductActions from './ProductActions'
import {
    IconArrowLeft,
    IconCheck,
    IconShop,
    IconBook,
    IconSms,
    IconPlay,
    IconPackage,
    IconCalendar,
    IconInfo,
    IconMoney,
    IconDownload,
    IconHeart,
    IconStar,
} from '@/components/ui/Icon'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

// ─── Types ───────────────────────────────────────────────────────────────────

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
    fileUrl: string | null
    categoryId: string | null
    isActive: boolean
    createdAt: string
}

interface PageProps { params: Promise<{ slug: string }> }

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, {
    label: string; color: string; bg: string
    Icon: React.FC<{ size?: number; color?: string }>
}> = {
    physical:      { label: 'محصول فیزیکی',  color: '#1B4332', bg: '#D1FAE5', Icon: IconShop },
    book:          { label: 'کتاب',           color: '#78350F', bg: '#FEF3C7', Icon: IconBook },
    sms:           { label: 'پکیج پیامکی',    color: '#1E40AF', bg: '#DBEAFE', Icon: IconSms },
    story:         { label: 'داستان',          color: '#9D174D', bg: '#FCE7F3', Icon: IconHeart },
    test:          { label: 'تست روانشناسی',  color: '#065F46', bg: '#D1FAE5', Icon: IconInfo },
    online_course: { label: 'دوره آنلاین',     color: '#5B21B6', bg: '#EDE9FE', Icon: IconPlay },
    composite:     { label: 'پکیج ترکیبی',    color: '#92400E', bg: '#FEF3C7', Icon: IconPackage },
    digital:       { label: 'دیجیتال',         color: '#1E3A8A', bg: '#DBEAFE', Icon: IconDownload },
}

const INCLUDES: Record<string, string[]> = {
    sms:           ['پیام روزانه انگیزشی', 'ارسال در ساعت دلخواه', 'آرشیو کامل پیام‌ها', 'پشتیبانی اختصاصی'],
    online_course: ['دسترسی مادام‌العمر', 'گواهی پایان دوره', 'پشتیبانی مدرس', 'محتوای آفلاین'],
    composite:     ['چند محصول در یک پکیج', 'قیمت ویژه ترکیبی', 'دسترسی فوری', 'آپدیت رایگان'],
    book:          ['فایل PDF با کیفیت بالا', 'دانلود نامحدود', 'دسترسی دائمی', 'خواندن روی همه دستگاه‌ها'],
    digital:       ['تحویل فوری', 'دانلود نامحدود', 'دسترسی دائمی', 'پشتیبانی فنی'],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getProduct(slug: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API}/shop/products/${slug}`, { cache: 'no-store' })
        if (!res.ok) return null
        const json = await res.json() as { data: Product }
        return json.data
    } catch { return null }
}

function resolveImg(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `/uploads/shop/${path.split('/').pop()}`
}

function formatPrice(n: number) {
    return n === 0 ? 'رایگان' : `${n.toLocaleString('fa-IR')} تومان`
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const p = await getProduct(slug)
    return { title: p ? `${p.title} | فروشگاه یاری‌جو` : 'محصول | یاری‌جو' }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ShopDetailPage({ params }: PageProps) {
    const { slug } = await params
    const product = await getProduct(slug)
    if (!product) notFound()

    const images = (product.images ?? []).map(resolveImg).filter(Boolean) as string[]

    const displayPrice = product.salePrice != null && product.salePrice < product.price
        ? product.salePrice : product.price
    const discount = product.salePrice != null && product.salePrice < product.price
        ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0
    const inStock = product.stock !== 0
    const typeConf = TYPE_CONFIG[product.type] ?? TYPE_CONFIG.physical
    const TypeIcon = typeConf.Icon
    const includeItems = INCLUDES[product.type] ?? []
    const createdDate = product.createdAt
        ? new Date(product.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
        : null

    const detailRows = [
        { Icon: IconShop,     label: 'نوع محصول',  value: typeConf.label },
        { Icon: IconMoney,    label: 'قیمت اصلی',  value: formatPrice(product.price) },
        ...(discount > 0 ? [{ Icon: IconStar,  label: 'صرفه‌جویی',  value: `${(product.price - displayPrice).toLocaleString('fa-IR')} تومان`, highlight: true }] : []),
        ...(product.fileUrl  ? [{ Icon: IconDownload, label: 'فایل دیجیتال', value: 'دارد', highlight: false }] : []),
        { Icon: IconInfo,     label: 'کد محصول',   value: product.id.slice(0, 8).toUpperCase(), highlight: false },
    ] as { Icon: React.FC<{ size?: number; color?: string }>; label: string; value: string; highlight?: boolean }[]

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

            {/* ── Top bar ── */}
            <div style={{ background: '#1B4332' }}>
                <div className="max-w-5xl mx-auto px-5 py-4">
                    <nav className="flex items-center gap-2 text-sm" aria-label="breadcrumb">
                        <Link
                            href="/shop"
                            className="flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity"
                            style={{ color: 'rgba(255,255,255,0.75)' }}
                        >
                            <IconArrowLeft size={14} color="rgba(255,255,255,0.75)" />
                            فروشگاه
                        </Link>
                        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
                        <span className="truncate max-w-[200px] text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                            {product.title}
                        </span>
                    </nav>
                </div>
            </div>

            {/* ── Main grid ── */}
            <div className="max-w-5xl mx-auto px-5 py-10">
                {/*
                 *  Layout:
                 *  Mobile  → single column: image → title → buy card → details
                 *  Desktop → [content (right) | buy sidebar (left)]  (RTL: sidebar appears on left)
                 *
                 *  In RTL grid: first child = rightmost column visually.
                 *  We want buy card on the LEFT, so we put it second in DOM
                 *  and use grid-template with the sidebar last.
                 *  On mobile both stack; order-* swaps them so image+title come first.
                 */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

                    {/* ════ CONTENT COLUMN (right on desktop) ════ */}
                    <div className="space-y-6 order-2 lg:order-1">

                        {/* Image — with type badge overlaid on top-right corner */}
                        <div className="relative">
                            <ImageGallery images={images} title={product.title} />
                            <span
                                className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full z-10"
                                style={{ background: typeConf.bg, color: typeConf.color, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                            >
                                <TypeIcon size={12} color={typeConf.color} />
                                {typeConf.label}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-[28px] font-black leading-snug -mt-2" style={{ color: '#1C1C1E' }}>
                            {product.title}
                        </h1>

                        {/* Meta chips */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span
                                className="flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-full"
                                style={inStock
                                    ? { background: '#D1FAE5', color: '#065F46' }
                                    : { background: '#FEE2E2', color: '#991B1B' }}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                                {inStock ? 'موجود در انبار' : 'ناموجود'}
                            </span>
                            {createdDate && (
                                <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                                    style={{ background: '#F3EDE3', color: '#6B7280' }}>
                                    <IconCalendar size={11} color="#6B7280" />
                                    {createdDate}
                                </span>
                            )}
                            {discount > 0 && (
                                <span className="font-bold px-3 py-1.5 rounded-full text-white"
                                    style={{ background: '#DC2626' }}>
                                    {discount}٪ تخفیف ویژه
                                </span>
                            )}
                        </div>

                        <div className="h-px" style={{ background: '#EDE6D6' }} />

                        {/* Detail cards — مشخصات محصول بالا */}
                        <div>
                            <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1C1C1E' }}>
                                <span className="w-1 h-4 rounded-full inline-block shrink-0" style={{ background: '#1B4332' }} />
                                مشخصات محصول
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {detailRows.map(({ Icon, label, value, highlight }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-3 p-3 rounded-xl"
                                        style={{ background: 'white', border: '1px solid #EDE6D6' }}
                                    >
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: highlight ? '#D1FAE5' : '#F3EDE3' }}
                                        >
                                            <Icon size={13} color={highlight ? '#065F46' : '#1B4332'} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] leading-none mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
                                            <p className="text-xs font-bold truncate" style={{ color: highlight ? '#059669' : '#1C1C1E' }}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        {product.description ? (
                            <div>
                                <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1C1C1E' }}>
                                    <span className="w-1 h-4 rounded-full inline-block shrink-0" style={{ background: '#1B4332' }} />
                                    توضیحات محصول
                                </h2>
                                <div
                                    className="text-sm leading-8"
                                    style={{ color: '#4B5563' }}
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        ) : (
                            <p className="text-sm italic" style={{ color: '#9CA3AF' }}>توضیحاتی ثبت نشده است.</p>
                        )}

                        {/* Includes */}
                        {includeItems.length > 0 && (
                            <div>
                                <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1C1C1E' }}>
                                    <span className="w-1 h-4 rounded-full inline-block shrink-0" style={{ background: '#1B4332' }} />
                                    این پکیج شامل می‌شود
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {includeItems.map(item => (
                                        <div key={item} className="flex items-center gap-2.5 p-3 rounded-xl text-sm"
                                            style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                                            <span className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#D1FAE5' }}>
                                                <IconCheck size={11} color="#065F46" strokeWidth={3} />
                                            </span>
                                            <span style={{ color: '#374151' }}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                    {/* end content column */}

                    {/* ════ SIDEBAR (left on desktop) ════ */}
                    <div className="space-y-4 order-1 lg:order-2 lg:sticky lg:top-6">

                        {/* ── Buy card ── */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ background: 'white', border: '1px solid #E8E0D4', boxShadow: '0 2px 20px rgba(27,67,50,0.08)' }}
                        >
                            {/* Price */}
                            <div className="px-5 py-4" style={{ borderBottom: '1px solid #F3EDE3' }}>
                                {discount > 0 ? (
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm line-through" style={{ color: '#9CA3AF' }}>
                                                {product.price.toLocaleString('fa-IR')} تومان
                                            </span>
                                            <span
                                                className="text-xs font-black px-2 py-0.5 rounded-lg text-white"
                                                style={{ background: '#DC2626' }}
                                            >
                                                {discount}٪ تخفیف
                                            </span>
                                        </div>
                                        <div className="text-[22px] font-black" style={{ color: '#1B4332' }}>
                                            {formatPrice(displayPrice)}
                                        </div>
                                        <p className="text-xs font-medium" style={{ color: '#059669' }}>
                                            {(product.price - displayPrice).toLocaleString('fa-IR')} تومان صرفه‌جویی کردید
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-[22px] font-black" style={{ color: '#1B4332' }}>
                                        {formatPrice(displayPrice)}
                                    </div>
                                )}
                            </div>

                            {/* Stock */}
                            <div className="px-5 py-2 flex items-center gap-2 text-xs" style={{ borderBottom: '1px solid #F3EDE3' }}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${inStock ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                                <span className="font-medium" style={{ color: inStock ? '#065F46' : '#991B1B' }}>
                                    {inStock ? 'موجود در انبار' : 'ناموجود'}
                                </span>
                            </div>

                            {/* Actions — client component */}
                            <div className="p-4">
                                <ProductActions
                                    product={product}
                                    src={images[0] ?? null}
                                    displayPrice={displayPrice}
                                    inStock={inStock}
                                />
                            </div>

                            {/* Trust badges */}
                            <div className="grid grid-cols-3 border-t" style={{ borderColor: '#F3EDE3' }}>
                                {[
                                    { Icon: IconHeart,    text: 'ضمانت بازگشت' },
                                    { Icon: IconCheck,    text: 'پرداخت امن' },
                                    { Icon: IconDownload, text: 'تحویل سریع' },
                                ].map(({ Icon, text }) => (
                                    <div key={text} className="flex flex-col items-center gap-1 py-2.5 text-[10px]" style={{ color: '#6B7280' }}>
                                        <Icon size={14} color="#1B4332" />
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guarantee */}
                        <div
                            className="rounded-2xl p-4 flex items-start gap-3"
                            style={{ background: '#F0FDF4', border: '1px solid #A7F3D0' }}
                        >
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: '#D1FAE5' }}
                            >
                                <IconHeart size={15} color="#065F46" />
                            </div>
                            <div>
                                <p className="font-bold text-sm" style={{ color: '#065F46' }}>ضمانت رضایت ۷ روزه</p>
                                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#047857' }}>
                                    اگر راضی نبودید، کل مبلغ برگشت داده می‌شه. بدون هیچ سوالی.
                                </p>
                            </div>
                        </div>

                    </div>
                    {/* end sidebar */}

                </div>
            </div>
        </div>
    )
}
