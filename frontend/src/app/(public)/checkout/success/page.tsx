import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'پرداخت موفق | یاری‌جو' }

export default function CheckoutSuccessPage() {
    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center px-5">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6" style={{ background: '#E8F5E9' }}>
                    ✅
                </div>
                <h1 className="text-2xl font-black mb-3" style={{ color: '#1C1C1E' }}>پرداخت موفق</h1>
                <p className="text-sm leading-relaxed mb-2" style={{ color: '#5C5C5E' }}>
                    سفارش شما با موفقیت ثبت شد.
                </p>
                <p className="text-sm leading-relaxed mb-8" style={{ color: '#8C8C8E' }}>
                    محصولات دیجیتال در پنل کاربری شما قابل دسترس است.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard/orders"
                        className="px-6 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity"
                        style={{ background: '#1B4332' }}>
                        مشاهده سفارش‌ها
                    </Link>
                    <Link href="/"
                        className="px-6 py-3 rounded-xl font-bold border-2 hover:bg-[#F3EDE3] transition-colors"
                        style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>
                        بازگشت به سایت
                    </Link>
                </div>
            </div>
        </div>
    )
}
