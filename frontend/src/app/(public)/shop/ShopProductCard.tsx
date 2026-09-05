'use client'

import Link from 'next/link'
import { imgUrl } from '@/lib/imgUrl'

interface Product {
    id: string
    slug: string
    title: string
    price: number
    salePrice: number | null
    images: string[]
    type: string
    isActive: boolean
}

const TYPE_LABELS: Record<string, string> = {
    physical: 'فیزیکی', sms: 'پیامکی', book: 'کتاب',
    story: 'داستان', test: 'تست', online_course: 'دوره آنلاین',
    composite: 'ترکیبی', digital: 'دیجیتال',
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    physical:      { bg: '#D1FAE5', color: '#065F46' },
    book:          { bg: '#FEF3C7', color: '#92400E' },
    sms:           { bg: '#DBEAFE', color: '#1E40AF' },
    online_course: { bg: '#EDE9FE', color: '#5B21B6' },
    composite:     { bg: '#FEF3C7', color: '#92400E' },
    digital:       { bg: '#DBEAFE', color: '#1E3A8A' },
    story:         { bg: '#FCE7F3', color: '#9D174D' },
    test:          { bg: '#D1FAE5', color: '#065F46' },
}

function toFarsi(n: number | string) {
    return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

function IconShopPlaceholder() {
    return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}

export default function ShopProductCard({ product }: { product: Product }) {
    const img = product.images?.[0]
    const src = imgUrl(img)

    const hasDiscount = product.salePrice != null && product.salePrice < product.price
    const displayPrice = hasDiscount ? product.salePrice! : product.price
    const discount = hasDiscount
        ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
        : 0

    const typeColor = TYPE_COLORS[product.type] ?? { bg: '#F3EDE3', color: '#1B4332' }
    const typeLabel = TYPE_LABELS[product.type] ?? product.type

    return (
        <div
            className="group flex flex-col gap-0 rounded-2xl overflow-hidden border transition-all duration-300"
            style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 2px 8px rgba(27,67,50,0.06)' }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 12px 32px rgba(27,67,50,0.13)'
                el.style.borderColor = '#A8D5B5'
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 2px 8px rgba(27,67,50,0.06)'
                el.style.borderColor = '#EDE6D6'
            }}
        >
            {/* Image */}
            <Link href={`/shop/${product.slug}`} style={{ display: 'block', textDecoration: 'none', position: 'relative' }}>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {src ? (
                        <img src={src} alt={product.title} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{ display: 'block' }} />
                    ) : (
                        <div style={{ color: '#B8A88A' }}><IconShopPlaceholder /></div>
                    )}

                    {/* overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                        style={{ background: 'linear-gradient(to top, rgba(27,67,50,0.45) 0%, transparent 60%)' }} />

                    {/* تخفیف */}
                    {discount > 0 && (
                        <span style={{ position: 'absolute', top: 10, right: 10, background: '#DC2626', color: 'white', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                            {toFarsi(discount)}٪ تخفیف
                        </span>
                    )}

                    {/* نوع */}
                    <span style={{ position: 'absolute', top: 10, left: 10, background: typeColor.bg, color: typeColor.color, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                        {typeLabel}
                    </span>
                </div>
            </Link>

            {/* Info */}
            <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>

                {/* Title */}
                <Link href={`/shop/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 className="font-bold text-sm line-clamp-2 leading-relaxed group-hover:text-[#1B4332] transition-colors"
                        style={{ color: '#1C1C1E', margin: 0 }}
                        title={product.title}>
                        {product.title}
                    </h3>
                </Link>

                {/* امتیاز + فروش */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span style={{ fontWeight: 600, color: '#F59E0B' }}>۵.۰</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        فروش جدید
                    </span>
                </div>

                {/* divider */}
                <div style={{ height: 1, background: '#F3EDE3' }} />

                {/* قیمت + مشاهده */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        {hasDiscount ? (
                            <>
                                <div style={{ fontSize: 10, color: '#C8C8CA', textDecoration: 'line-through', marginBottom: 2 }}>
                                    {toFarsi(product.price.toLocaleString())} تومان
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 900, color: '#1B4332' }}>
                                    {displayPrice === 0 ? 'رایگان' : `${toFarsi(displayPrice.toLocaleString())} تومان`}
                                </div>
                            </>
                        ) : (
                            <div style={{ fontSize: 15, fontWeight: 900, color: product.price === 0 ? '#1B4332' : '#1C1C1E' }}>
                                {product.price === 0 ? 'رایگان' : `${toFarsi(product.price.toLocaleString())} تومان`}
                            </div>
                        )}
                    </div>

                    <Link href={`/shop/${product.slug}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 10, background: 'rgba(27,67,50,0.07)', color: '#1B4332', fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'all .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1B4332'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,67,50,0.07)'; (e.currentTarget as HTMLElement).style.color = '#1B4332' }}
                    >
                        مشاهده
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}
