'use client'
import { Badge } from '@/components/ui'

interface Ticket {
    id: string
    subject: string
    user: string
    department: string
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    date: string
}

const MOCK_TICKETS: Ticket[] = [
    { id: 'TK-001', subject: 'مشکل در پرداخت اشتراک', user: 'علی رضایی', department: 'مالی', status: 'OPEN', priority: 'HIGH', date: '۱۴۰۳/۰۶/۱۵' },
    { id: 'TK-002', subject: 'خطا در نمایش نتیجه تست', user: 'سارا احمدی', department: 'فنی', status: 'IN_PROGRESS', priority: 'MEDIUM', date: '۱۴۰۳/۰۶/۱۴' },
    { id: 'TK-003', subject: 'درخواست استرداد وجه', user: 'مهدی کریمی', department: 'مالی', status: 'OPEN', priority: 'HIGH', date: '۱۴۰۳/۰۶/۱۴' },
    { id: 'TK-004', subject: 'سوال درباره نوبت مشاوره', user: 'فاطمه موسوی', department: 'پشتیبانی', status: 'CLOSED', priority: 'LOW', date: '۱۴۰۳/۰۶/۱۲' },
    { id: 'TK-005', subject: 'عدم دریافت ایمیل تایید', user: 'رضا نوری', department: 'فنی', status: 'IN_PROGRESS', priority: 'MEDIUM', date: '۱۴۰۳/۰۶/۱۳' },
    { id: 'TK-006', subject: 'بلاک شدن اکانت', user: 'نگار صادقی', department: 'پشتیبانی', status: 'CLOSED', priority: 'LOW', date: '۱۴۰۳/۰۶/۱۰' },
]

const STATUS_CONFIG = {
    OPEN: { label: 'باز', variant: 'error' as const, icon: '🔴' },
    IN_PROGRESS: { label: 'در حال بررسی', variant: 'warning' as const, icon: '🟡' },
    CLOSED: { label: 'بسته', variant: 'default' as const, icon: '⚫' },
}

const PRIORITY_CONFIG = {
    HIGH: { label: 'بالا', variant: 'error' as const },
    MEDIUM: { label: 'متوسط', variant: 'warning' as const },
    LOW: { label: 'پایین', variant: 'default' as const },
}

const STATUS_GROUPS: Array<'OPEN' | 'IN_PROGRESS' | 'CLOSED'> = ['OPEN', 'IN_PROGRESS', 'CLOSED']

export default function AdminTicketsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">تیکت‌ها</h1>
                <div className="flex gap-3">
                    {STATUS_GROUPS.map(status => {
                        const count = MOCK_TICKETS.filter(t => t.status === status).length
                        const cfg = STATUS_CONFIG[status]
                        return (
                            <div key={status} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-2">
                                <span>{cfg.icon}</span>
                                <span className="text-xs text-gray-400">{cfg.label}</span>
                                <span className="text-sm font-bold text-white">{count}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {STATUS_GROUPS.map(status => {
                const tickets = MOCK_TICKETS.filter(t => t.status === status)
                if (tickets.length === 0) return null
                const cfg = STATUS_CONFIG[status]
                return (
                    <div key={status} className="space-y-3">
                        <h2 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                            <span>{cfg.icon}</span>
                            <span>{cfg.label}</span>
                            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">{tickets.length}</span>
                        </h2>
                        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                                        <th className="text-right px-5 py-3">شناسه</th>
                                        <th className="text-right px-5 py-3">موضوع</th>
                                        <th className="text-right px-5 py-3">کاربر</th>
                                        <th className="text-right px-5 py-3">دپارتمان</th>
                                        <th className="text-right px-5 py-3">اولویت</th>
                                        <th className="text-right px-5 py-3">تاریخ</th>
                                        <th className="text-right px-5 py-3">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                            <td className="px-5 py-3 text-gray-500 font-mono text-xs">{ticket.id}</td>
                                            <td className="px-5 py-3 text-gray-200 font-medium">{ticket.subject}</td>
                                            <td className="px-5 py-3 text-gray-400">{ticket.user}</td>
                                            <td className="px-5 py-3">
                                                <Badge variant="info">{ticket.department}</Badge>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge variant={PRIORITY_CONFIG[ticket.priority].variant}>
                                                    {PRIORITY_CONFIG[ticket.priority].label}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3 text-gray-400">{ticket.date}</td>
                                            <td className="px-5 py-3">
                                                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                                    پاسخ
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
