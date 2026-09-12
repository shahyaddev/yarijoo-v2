'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart.store'

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoX({ size = 16, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    )
}
function IcoMinus({ size = 12, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}
function IcoPlus({ size = 12, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}
function IcoCart({ size = 28, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    )
}
function IcoShop({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
function IcoCard({ size = 16, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="22" height="16" x="1" y="4" rx="2" /><path d="M1 10h22" />
        </svg>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
                        onClick={closeCart}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'tween', duration: 0.28 }}
                        className="fixed top-0 left-0 bottom-0 z-50 w-80 flex flex-col"
                        style={{ background: 'white', boxShadow: '8px 0 32px rgba(0,0,0,0.15)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 shrink-0"
                            style={{ borderBottom: '1px solid #EDE6D6', background: '#FDFBF8' }}>
                            <button onClick={closeCart} aria-label="بستن سبد خرید"
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F3EDE3]"
                                style={{ color: '#5C5C5E' }}>
                                <IcoX size={15} color="#5C5C5E" />
                            </button>
                            <div className="flex items-center gap-2">
                                <h2 className="font-black text-sm" style={{ color: '#1C1C1E' }}>سبد خرید</h2>
                                {items.length > 0 && (
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                                        style={{ background: '#1B4332' }}>
                                        {items.length}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-8">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                        style={{ background: '#E8F5E9' }}>
                                        <IcoCart size={28} color="#1B4332" />
                                    </div>
                                    <p className="font-semibold text-sm" style={{ color: '#1C1C1E' }}>سبد خرید خالی است</p>
                                    <p className="text-xs" style={{ color: '#8C8C8E' }}>محصولی به سبد اضافه نشده</p>
                                    <Link href="/shop" onClick={closeCart}
                                        className="mt-2 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white"
                                        style={{ background: '#1B4332' }}>
                                        <IcoShop size={13} color="white" />
                                        رفتن به فروشگاه
                                    </Link>
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item.id}
                                        className="flex items-center gap-3 p-3 rounded-2xl"
                                        style={{ background: '#F9F6F1', border: '1px solid #EDE6D6' }}>

                                        {/* Thumbnail */}
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                                            style={{ background: '#E8F5E9' }}>
                                            {item.image
                                                ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                : <IcoShop size={18} color="#C4B8A8" />}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold line-clamp-2 leading-snug" style={{ color: '#1C1C1E' }}>
                                                {item.title}
                                            </p>
                                            <p className="text-xs font-black mt-1" style={{ color: '#1B4332' }}>
                                                {item.price.toLocaleString('fa-IR')}
                                                <span className="font-normal" style={{ color: '#8C8C8E' }}> ت</span>
                                            </p>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                                            {/* Qty */}
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="افزایش"
                                                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-[#D1FAE5]"
                                                    style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                                    <IcoPlus size={10} color="#1B4332" />
                                                </button>
                                                <span className="w-5 text-center text-xs font-black" style={{ color: '#1C1C1E' }}>
                                                    {item.quantity.toLocaleString('fa-IR')}
                                                </span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="کاهش"
                                                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-[#FEE2E2]"
                                                    style={{ background: '#F3EDE3', color: '#5C5C5E' }}>
                                                    <IcoMinus size={10} color="#5C5C5E" />
                                                </button>
                                            </div>
                                            {/* Remove */}
                                            <button onClick={() => removeItem(item.id)} aria-label="حذف"
                                                className="text-[10px] font-semibold transition-colors hover:opacity-70"
                                                style={{ color: '#C62828' }}>
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-4 shrink-0 space-y-3"
                                style={{ borderTop: '1px solid #EDE6D6', background: 'white' }}>

                                {/* Total */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm" style={{ color: '#8C8C8E' }}>جمع کل</span>
                                    <span className="font-black text-base" style={{ color: '#1B4332' }}>
                                        {total().toLocaleString('fa-IR')}
                                        <span className="text-xs font-normal" style={{ color: '#8C8C8E' }}> تومان</span>
                                    </span>
                                </div>

                                {/* CTA */}
                                <Link href="/checkout" onClick={closeCart}
                                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-black text-white transition-opacity hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)' }}>
                                    <IcoCard size={15} color="white" />
                                    تکمیل خرید
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
