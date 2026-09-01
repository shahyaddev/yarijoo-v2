'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'

const ADMIN_NAV = [
    { href: '/admin', label: 'داشبورد', icon: '📊', exact: true },
    { href: '/admin/users', label: 'کاربران', icon: '👥' },
    { href: '/admin/psychologists', label: 'روانشناسان', icon: '🧑‍⚕️' },
    { href: '/admin/shop', label: 'محصولات', icon: '🛍️' },
    { href: '/admin/courses', label: 'دوره‌ها', icon: '🎓' },
    { href: '/admin/packages', label: 'پکیج ترکیبی', icon: '📦' },
    { href: '/admin/sms-packages', label: 'پکیج پیامکی', icon: '📱' },
    { href: '/admin/tests', label: 'تست‌ها', icon: '🧠' },
    { href: '/admin/blog', label: 'مجله', icon: '📝' },
    { href: '/admin/tickets', label: 'تیکت‌ها', icon: '🎫' },
    { href: '/admin/reports', label: 'گزارشات', icon: '📈' },
    { href: '/admin/migration', label: 'Migration', icon: '🔄' },
    { href: '/admin/settings', label: 'تنظیمات', icon: '⚙️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuthStore()

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden">
            {/* Sidebar */}
            <aside className={['flex flex-col bg-gray-900 border-l border-gray-800 transition-all duration-300', collapsed ? 'w-16' : 'w-60'].join(' ')}>
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                    {!collapsed && <span className="font-bold text-white text-sm">پنل ادمین</span>}
                    <button onClick={() => setCollapsed(c => !c)} className="text-gray-400 hover:text-white transition-colors">☰</button>
                </div>
                <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                    {ADMIN_NAV.map((item) => {
                        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                        return (
                            <Link key={item.href} href={item.href}
                                className={['flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors', isActive ? 'bg-primary-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white', collapsed ? 'justify-center' : ''].join(' ')}>
                                <span>{item.icon}</span>
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-2 border-t border-gray-800">
                    {!collapsed && <p className="text-xs text-gray-500 px-3 mb-2">{user?.phone}</p>}
                    <button onClick={() => void logout()} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-900/20 w-full transition-colors">
                        <span>🚪</span>{!collapsed && <span>خروج</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-3 flex-shrink-0">
                    <h1 className="font-semibold text-white text-sm">پنل مدیریت یاری‌جو</h1>
                    <span className="mr-auto text-xs text-gray-400">{user?.fullName ?? user?.phone}</span>
                </div>
                <main className="flex-1 overflow-y-auto p-6 text-gray-100">{children}</main>
            </div>
        </div>
    )
}
