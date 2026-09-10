'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DashboardSidebar from './DashboardSidebar'
import { useAuthStore } from '@/stores/auth.store'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':                       'داشبورد',
  '/dashboard/profile':               'پروفایل من',
  '/dashboard/my-tests':              'تست‌های من',
  '/dashboard/courses':               'دوره‌های من',
  '/dashboard/orders':                'سفارشات',
  '/dashboard/educational-packages':  'پکیج‌های من',
  '/dashboard/sms-packages':          'پکیج‌های پیامکی',
  '/dashboard/appointments':          'نوبت مشاوره',
  '/dashboard/planner':               'تقویم برنامه‌ریزی',
  '/dashboard/messages':              'پیام‌ها',
  '/dashboard/tickets':               'پشتیبانی',
  '/dashboard/notifications':         'اعلان‌ها',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuthStore()

  const title = PAGE_TITLES[pathname] ?? PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k) && k !== '/dashboard') ?? ''] ?? 'داشبورد'

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#FAF7F2', direction: 'rtl', overflow: 'hidden' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — desktop always visible, mobile overlay */}
      <div style={{
        position: 'relative', zIndex: 50, flexShrink: 0,
        display: 'flex',
      }} className="hidden lg:flex">
        <DashboardSidebar collapsed={collapsed} />
      </div>

      {/* Mobile sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .25s ease',
      }} className="lg:hidden">
        <DashboardSidebar collapsed={false} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          height: 60, background: 'white',
          borderBottom: '1px solid #EDE6D6',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 12, flexShrink: 0,
          boxShadow: '0 1px 8px rgba(27,67,50,0.05)',
        }}>
          {/* Collapse toggle — desktop */}
          <button onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex"
            style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #EDE6D6', background: 'white', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F3EDE3')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            aria-label="جمع/باز کردن منو">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(o => !o)}
            className="lg:hidden"
            style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #EDE6D6', background: 'white', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            aria-label="باز کردن منو">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 20, borderRadius: 99, background: '#1B4332' }} />
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1C1C1E' }}>{title}</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Back to site */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8C8C8E', textDecoration: 'none', transition: 'color .2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1B4332')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8C8C8E')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="hidden sm:inline">بازگشت به سایت</span>
          </Link>

          {/* Notification bell */}
          <Link href="/dashboard/notifications" style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #EDE6D6', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0, position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="1.8" strokeLinecap="round">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>

          {/* User avatar small */}
          <Link href="/dashboard/profile" style={{ width: 36, height: 36, borderRadius: '50%', background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'white', fontSize: 13, fontWeight: 900 }}>{(user?.fullName ?? user?.phone ?? '?').slice(0, 1).toUpperCase()}</span>}
          </Link>
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          {children}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
