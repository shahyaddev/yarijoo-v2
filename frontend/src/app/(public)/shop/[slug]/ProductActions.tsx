'use client'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cart.store'
import { useWishlistStore } from '@/stores/wishlist.store'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'next/navigation'

interface Product {
    id: string
    slug: string
    title: string
    price: number
    salePrice: number | null
    stock: number
    images: string[]
    type: string
}

interface Props {
    product: Product
    src: string | null
    displayPrice: number
    inStock: boolean
}

// ── tiny inline SVGs (no external dep) ──────────────────────────────────────

function IconCart({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
    )
}

function IconHeart({ filled = false, size = 18 }: { filled?: boolean; size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    )
}

function IconShare({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    )
}

function IconCheck({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

function IconBolt({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}

// ── Share sheet ──────────────────────────────────────────────────────────────

function ShareSheet({ title, onClose }: { title: string; onClose: () => void }) {
    const url = typeof window !== 'undefined' ? window.location.href : ''

    const copy = () => {
        navigator.clipboard.writeText(url).catch(() => { })
        onClose()
    }

    const shareItems = [
        {
            label: 'کپی لینک',
            color: '#1B4332',
            bg: '#D1FAE5',
            action: copy,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
            ),
        },
        {
            label: 'واتساپ',
            color: '#065F46',
            bg: '#D1FAE5',
            action: () => { window.open(`https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`, '_blank'); onClose() },
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.52 5.845L.057 23.5l5.797-1.502A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.784 9.784 0 0 1-5.031-1.388l-.36-.214-3.44.892.918-3.32-.235-.38A9.775 9.775 0 0 1 2.182 12C2.182 6.577 6.577 2.182 12 2.182S21.818 6.577 21.818 12 17.423 21.818 12 21.818z" />
                </svg>
            ),
        },
        {
            label: 'تلگرام',
            color: '#1E40AF',
            bg: '#DBEAFE',
            action: () => { window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank'); onClose() },
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
                </svg>
            ),
        },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}>
            {/* backdrop */}
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />

            <div
                className="relative w-full sm:w-80 rounded-t-3xl sm:rounded-2xl p-6 space-y-4"
                style={{ background: 'white', zIndex: 1 }}
                onClick={e => e.stopPropagation()}
            >
                {/* handle */}
                <div className="w-10 h-1 rounded-full mx-auto sm:hidden" style={{ background: '#E5E7EB' }} />

                <h3 className="font-bold text-base text-center" style={{ color: '#1C1C1E' }}>اشتراک‌گذاری</h3>
                <p className="text-xs text-center truncate" style={{ color: '#9CA3AF' }}>{title}</p>

                <div className="grid grid-cols-3 gap-3 pt-1">
                    {shareItems.map(item => (
                        <button
                            key={item.label}
                            onClick={item.action}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-opacity hover:opacity-75"
                            style={{ background: item.bg, color: item.color }}
                        >
                            {item.icon}
                            <span className="text-xs font-semibold">{item.label}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-2xl text-sm font-semibold transition-colors"
                    style={{ background: '#F3F4F6', color: '#6B7280' }}
                >
                    بستن
                </button>
            </div>
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProductActions({ product, src, displayPrice, inStock }: Props) {
    const { addItem, openCart } = useCartStore()
    const { isSaved, toggle, fetchStatus } = useWishlistStore()
    const { isAuthenticated } = useAuthStore()
    const router = useRouter()

    const [cartState, setCartState] = useState<'idle' | 'added'>('idle')
    const [wishLoading, setWishLoading] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [copied, setCopied] = useState(false)

    const saved = isSaved(product.id)

    // Sync wishlist status from server on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchStatus(product.id)
        }
    }, [isAuthenticated, product.id, fetchStatus])

    const handleAddToCart = () => {
        if (!inStock) return
        addItem({
            id: product.id,
            title: product.title,
            price: displayPrice,
            quantity: 1,
            image: src ?? undefined,
        })
        openCart()
        setCartState('added')
        setTimeout(() => setCartState('idle'), 2500)
    }

    const handleBuyNow = () => {
        if (!inStock) return
        addItem({
            id: product.id,
            title: product.title,
            price: displayPrice,
            quantity: 1,
            image: src ?? undefined,
        })
        router.push('/checkout')
    }

    const handleWishlist = async () => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
            return
        }
        setWishLoading(true)
        await toggle(product.id)
        setWishLoading(false)
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: product.title, url: window.location.href }).catch(() => { })
        } else {
            setShowShare(true)
        }
    }

    return (
        <>
            {/* ── Primary CTA ── */}
            <div>
                {/* Add to cart */}
                <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: cartState === 'added' ? '#065F46' : '#1B4332',
                        color: 'white',
                    }}
                    aria-label="افزودن به سبد خرید"
                >
                    {cartState === 'added' ? (
                        <>
                            <IconCheck size={17} />
                            به سبد اضافه شد
                        </>
                    ) : (
                        <>
                            <IconCart size={17} />
                            افزودن به سبد خرید
                        </>
                    )}
                </button>
            </div>

            {/* ── Secondary actions ── */}
            <div className="grid grid-cols-2 gap-2.5 mt-3">
                {/* Wishlist */}
                <button
                    onClick={handleWishlist}
                    disabled={wishLoading}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
                    style={saved
                        ? { background: '#FEE2E2', color: '#B91C1C' }
                        : { background: '#F9F5EF', color: '#6B7280', border: '1px solid #E8E0D4' }
                    }
                    aria-label={saved ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                    aria-pressed={saved}
                >
                    {wishLoading ? (
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <IconHeart filled={saved} size={15} />
                    )}
                    {saved ? 'ذخیره شد' : 'علاقه‌مندی'}
                </button>

                {/* Share */}
                <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
                    style={{ background: '#F9F5EF', color: '#6B7280', border: '1px solid #E8E0D4' }}
                    aria-label="اشتراک‌گذاری"
                >
                    {copied ? <IconCheck size={15} /> : <IconShare size={15} />}
                    {copied ? 'کپی شد!' : 'اشتراک‌گذاری'}
                </button>
            </div>

            {/* Share sheet modal */}
            {showShare && (
                <ShareSheet title={product.title} onClose={() => { setShowShare(false); setCopied(false) }} />
            )}
        </>
    )
}
