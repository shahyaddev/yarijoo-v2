'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { useState } from 'react'

const MENU = [
  { href: '/dashboard',                       label: 'داشبورد',           exact: true,  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dashboard/profile',               label: 'پروفایل',           exact: false, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { href: '/dashboard/my-tests',              label: 'تست‌های من',        exact: false, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { href: '/dashboard/courses',               label: 'دوره‌های من',       exact: false, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { href: '/dashboard/orders',                label: 'سفارشات',           exact: false, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { href: '/dashboard/educational-packages',  label: 'پکیج‌های من',      exact: false, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '/dashboard/appointments',          label: 'نوبت مشاوره',       exact: false, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/dashboard/planner',               label: 'تقویم',             exact: false, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/dashboard/messages',              label: 'پیام‌ها',           exact: false, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { href: '/dashboard/tickets',               label: 'پشتیبانی',          exact: false, icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: '/dashboard/notifications',         label: 'اعلان‌ها',          exact: false, icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
]

function MenuIcon({ path, size = 18, color = 'currentColor' }: { path: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

export default function DashboardSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = (user?.fullName ?? user?.phone ?? '?').slice(0, 1).toUpperCase()

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    router.push('/auth/login')
  }

  return (
    <aside style={{
      width: collapsed ? 64 : 260,
      flexShrink: 0,
      background: '#1B4332',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'auto',
      transition: 'width .25s ease',
      position: 'relative',
    }}>
      {/* pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '20px 20px', pointerEvents: 'none',
      }} />

      {/* User info */}
      <div style={{
        padding: collapsed ? '20px 8px' : '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 12,
        flexDirection: collapsed ? 'column' : 'row',
      }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: user?.avatarUrl ? 'transparent' : 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
          fontSize: 18, fontWeight: 900, color: 'white',
        }}>
          {user?.avatarUrl
            ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>

        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName ?? user?.phone ?? 'کاربر'}
            </p>
            <span style={{
              fontSize: 10, fontWeight: 700, marginTop: 3, display: 'inline-block',
              padding: '2px 8px', borderRadius: 20,
              background: user?.subscriptionLevel === 'FREE' ? 'rgba(255,255,255,0.12)' : '#C9A84C',
              color: user?.subscriptionLevel === 'FREE' ? 'rgba(255,255,255,0.6)' : 'white',
            }}>
              {user?.subscriptionLevel === 'FREE' ? 'رایگان' : user?.subscriptionLevel}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {MENU.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12, textDecoration: 'none',
                transition: 'background .15s',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {/* active bar */}
              {isActive && !collapsed && (
                <div style={{ position: 'absolute', right: 0, top: '20%', bottom: '20%', width: 3, borderRadius: 99, background: '#52B788' }} />
              )}
              <MenuIcon path={item.icon} size={18} color={isActive ? 'white' : 'rgba(255,255,255,0.55)'} />
              {!collapsed && (
                <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? 'white' : 'rgba(255,255,255,0.65)' }}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: collapsed ? '12px 8px' : '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={handleLogout} disabled={loggingOut} title={collapsed ? 'خروج' : undefined}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10, padding: collapsed ? '10px 0' : '10px 12px',
            borderRadius: 12, border: 'none', background: 'transparent',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {loggingOut ? (
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(239,68,68,0.5)', borderTopColor: '#EF4444', animation: 'spin 1s linear infinite' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          )}
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>خروج از حساب</span>}
        </button>
      </div>
    </aside>
  )
}
