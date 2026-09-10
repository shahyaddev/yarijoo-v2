'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
    id: string
    quantity: number
    unitPrice: number
    product?: { title: string }
    book?: { title: string }
    course?: { title: string }
}

interface Order {
    id: string
    status: string
    totalAmount: number
    createdAt: string
    items: OrderItem[]
}

// ─── Config ───────────────────────────────────────────────────────────────────

const S_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    PAID:       { label: 'پرداخت شده', color: '#065F46', bg: '#D1FAE5', dot: '#059669' },
    PENDING:    { label: 'در انتظار',  color: '#854D0E', bg: '#FEF9C3', dot: '#CA8A04' },
    CANCELLED:  { label: 'لغو شده',   color: '#991B1B', bg: '#FEE2E2', dot: '#DC2626' },
    REFUNDED:   { label: 'برگشتی',    color: '#1565C0', bg: '#DBEAFE', dot: '#3B82F6' },
    PROCESSING: { label: 'در پردازش', color: '#6B21A8', bg: '#EDE9FE', dot: '#7C3AED' },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoShop({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}

function IcoPackage({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    )
}

function IcoBook({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
        </svg>
    )
}

function IcoPlay({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
    )
}

function IcoCalendar({ size = 12, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}

function IcoChevron({ size = 14, color = 'currentColor', up = false }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: up ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    )
}

function IcoMoney({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}

// ─── Item icon helper ─────────────────────────────────────────────────────────

function itemIcon(item: OrderItem) {
    if (item.course)  return <IcoPlay    size={13} color="#1565C0" />
    if (item.book)    return <IcoBook    size={13} color="#6B21A8" />
    return                   <IcoPackage size={13} color="#1B4332" />
}

function itemTitle(item: OrderItem) {
    return item.product?.title ?? item.book?.title ?? item.course?.title ?? 'محصول'
}

function itemBg(item: OrderItem) {
    if (item.course) return '#DBEAFE'
    if (item.book)   return '#EDE9FE'
    return '#E8F5E9'
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
    const [open, setOpen] = useState(false)
    const s = S_CFG[order.status] ?? { label: order.status, color: '#8C8C8E', bg: '#F3EDE3', dot: '#8C8C8E' }
    const dateStr = new Date(order.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
    const itemCount = order.items?.length ?? 0

    return (
        <div className="rounded-2xl border overflow-hidden transition-shadow hover:shadow-md"
            style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 1px 6px rgba(27,67,50,0.05)' }}>

            {/* Header row */}
            <button className="w-full flex items-center gap-4 p-5 text-right transition-colors hover:bg-gray-50"
                onClick={() => setOpen(o => !o)}>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                    <IcoShop size={19} color={s.color} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-right">
                    <p className="font-bold text-sm" style={{ color: '#1C1C1E' }}>
                        {order.totalAmount.toLocaleString('fa-IR')} <span className="text-xs font-normal" style={{ color: '#8C8C8E' }}>تومان</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: '#8C8C8E' }}>
                        <span className="flex items-center gap-1">
                            <IcoCalendar size={11} color="#C4B8A8" />
                            {dateStr}
                        </span>
                        {itemCount > 0 && (
                            <span className="flex items-center gap-1">
                                <IcoPackage size={11} color="#C4B8A8" />
                                {itemCount.toLocaleString('fa-IR')} آیتم
                            </span>
                        )}
                    </div>
                </div>

                {/* Status + chevron */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: s.bg, color: s.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                        {s.label}
                    </span>
                    <IcoChevron size={13} color="#8C8C8E" up={open} />
                </div>
            </button>

            {/* Expanded items */}
            {open && (
                <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: '#F3EDE3', background: '#FDFBF8' }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: '#8C8C8E' }}>آیتم‌های سفارش</p>

                    {order.items?.length > 0 ? (
                        <div className="space-y-2">
                            {order.items.map(item => (
                                <div key={item.id}
                                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                                    style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: itemBg(item) }}>
                                            {itemIcon(item)}
                                        </div>
                                        <p className="text-sm truncate" style={{ color: '#1C1C1E' }}>{itemTitle(item)}</p>
                                        {item.quantity > 1 && (
                                            <span className="text-xs shrink-0" style={{ color: '#8C8C8E' }}>
                                                × {item.quantity.toLocaleString('fa-IR')}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm font-black shrink-0" style={{ color: '#1B4332' }}>
                                        {(item.unitPrice * item.quantity).toLocaleString('fa-IR')}
                                        <span className="text-[11px] font-normal" style={{ color: '#8C8C8E' }}> ت</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-center py-3" style={{ color: '#8C8C8E' }}>اطلاعات آیتم‌ها در دسترس نیست</p>
                    )}

                    {/* Total row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: '#EDE6D6' }}>
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#8C8C8E' }}>
                            <IcoMoney size={13} color="#C4B8A8" />
                            مجموع پرداخت
                        </div>
                        <span className="text-base font-black" style={{ color: '#1B4332' }}>
                            {order.totalAmount.toLocaleString('fa-IR')} <span className="text-xs font-normal" style={{ color: '#8C8C8E' }}>تومان</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/shop/orders?limit=50')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(r => setOrders((r.data as any)?.data?.orders ?? []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false))
    }, [])

    const paid       = orders.filter(o => o.status === 'PAID').length
    const pending    = orders.filter(o => o.status === 'PENDING').length
    const total      = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0)

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>سفارشات من</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#8C8C8E' }}>تاریخچه خریدهای شما</p>
                </div>
                <Link href="/shop"
                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
                    style={{ background: '#1B4332' }}>
                    <IcoShop size={14} color="white" />
                    فروشگاه
                </Link>
            </div>

            {/* Stats */}
            {!loading && orders.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'کل سفارشات', value: orders.length, icon: <IcoShop size={17} color="#1B4332" />, bg: '#E8F5E9' },
                        { label: 'پرداخت شده', value: paid,          icon: <IcoMoney size={17} color="#065F46" />, bg: '#D1FAE5' },
                        { label: 'مجموع خرید', value: total, money: true, icon: <IcoMoney size={17} color="#854D0E" />, bg: '#FEF9C3' },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-4 border flex items-center gap-3"
                            style={{ background: 'white', borderColor: '#EDE6D6', boxShadow: '0 1px 6px rgba(27,67,50,0.05)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                                {s.icon}
                            </div>
                            <div className="min-w-0">
                                <div className="font-black text-base leading-none truncate" style={{ color: '#1C1C1E' }}>
                                    {s.money
                                        ? <>{s.value.toLocaleString('fa-IR')} <span className="text-[11px] font-normal" style={{ color: '#8C8C8E' }}>ت</span></>
                                        : s.value.toLocaleString('fa-IR')}
                                </div>
                                <div className="text-xs mt-1" style={{ color: '#8C8C8E' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border"
                    style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: '#E8F5E9' }}>
                        <IcoShop size={28} color="#1B4332" />
                    </div>
                    <p className="font-bold mb-1" style={{ color: '#1C1C1E' }}>هنوز سفارشی ندارید</p>
                    <p className="text-sm mb-5" style={{ color: '#8C8C8E' }}>از فروشگاه یاری‌جو خرید کنید</p>
                    <Link href="/shop"
                        className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: '#1B4332' }}>
                        مشاهده فروشگاه
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map(o => <OrderCard key={o.id} order={o} />)}
                </div>
            )}
        </div>
    )
}
