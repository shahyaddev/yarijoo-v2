'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { IconMoney, IconUsers, IconBrain, IconDownload } from '@/components/ui/Icon'

interface RevenueItem { id: string; totalAmount: number; createdAt: string }
interface UserItem    { id: string; fullName: string | null; phone: string; subscriptionLevel: string; createdAt: string }
interface TestItem    { id: string; testId: string; score: unknown; completedAt: string | null }
interface KpiData     { total_users: number; active_subscriptions: number; revenue: number; pending_tickets: number; upcoming_appointments: number }

type ReportType = 'revenue' | 'users' | 'tests'

const TABS: Array<{ id: ReportType; label: string; Icon: typeof IconMoney }> = [
    { id: 'revenue', label: 'درآمد',   Icon: IconMoney },
    { id: 'users',   label: 'کاربران', Icon: IconUsers },
    { id: 'tests',   label: 'تست‌ها',  Icon: IconBrain  },
]

function fmt(v: number): string {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' م'
    if (v >= 1_000)     return (v / 1_000).toFixed(0) + ' ک'
    return String(v)
}

export default function AdminReportsPage() {
    const [kpi, setKpi]               = useState<KpiData | null>(null)
    const [revenueData, setRevenueData] = useState<RevenueItem[]>([])
    const [usersData, setUsersData]   = useState<UserItem[]>([])
    const [testsData, setTestsData]   = useState<TestItem[]>([])
    const [loading, setLoading]       = useState(true)
    const [activeTab, setActiveTab]   = useState<ReportType>('revenue')
    const [dateFrom, setDateFrom]     = useState('')
    const [dateTo, setDateTo]         = useState('')

    const fetchKpi = useCallback(async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await api.get<KpiData>('/admin/dashboard'); setKpi((res.data as any).data ?? res.data)
        } catch { /* ignore */ }
    }, [])

    const fetchReport = useCallback(async (type: ReportType) => {
        setLoading(true)
        try {
            const params: Record<string, string> = {}
            if (dateFrom) params.from = dateFrom
            if (dateTo)   params.to   = dateTo
            const res = await api.get(`/admin/reports/${type}`, { params })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items = ((res.data as any).data?.data ?? []) as unknown[]
            if (type === 'revenue') setRevenueData(items as RevenueItem[])
            else if (type === 'users') setUsersData(items as UserItem[])
            else setTestsData(items as TestItem[])
        } catch {
            if (type === 'revenue') setRevenueData([])
            else if (type === 'users') setUsersData([])
            else setTestsData([])
        } finally { setLoading(false) }
    }, [dateFrom, dateTo])

    useEffect(() => {
        void fetchKpi()
        void fetchReport('revenue')
        void fetchReport('users')
        void fetchReport('tests')
    }, [fetchKpi, fetchReport])

    const handleExport = async () => {
        try {
            const params: Record<string, string> = { format: 'csv' }
            if (dateFrom) params.from = dateFrom
            if (dateTo)   params.to   = dateTo
            const res = await api.get(`/admin/reports/${activeTab}`, { params, responseType: 'blob' })
            const url = URL.createObjectURL(new Blob([res.data as BlobPart]))
            const a = document.createElement('a'); a.href = url; a.download = `${activeTab}-report.csv`
            a.click(); URL.revokeObjectURL(url)
        } catch { /* ignore */ }
    }

    const monthlyRevenue = revenueData.reduce<Record<string, number>>((acc, item) => {
        const month = new Date(item.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short' })
        acc[month] = (acc[month] ?? 0) + item.totalAmount
        return acc
    }, {})
    const chartEntries = Object.entries(monthlyRevenue).slice(-6)
    const maxChartVal  = Math.max(...chartEntries.map(([, v]) => v), 1)
    const totalRevenue = revenueData.reduce((s, i) => s + i.totalAmount, 0)

    const kpiCards = [
        { label: 'کل درآمد',      value: kpi ? `${totalRevenue.toLocaleString('fa-IR')} ت` : '—', Icon: IconMoney, color: 'text-green-400',  bg: '#E8F5E9', ic: '#1B4332' },
        { label: 'کل سفارشات',    value: kpi ? revenueData.length.toLocaleString('fa-IR') : '—',  Icon: IconUsers, color: 'text-blue-400',   bg: '#E3F2FD', ic: '#1565C0' },
        { label: 'کاربران کل',     value: kpi ? kpi.total_users.toLocaleString('fa-IR') : '—',     Icon: IconUsers, color: 'text-purple-400', bg: '#F3E5F5', ic: '#6A1B9A' },
        { label: 'اشتراک فعال',   value: kpi ? kpi.active_subscriptions.toLocaleString('fa-IR') : '—', Icon: IconBrain, color: 'text-yellow-400', bg: '#FFF8E1', ic: '#C9A84C' },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-white">گزارشات</h1>

            {/* Filters */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-300 mb-4">فیلتر بازه زمانی</h2>
                <div className="flex items-end gap-4 flex-wrap">
                    <div className="flex-1 min-w-36">
                        <label className="block text-xs text-gray-400 mb-1.5">از تاریخ</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500" />
                    </div>
                    <div className="flex-1 min-w-36">
                        <label className="block text-xs text-gray-400 mb-1.5">تا تاریخ</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500" />
                    </div>
                    <button onClick={() => fetchReport(activeTab)} className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-5 py-2.5 rounded-xl transition-colors">اعمال فیلتر</button>
                    <button onClick={handleExport} className="bg-green-700 hover:bg-green-600 text-white text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                        <IconDownload size={14} color="white" /> خروجی CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map(item => (
                    <div key={item.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: item.bg }}>
                            <item.Icon size={18} color={item.ic} />
                        </div>
                        <div className={['text-xl font-bold mb-0.5', item.color].join(' ')}>{item.value}</div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            {chartEntries.length > 0 && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                    <h2 className="font-semibold text-white mb-6">درآمد ماهانه</h2>
                    <div className="flex items-end gap-3 h-48">
                        {chartEntries.map(([month, value]) => (
                            <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-xs text-gray-400">{fmt(value)}</span>
                                <div className="w-full bg-gray-800 rounded-t-lg relative" style={{ height: 160 }}>
                                    <div className="absolute bottom-0 left-0 right-0 bg-primary-600 rounded-t-lg transition-all duration-500"
                                        style={{ height: `${(value / maxChartVal) * 100}%` }} />
                                </div>
                                <span className="text-xs text-gray-400 text-center leading-tight">{month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs + Tables */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="flex border-b border-gray-800">
                    {TABS.map(({ id, label, Icon }) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={['px-5 py-3 text-sm border-b-2 transition-colors flex items-center gap-2',
                                activeTab === id ? 'border-primary-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'].join(' ')}>
                            <Icon size={15} color={activeTab === id ? 'white' : '#9CA3AF'} />
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        {activeTab === 'revenue' && (
                            <table className="w-full text-sm">
                                <thead><tr className="text-gray-400 border-b border-gray-800">
                                    <th className="text-right px-5 py-3">شناسه</th>
                                    <th className="text-right px-5 py-3">مبلغ (تومان)</th>
                                    <th className="text-right px-5 py-3">تاریخ</th>
                                </tr></thead>
                                <tbody>
                                    {revenueData.slice(0, 20).map(item => (
                                        <tr key={item.id} className="border-b border-gray-800/50">
                                            <td className="px-5 py-2.5 text-gray-500 font-mono text-xs">{item.id.slice(0, 8)}</td>
                                            <td className="px-5 py-2.5 text-green-400 font-semibold">{item.totalAmount.toLocaleString('fa-IR')}</td>
                                            <td className="px-5 py-2.5 text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString('fa-IR')}</td>
                                        </tr>
                                    ))}
                                    {revenueData.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-500">داده‌ای یافت نشد</td></tr>}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'users' && (
                            <table className="w-full text-sm">
                                <thead><tr className="text-gray-400 border-b border-gray-800">
                                    <th className="text-right px-5 py-3">نام</th>
                                    <th className="text-right px-5 py-3">تلفن</th>
                                    <th className="text-right px-5 py-3">اشتراک</th>
                                    <th className="text-right px-5 py-3">تاریخ ثبت</th>
                                </tr></thead>
                                <tbody>
                                    {usersData.slice(0, 20).map(item => (
                                        <tr key={item.id} className="border-b border-gray-800/50">
                                            <td className="px-5 py-2.5 text-gray-200">{item.fullName ?? '—'}</td>
                                            <td className="px-5 py-2.5 text-gray-400 font-mono text-xs">{item.phone}</td>
                                            <td className="px-5 py-2.5 text-gray-300">{item.subscriptionLevel}</td>
                                            <td className="px-5 py-2.5 text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString('fa-IR')}</td>
                                        </tr>
                                    ))}
                                    {usersData.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-500">داده‌ای یافت نشد</td></tr>}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'tests' && (
                            <table className="w-full text-sm">
                                <thead><tr className="text-gray-400 border-b border-gray-800">
                                    <th className="text-right px-5 py-3">کاربر</th>
                                    <th className="text-right px-5 py-3">تست</th>
                                    <th className="text-right px-5 py-3">تاریخ تکمیل</th>
                                </tr></thead>
                                <tbody>
                                    {testsData.slice(0, 20).map(item => (
                                        <tr key={item.id} className="border-b border-gray-800/50">
                                            <td className="px-5 py-2.5 text-gray-500 font-mono text-xs">{item.id.slice(0, 8)}</td>
                                            <td className="px-5 py-2.5 text-gray-400 font-mono text-xs">{item.testId.slice(0, 8)}</td>
                                            <td className="px-5 py-2.5 text-gray-400 text-xs">{item.completedAt ? new Date(item.completedAt).toLocaleDateString('fa-IR') : '—'}</td>
                                        </tr>
                                    ))}
                                    {testsData.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-500">داده‌ای یافت نشد</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
