'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface Order {
    id: string
    status: string
    totalAmount: number
    createdAt: string
    items: Array<{ id: string; quantity: number; unitPrice: number; product?: { title: string }; book?: { title: string }; course?: { title: string } }>
}

const S_MAP: Record<string, { label: string; color: string; bg: string }> = {
    PAID: { label: 'پرداخت شده', color: '#1B4332', bg: '#E8F5E9' },
    PENDING: { label: 'در انتظار', color: '#C9A84C', bg: '#FFF8E1' },
    CANCELLED: { label: 'لغو شده', color: '#C62828', bg: '#FCE4EC' },
    REFUNDED: { label: 'برگشت داده', color: '#1565C0', bg: '#E3F2FD' },
    PROCESSING: { label: 'در پردازش', color: '#6A1B9A', bg: '#F3E5F5' },
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)

    useEffect(() => {
        api.get('/shop/orders?limit=50')
            .then(r => setOrders((r.data as any)?.data?.orders ?? []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div>
            <h1 className="text-xl font-black mb-6" style={{ color: '#1C1C1E' }}>سفارشات من</h1>

            {loading ? (
                <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />)}</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="text-5xl mb-4">🛍️</div>
                    <p className="font-semibold mb-2" style={{ color: '#1C1C1E' }}>هنوز سفارشی ندارید</p>
                    <p className="text-sm mb-6" style={{ color: '#8C8C8E' }}>از فروشگاه یاری‌جو خرید کنید</p>
                    <a href="/shop" className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: '#1B4332' }}>فروشگاه</a>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map(o => {
                        const s = S_MAP[o.status] ?? { label: o.status, color: '#8C8C8E', bg: '#F3EDE3' }
                        const isOpen = expanded === o.id
                        const itemNames = o.items?.map(i => i.product?.title ?? i.book?.title ?? i.course?.title ?? 'محصول').filter(Boolean)
                        return (
                            <div key={o.id} className="rounded-2xl border overflow-hidden transition-all"
                                style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <button className="w-full flex items-center justify-between p-5 text-right"
                                    onClick={() => setExpanded(isOpen ? null : o.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: s.bg }}>
                                            🛍️
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm" style={{ color: '#1C1C1E' }}>
                                                {o.totalAmount.toLocaleString('fa-IR')} تومان
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                                                {new Date(o.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                            style={{ background: s.bg, color: s.color }}>{s.label}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#8C8C8E' }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 border-t" style={{ borderColor: '#F3EDE3' }}>
                                        <p className="text-xs font-semibold mb-3 mt-4" style={{ color: '#8C8C8E' }}>آیتم‌های سفارش:</p>
                                        <div className="space-y-2">
                                            {o.items?.length > 0 ? o.items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center text-sm">
                                                    <span style={{ color: '#1C1C1E' }}>{item.product?.title ?? item.book?.title ?? item.course?.title ?? 'محصول'}</span>
                                                    <span className="font-bold" style={{ color: '#1B4332' }}>{(item.unitPrice * item.quantity).toLocaleString('fa-IR')} ت</span>
                                                </div>
                                            )) : (
                                                <p className="text-xs" style={{ color: '#8C8C8E' }}>
                                                    {itemNames.join('، ') || 'آیتم‌ها در دسترس نیستند'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-4 pt-3 border-t flex justify-between text-sm font-bold" style={{ borderColor: '#EDE6D6' }}>
                                            <span style={{ color: '#8C8C8E' }}>مجموع</span>
                                            <span style={{ color: '#1B4332' }}>{o.totalAmount.toLocaleString('fa-IR')} تومان</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
