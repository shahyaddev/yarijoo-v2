'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

export default function CheckoutCallbackPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
    const [refId, setRefId] = useState<string>('')
    const [orderId, setOrderId] = useState<string>('')

    useEffect(() => {
        const authority = searchParams.get('Authority') ?? searchParams.get('authority')
        const statusParam = searchParams.get('Status') ?? searchParams.get('status')
        const orderIdParam = searchParams.get('orderId')

        if (!authority) {
            setStatus('failed')
            return
        }

        api.post('/shop/orders/verify', { authority, status: statusParam, orderId: orderIdParam })
            .then(res => {
                const d = (res.data as any)?.data
                if (d?.success) {
                    setRefId(String(d.refId ?? ''))
                    setOrderId(String(d.orderId ?? ''))
                    setStatus('success')
                } else {
                    setStatus('failed')
                }
            })
            .catch(() => setStatus('failed'))
    }, [searchParams])

    if (status === 'loading') {
        return (
            <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#1B4332', borderTopColor: 'transparent' }} />
                    <p style={{ color: '#5C5C5E' }}>در حال تأیید پرداخت...</p>
                </div>
            </div>
        )
    }

    if (status === 'success') {
        return (
            <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center px-5">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6" style={{ background: '#E8F5E9' }}>✅</div>
                    <h1 className="text-2xl font-black mb-3" style={{ color: '#1C1C1E' }}>پرداخت موفق</h1>
                    <p className="text-sm mb-2" style={{ color: '#8C8C8E' }}>سفارش شما با موفقیت ثبت شد</p>
                    {refId && (
                        <p className="text-sm font-semibold mb-6 p-3 rounded-xl" style={{ background: '#E8F5E9', color: '#1B4332' }}>
                            کد رهگیری: {refId}
                        </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/dashboard/orders"
                            className="px-6 py-3 rounded-xl text-white font-bold"
                            style={{ background: '#1B4332' }}>مشاهده سفارش</Link>
                        <Link href="/shop"
                            className="px-6 py-3 rounded-xl font-bold border"
                            style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>ادامه خرید</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center px-5">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6" style={{ background: '#FCE4EC' }}>❌</div>
                <h1 className="text-2xl font-black mb-3" style={{ color: '#1C1C1E' }}>پرداخت ناموفق</h1>
                <p className="text-sm mb-6" style={{ color: '#8C8C8E' }}>پرداخت شما با مشکل مواجه شد. هیچ مبلغی کسر نشده است.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/checkout"
                        className="px-6 py-3 rounded-xl text-white font-bold"
                        style={{ background: '#1B4332' }}>تلاش مجدد</Link>
                    <Link href="/shop"
                        className="px-6 py-3 rounded-xl font-bold border"
                        style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>بازگشت به فروشگاه</Link>
                </div>
            </div>
        </div>
    )
}
