'use client'
import { useState, useRef, useEffect } from 'react'
import { useNotificationStore } from '@/stores/notification.store'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationBell() {
    useNotifications()

    const [open, setOpen] = useState(false)
    const { notifications, unreadCount, markAllRead } = useNotificationStore()
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const last10 = notifications.slice(0, 10)

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label={`اعلان‌ها${unreadCount > 0 ? ` — ${unreadCount} خوانده‌نشده` : ''}`}
                aria-haspopup="true"
                aria-expanded={open}
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <span className="text-xl" aria-hidden="true">🔔</span>
                {unreadCount > 0 && (
                    <span
                        className="absolute top-1 right-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-0.5"
                        aria-hidden="true"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
                    role="region"
                    aria-label="لیست اعلان‌ها"
                    aria-live="polite"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => markAllRead()}
                            aria-label="علامت‌گذاری همه اعلان‌ها به عنوان خوانده‌شده"
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            خواندن همه
                        </button>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">اعلان‌ها</span>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-80 overflow-y-auto">
                        {last10.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">اعلانی وجود ندارد</div>
                        ) : (
                            last10.map((n) => (
                                <div
                                    key={n.id}
                                    className={[
                                        'px-4 py-3 text-right',
                                        n.isRead ? '' : 'bg-primary-50 dark:bg-primary-900/10',
                                    ].join(' ')}
                                >
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                        {n.body}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(n.createdAt).toLocaleDateString('fa-IR')}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
