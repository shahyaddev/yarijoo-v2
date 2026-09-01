import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'پرداخت ناموفق | یاری‌جو' }

export default function CheckoutFailedPage() {
    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center px-5">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6" style={{ background: '#FCE4EC' }}>
                    ❌
                </div>
                <h1 className="text-2xl font-black mb-3" style={{ color: '#1C1C1E' }}>پرداخت ناموفق</h1>
                <p className="text-sm leading-relaxed mb-2" style={{ color: '#5C5C5E' }}>
                    متأسفانه پرداخت شما با مشکل مواجه شد.
                </p>
                <p className="text-sm leading-relaxed mb-8" style={{ color: '#8C8C8E' }}>
                    هیچ مبلغی از حساب شما کسر نشده است.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/checkout"
                        className="px-6 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity"
                        style={{ background: '#1B4332' }}>
                        تلاش مجدد
                    </Link>
                    <Link href="/shop"
                        className="px-6 py-3 rounded-xl font-bold border-2 hover:bg-[#F3EDE3] transition-colors"
                        style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>
                        بازگشت به فروشگاه
                    </Link>
                </div>
                <p className="text-xs mt-6" style={{ color: '#8C8C8E' }}>
                    در صورت بروز مشکل با{' '}
                    <Link href="/dashboard/tickets" className="font-semibold" style={{ color: '#1B4332' }}>
                        پشتیبانی
                    </Link>{' '}
                    تماس بگیرید
                </p>
            </div>
        </div>
    )
}
