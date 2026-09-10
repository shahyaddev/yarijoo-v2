'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart.store'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoCart({ size = 32, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
    )
}
function IcoShop({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
    )
}
function IcoCard({ size = 20, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="22" height="16" x="1" y="4" rx="2"/>
            <path d="M1 10h22"/>
        </svg>
    )
}
function IcoUser({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    )
}
function IcoAlert({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/><path d="M12 17h.01"/>
        </svg>
    )
}
function IcoCheck({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    )
}
function IcoTag({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.3-7.3a1 1 0 0 0 0-1.41L12 2Z"/>
            <path d="M7 7h.01"/>
        </svg>
    )
}
function IcoLock({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
    const { items, total, clearCart } = useCartStore()
    const { user, isAuthenticated } = useAuthStore()
    const router = useRouter()

    const [discountCode,      setDiscountCode]      = useState('')
    const [discountInfo,      setDiscountInfo]      = useState<{ amount: number; type: string } | null>(null)
    const [discountError,     setDiscountError]     = useState('')
    const [checkingDiscount,  setCheckingDiscount]  = useState(false)
    const [loading,           setLoading]           = useState(false)
    const [error,             setError]             = useState('')

    const subtotal      = total()
    const discountAmount = discountInfo
        ? discountInfo.type === 'percentage'
            ? Math.round((subtotal * discountInfo.amount) / 100)
            : Math.round(discountInfo.amount)
        : 0
    const finalTotal = Math.max(0, subtotal - discountAmount)

    // ── Apply discount ────────────────────────────────────────────────────────
    const applyDiscount = async () => {
        if (!discountCode.trim()) return
        setCheckingDiscount(true); setDiscountError(''); setDiscountInfo(null)
        try {
            const res = await api.post('/cart/discount', { code: discountCode.trim() })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const d = (res.data as any)?.data
            setDiscountInfo({ amount: d.amount, type: d.type })
        } catch (err: unknown) {
            setDiscountError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'کد تخفیف نامعتبر است'
            )
        } finally {
            setCheckingDiscount(false)
        }
    }

    // ── Payment ───────────────────────────────────────────────────────────────
    const handlePayment = async () => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/checkout')
            return
        }
        if (items.length === 0) return

        setLoading(true); setError('')
        try {
            // Send cart items directly in the request body — no Redis dependency
            const res = await api.post('/shop/orders', {
                discountCode: discountCode.trim() || undefined,
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const d = (res.data as any)?.data

            if (d?.redirectUrl) {
                // Zarinpal redirect
                clearCart()
                window.location.href = d.redirectUrl
            } else if (d?.orderId) {
                // No payment gateway (test mode / free order)
                clearCart()
                router.push(`/dashboard/orders`)
            } else {
                setError('خطا در ایجاد سفارش — لطفاً دوباره تلاش کنید')
            }
        } catch (err: unknown) {
            const raw = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
            setError(Array.isArray(raw) ? raw[0] : (raw ?? 'خطا در ثبت سفارش'))
        } finally {
            setLoading(false)
        }
    }

    // ── Empty cart ────────────────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
                        style={{ background: '#E8F5E9' }}>
                        <IcoCart size={36} color="#1B4332" />
                    </div>
                    <p className="text-lg font-black mb-1" style={{ color: '#1C1C1E' }}>سبد خرید شما خالی است</p>
                    <p className="text-sm mb-6" style={{ color: '#8C8C8E' }}>محصولی به سبد خرید اضافه نشده</p>
                    <Link href="/shop"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold"
                        style={{ background: '#1B4332' }}>
                        <IcoShop size={16} color="white" />
                        رفتن به فروشگاه
                    </Link>
                </div>
            </div>
        )
    }

    // ── Main layout ───────────────────────────────────────────────────────────
    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            <div className="max-w-4xl mx-auto px-5 py-12">
                <h1 className="text-2xl font-black mb-8" style={{ color: '#1C1C1E' }}>تکمیل سفارش</h1>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

                    {/* ── Cart items ── */}
                    <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                        <h2 className="font-black text-[15px]" style={{ color: '#1C1C1E' }}>آیتم‌های سبد خرید</h2>

                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id}
                                    className="flex items-center gap-3 py-3 border-b last:border-0"
                                    style={{ borderColor: '#F3EDE3' }}>
                                    {/* Thumbnail */}
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                                        style={{ background: '#F3EDE3' }}>
                                        {item.image
                                            ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            : <IcoShop size={20} color="#C4B8A8" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate" style={{ color: '#1C1C1E' }}>{item.title}</p>
                                        <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                                            × {item.quantity.toLocaleString('fa-IR')}
                                        </p>
                                    </div>
                                    <span className="font-black text-sm shrink-0" style={{ color: '#1B4332' }}>
                                        {(item.price * item.quantity).toLocaleString('fa-IR')}
                                        <span className="text-xs font-normal" style={{ color: '#8C8C8E' }}> ت</span>
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Discount code */}
                        <div className="pt-4 border-t" style={{ borderColor: '#EDE6D6' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <IcoTag size={14} color="#1B4332" />
                                <p className="text-sm font-semibold" style={{ color: '#1C1C1E' }}>کد تخفیف</p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={discountCode}
                                    onChange={e => { setDiscountCode(e.target.value); setDiscountError('') }}
                                    placeholder="کد تخفیف خود را وارد کنید"
                                    className="flex-1 px-3 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors"
                                    style={{ borderColor: '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }}
                                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#1B4332'}
                                    onBlur={e  => (e.target as HTMLInputElement).style.borderColor = '#EDE6D6'}
                                />
                                <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode.trim()}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                                    style={{ background: '#1B4332' }}>
                                    {checkingDiscount ? '...' : 'اعمال'}
                                </button>
                            </div>
                            {discountError && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold" style={{ color: '#C62828' }}>
                                    <IcoAlert size={12} color="#C62828" />{discountError}
                                </div>
                            )}
                            {discountInfo && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold" style={{ color: '#065F46' }}>
                                    <IcoCheck size={12} color="#065F46" />
                                    کد تخفیف اعمال شد:&nbsp;
                                    {discountInfo.type === 'percentage'
                                        ? `${discountInfo.amount.toLocaleString('fa-IR')}٪`
                                        : `${discountInfo.amount.toLocaleString('fa-IR')} تومان`}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Summary + payment ── */}
                    <div className="space-y-4">

                        {/* Price summary */}
                        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                            <h2 className="font-black text-[15px] mb-4" style={{ color: '#1C1C1E' }}>خلاصه سفارش</h2>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: '#8C8C8E' }}>جمع کل</span>
                                    <span style={{ color: '#1C1C1E' }}>{subtotal.toLocaleString('fa-IR')} تومان</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span style={{ color: '#1B4332' }}>تخفیف</span>
                                        <span className="font-semibold" style={{ color: '#1B4332' }}>
                                            − {discountAmount.toLocaleString('fa-IR')} تومان
                                        </span>
                                    </div>
                                )}
                                <div className="h-px" style={{ background: '#EDE6D6' }} />
                                <div className="flex justify-between font-black text-base pt-1">
                                    <span style={{ color: '#1C1C1E' }}>قابل پرداخت</span>
                                    <span style={{ color: '#1B4332' }}>{finalTotal.toLocaleString('fa-IR')} تومان</span>
                                </div>
                            </div>
                        </div>

                        {/* Auth warning */}
                        {!isAuthenticated && (
                            <div className="rounded-xl p-4 flex items-start gap-2.5 text-sm"
                                style={{ background: '#FEF9C3', border: '1px solid #FEF08A', color: '#854D0E' }}>
                                <IcoAlert size={15} color="#CA8A04" />
                                <span>برای پرداخت باید وارد حساب کاربری شوید</span>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="rounded-xl p-4 flex items-start gap-2.5 text-sm font-semibold"
                                style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B' }}>
                                <IcoAlert size={15} color="#DC2626" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Payment button */}
                        <button onClick={handlePayment} disabled={loading || !isAuthenticated}
                            className="w-full py-4 rounded-2xl text-white font-black text-base transition-all disabled:opacity-60 hover:opacity-90 flex items-center justify-center gap-2.5"
                            style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)', boxShadow: '0 4px 16px rgba(27,67,50,0.25)' }}>
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    در حال انتقال به درگاه...
                                </>
                            ) : (
                                <>
                                    <IcoCard size={20} color="white" />
                                    پرداخت {finalTotal.toLocaleString('fa-IR')} تومان
                                </>
                            )}
                        </button>

                        {/* Security note */}
                        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#8C8C8E' }}>
                            <IcoLock size={12} color="#C4B8A8" />
                            پرداخت امن از طریق زرین‌پال
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
