'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart.store'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'

export default function CheckoutPage() {
    const { items, total, clearCart } = useCartStore()
    const { user, isAuthenticated } = useAuthStore()
    const router = useRouter()

    const [discountCode, setDiscountCode] = useState('')
    const [discountInfo, setDiscountInfo] = useState<{ amount: number; type: string } | null>(null)
    const [discountError, setDiscountError] = useState('')
    const [checkingDiscount, setCheckingDiscount] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const subtotal = total()
    const discountAmount = discountInfo
        ? discountInfo.type === 'percentage'
            ? Math.round((subtotal * discountInfo.amount) / 100)
            : Math.round(discountInfo.amount)
        : 0
    const finalTotal = Math.max(0, subtotal - discountAmount)

    const applyDiscount = async () => {
        if (!discountCode.trim()) return
        setCheckingDiscount(true); setDiscountError(''); setDiscountInfo(null)
        try {
            const res = await api.post('/shop/discount', { code: discountCode.trim() })
            const d = (res.data as any)?.data
            setDiscountInfo({ amount: d.amount, type: d.type })
        } catch (err: unknown) {
            setDiscountError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'کد تخفیف نامعتبر است')
        } finally {
            setCheckingDiscount(false)
        }
    }

    const handlePayment = async () => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/checkout')
            return
        }
        if (items.length === 0) return
        setLoading(true); setError('')
        try {
            const res = await api.post('/shop/orders', {
                discountCode: discountCode.trim() || undefined,
            })
            const d = (res.data as any)?.data
            if (d?.redirectUrl) {
                // Redirect to payment gateway
                window.location.href = d.redirectUrl
            } else {
                setError('خطا در ایجاد سفارش')
            }
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ثبت سفارش')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="text-lg font-semibold mb-2" style={{ color: '#1C1C1E' }}>سبد خرید شما خالی است</p>
                    <Link href="/shop" className="inline-block mt-4 px-6 py-3 rounded-xl text-white font-bold" style={{ background: '#1B4332' }}>
                        رفتن به فروشگاه
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            <div className="max-w-4xl mx-auto px-5 py-12">
                <h1 className="text-2xl font-black mb-8" style={{ color: '#1C1C1E' }}>تکمیل سفارش</h1>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                    {/* Cart items */}
                    <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                        <h2 className="font-bold text-base mb-4" style={{ color: '#1C1C1E' }}>آیتم‌های سبد خرید</h2>
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: '#F3EDE3' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: '#F3EDE3' }}>
                                            {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-xl" /> : '🛍️'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm" style={{ color: '#1C1C1E' }}>{item.title}</p>
                                            <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>× {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm" style={{ color: '#1B4332' }}>
                                        {(item.price * item.quantity).toLocaleString('fa-IR')} ت
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Discount code */}
                        <div className="mt-5 pt-5 border-t" style={{ borderColor: '#EDE6D6' }}>
                            <p className="text-sm font-semibold mb-2" style={{ color: '#1C1C1E' }}>کد تخفیف</p>
                            <div className="flex gap-2">
                                <input
                                    value={discountCode}
                                    onChange={e => { setDiscountCode(e.target.value); setDiscountError('') }}
                                    placeholder="کد تخفیف خود را وارد کنید"
                                    className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none"
                                    style={{ borderColor: '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }}
                                />
                                <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                    style={{ background: '#1B4332' }}>
                                    {checkingDiscount ? '...' : 'اعمال'}
                                </button>
                            </div>
                            {discountError && <p className="text-xs mt-1.5" style={{ color: '#C62828' }}>{discountError}</p>}
                            {discountInfo && (
                                <p className="text-xs mt-1.5 font-semibold" style={{ color: '#1B4332' }}>
                                    ✅ کد تخفیف اعمال شد: {discountInfo.type === 'percentage' ? `${discountInfo.amount}٪` : `${discountInfo.amount.toLocaleString('fa-IR')} تومان`}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Summary + payment */}
                    <div className="space-y-4">
                        {/* Price summary */}
                        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                            <h2 className="font-bold text-base mb-4" style={{ color: '#1C1C1E' }}>خلاصه سفارش</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: '#8C8C8E' }}>جمع</span>
                                    <span style={{ color: '#1C1C1E' }}>{subtotal.toLocaleString('fa-IR')} تومان</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span style={{ color: '#1B4332' }}>تخفیف</span>
                                        <span style={{ color: '#1B4332' }}>- {discountAmount.toLocaleString('fa-IR')} تومان</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-black text-base pt-2 border-t" style={{ borderColor: '#EDE6D6', color: '#1C1C1E' }}>
                                    <span>قابل پرداخت</span>
                                    <span style={{ color: '#1B4332' }}>{finalTotal.toLocaleString('fa-IR')} تومان</span>
                                </div>
                            </div>
                        </div>

                        {/* Auth warning */}
                        {!isAuthenticated && (
                            <div className="rounded-xl p-4 text-sm" style={{ background: '#FFF8E1', border: '1px solid #FFF3CD', color: '#7B5E00' }}>
                                ⚠️ برای پرداخت باید وارد حساب کاربری شوید
                            </div>
                        )}

                        {error && (
                            <div className="rounded-xl p-4 text-sm font-semibold" style={{ background: '#FCE4EC', color: '#C62828' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Payment button */}
                        <button onClick={handlePayment} disabled={loading}
                            className="w-full py-4 rounded-2xl text-white font-black text-base transition-all disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    در حال انتقال...
                                </span>
                            ) : (
                                <>💳 پرداخت {finalTotal.toLocaleString('fa-IR')} تومان</>
                            )}
                        </button>

                        <p className="text-xs text-center" style={{ color: '#8C8C8E' }}>
                            پرداخت امن از طریق زرین‌پال
                        </p>

                        {/* User info */}
                        {isAuthenticated && user && (
                            <div className="rounded-xl p-3 text-xs flex items-center gap-2" style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                <span>👤</span>
                                <span>پرداخت به نام: {user.fullName ?? user.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
