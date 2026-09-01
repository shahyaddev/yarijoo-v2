'use client'
import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import ThemeToggle from './ThemeToggle'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar collapsed={sidebarCollapsed} />

            {/* Main area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top bar */}
                <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
                    <button
                        onClick={() => setSidebarCollapsed((c) => !c)}
                        aria-label="جمع/باز کردن منو"
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        ☰
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white">
                        داشبورد
                    </span>
                    <div className="flex-1" />
                    <ThemeToggle />
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    )
}
