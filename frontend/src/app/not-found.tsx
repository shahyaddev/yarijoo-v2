import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: '#FAF7F2' }}>
            <div className="mb-6">
                <div className="text-[100px] font-black leading-none select-none" style={{ color: '#1B4332' }}>
                    ۴۰۴
                </div>
                <div className="text-5xl mt-2">🔍</div>
            </div>

            <h1 className="text-2xl font-black mb-3" style={{ color: '#1C1C1E' }}>
                صفحه مورد نظر یافت نشد
            </h1>

            <p className="text-sm leading-relaxed max-w-sm mb-8" style={{ color: '#8C8C8E' }}>
                متأسفانه صفحه‌ای که دنبالش می‌گردید وجود ندارد یا حذف شده است.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: '#1B4332' }}>
                    بازگشت به صفحه اصلی
                </Link>
                <Link href="/tests"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold border-2 hover:bg-[#F3EDE3] transition-colors"
                    style={{ borderColor: '#1B4332', color: '#1B4332' }}>
                    تست‌های روانشناسی
                </Link>
            </div>
        </div>
    )
}
