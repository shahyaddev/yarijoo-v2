'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar, Badge } from '@/components/ui'
import SubscriptionBadge from '@/components/features/subscription/SubscriptionBadge'

const sidebarLinks = [
    { href: '/dashboard', label: 'داشبورد', icon: '📊', exact: true },
    { href: '/dashboard/profile', label: 'پروفایل', icon: '👤', exact: false },
    { href: '/dashboard/my-tests', label: 'تست‌های من', icon: '🧠', exact: false },
    { href: '/dashboard/orders', label: 'سفارش‌ها', icon: '🛍️', exact: false },
    { href: '/dashboard/sms-packages', label: 'پکیج پیامکی', icon: '📱', exact: false },
    { href: '/dashboard/planner', label: 'تقویم برنامه‌ریزی', icon: '📅', exact: false },
    { href: '/dashboard/appointments', label: 'نوبت مشاوره', icon: '👩‍⚕️', exact: false },
    { href: '/dashboard/messages', label: 'پیام‌ها', icon: '💬', exact: false },
    { href: '/dashboard/tickets', label: 'پشتیبانی', icon: '🎫', exact: false },
    { href: '/dashboard/notifications', label: 'اعلان‌ها', icon: '🔔', exact: false },
]

interface DashboardSidebarProps {
    collapsed?: boolean
}

export default function DashboardSidebar({ collapsed = false }: DashboardSidebarProps) {
    const pathname = usePathname()
    const { user, logout } = useAuthStore()

    const subscriptionLabel = () => {
        if (!user?.subscriptionLevel) return 'رایگان'
        if (user.subscriptionLevel === 'FREE') return 'رایگان'
        return user.subscriptionLevel
    }

    return (
        <aside
            className={[
                'flex flex-col bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 h-full transition-all duration-300',
                collapsed ? 'w-16' : 'w-64',
            ].join(' ')}
        >
            {/* User info */}
            {!collapsed && (
                <div className="px-4 py-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={user?.avatarUrl}
                            alt={user?.fullName ?? user?.phone ?? ''}
                            size="md"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                {user?.fullName ?? 'کاربر'}
                            </p>
                            <Badge variant="success" className="text-xs mt-0.5">
                                {subscriptionLabel()}
                            </Badge>
                        </div>
                    </div>
                </div>
            )}

            {/* Collapsed avatar */}
            {collapsed && (
                <div className="flex justify-center py-4 border-b border-gray-100 dark:border-gray-800">
                    <Avatar
                        src={user?.avatarUrl}
                        alt={user?.fullName ?? user?.phone ?? ''}
                        size="sm"
                    />
                </div>
            )}

            {/* Subscription badge */}
            {!collapsed && <SubscriptionBadge />}

            {/* Nav links */}
            <nav
                className="flex-1 p-3 space-y-0.5 overflow-y-auto"
                aria-label="منوی داشبورد"
            >
                {sidebarLinks.map((link) => {
                    const isActive = link.exact
                        ? pathname === link.href
                        : pathname.startsWith(link.href)
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            title={collapsed ? link.label : undefined}
                            aria-label={collapsed ? link.label : undefined}
                            aria-current={isActive ? 'page' : undefined}
                            className={[
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                                collapsed ? 'justify-center' : '',
                            ].join(' ')}
                        >
                            <span className="text-base" aria-hidden="true">{link.icon}</span>
                            {!collapsed && <span>{link.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => void logout()}
                    title={collapsed ? 'خروج' : undefined}
                    aria-label={collapsed ? 'خروج از حساب' : 'خروج از حساب'}
                    className={[
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full',
                        collapsed ? 'justify-center' : '',
                    ].join(' ')}
                >
                    <span className="text-base" aria-hidden="true">🚪</span>
                    {!collapsed && <span>خروج</span>}
                </button>
            </div>
        </aside>
    )
}
