import Link from 'next/link'

const links = {
    'خدمات': [
        { href: '/tests', label: 'تست‌های روانشناسی' },
        { href: '/psychologists', label: 'مشاوره آنلاین' },
        { href: '/courses', label: 'دوره‌های ویدیویی' },
        { href: '/pricing', label: 'اشتراک‌ها' },
    ],
    'محتوا': [
        { href: '/blog', label: 'مجله روانشناسی' },
        { href: '/books', label: 'کتاب‌خانه' },
        { href: '/shop', label: 'فروشگاه' },
    ],
    'پشتیبانی': [
        { href: '/dashboard/tickets', label: 'تیکت پشتیبانی' },
        { href: '/auth/login', label: 'ورود / ثبت‌نام' },
    ],
}

export default function Footer() {
    return (
        <footer className="bg-[#1B4332] text-white mt-20">
            <div className="max-w-7xl mx-auto px-5 py-14">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 2C8 2 3 6 3 12c0 4 2.5 7.5 6 9l1-4c-2-1-3.5-3-3.5-5 0-3 2.5-6 5.5-7v2c0 0 4-2 6-4C17 5 16 2 12 2z" />
                                </svg>
                            </div>
                            <span className="font-bold text-[18px] tracking-tight">یاری‌جو</span>
                        </div>
                        <p className="text-[13.5px] text-white/60 leading-relaxed mb-5">
                            پلتفرم جامع سلامت روان — تست، مشاوره، دوره و محتوای تخصصی برای بهبود کیفیت زندگی
                        </p>
                        <div className="flex gap-2.5">
                            {[
                                { label: 'اینستاگرام', href: '#', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z' },
                                { label: 'تلگرام', href: '#', icon: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.61c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.28 14.06l-2.95-.924c-.64-.204-.654-.64.136-.953l11.527-4.444c.533-.194 1 .13.568 1.51z' },
                            ].map(s => (
                                <a key={s.label} href={s.href} aria-label={s.label}
                                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d={s.icon} /></svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(links).map(([title, items]) => (
                        <div key={title}>
                            <h3 className="font-semibold text-[13px] text-white/50 uppercase tracking-wider mb-4">{title}</h3>
                            <ul className="space-y-2.5">
                                {items.map(item => (
                                    <li key={item.href}>
                                        <Link href={item.href}
                                            className="text-[14px] text-white/70 hover:text-white transition-colors duration-150">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-white/40">
                    <p>© ۱۴۰۳ یاری‌جو — تمامی حقوق محفوظ است</p>
                    <div className="flex gap-5">
                        <Link href="/privacy" className="hover:text-white/70 transition-colors">حریم خصوصی</Link>
                        <Link href="/terms" className="hover:text-white/70 transition-colors">شرایط استفاده</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
