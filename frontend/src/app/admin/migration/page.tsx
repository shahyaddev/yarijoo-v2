'use client'
import { useState } from 'react'
import { Badge, Modal } from '@/components/ui'

interface TableReport {
    table: string
    source: number
    migrated: number
    skipped: number
    errors: number
}

const MOCK_REPORT: TableReport[] = [
    { table: 'users', source: 12, migrated: 12, skipped: 0, errors: 0 },
    { table: 'test_definitions', source: 66, migrated: 66, skipped: 0, errors: 0 },
    { table: 'test_questions', source: 850, migrated: 843, skipped: 7, errors: 0 },
    { table: 'test_results', source: 2400, migrated: 0, skipped: 2400, errors: 0 },
]

function getStatusVariant(migrated: number, source: number): 'success' | 'warning' | 'error' {
    if (source === 0) return 'success'
    const pct = (migrated / source) * 100
    if (pct >= 99) return 'success'
    if (pct >= 95) return 'warning'
    return 'error'
}

export default function MigrationPage() {
    const [showConfirm, setShowConfirm] = useState(false)
    const [running, setRunning] = useState(false)
    const [ran, setRan] = useState(false)
    const [report] = useState<TableReport[]>(MOCK_REPORT)

    const handleRun = () => {
        setShowConfirm(false)
        setRunning(true)
        // Simulate migration
        setTimeout(() => { setRunning(false); setRan(true) }, 3000)
    }

    const handleDownload = () => {
        const json = JSON.stringify({ tables: report, exportedAt: new Date().toISOString() }, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'migration-report.json'; a.click()
        URL.revokeObjectURL(url)
    }

    const totalMigrated = report.reduce((s, r) => s + r.migrated, 0)
    const totalErrors = report.reduce((s, r) => s + r.errors, 0)

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-white">انتقال داده (Migration)</h1>
                <div className="flex gap-2">
                    <button onClick={handleDownload}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-xl transition-colors">
                        ⬇ دانلود گزارش JSON
                    </button>
                    <button onClick={() => setShowConfirm(true)} disabled={running}
                        className="px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors">
                        {running ? '⏳ در حال اجرا...' : '▶ اجرای Migration'}
                    </button>
                </div>
            </div>

            {/* Status card */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white">{totalMigrated.toLocaleString('fa-IR')}</div>
                        <div className="text-xs text-gray-400 mt-1">رکورد منتقل شده</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{totalErrors}</div>
                        <div className="text-xs text-gray-400 mt-1">خطا</div>
                    </div>
                    <div>
                        <Badge variant={ran ? 'success' : 'warning'}>
                            {running ? 'در حال اجرا' : ran ? 'تکمیل شده' : 'آماده اجرا'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Progress bars */}
            {running && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-6 space-y-3">
                    <h2 className="text-sm font-semibold text-white mb-3">پیشرفت migration</h2>
                    {['کاربران', 'تست‌ها', 'سوالات', 'نتایج'].map((group, i) => (
                        <div key={group}>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{group}</span>
                                <span>{i < 2 ? '100٪' : i === 2 ? '65٪' : '0٪'}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-600 rounded-full transition-all duration-1000"
                                    style={{ width: i < 2 ? '100%' : i === 2 ? '65%' : '0%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Report table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-800">
                    <h2 className="text-sm font-semibold text-white">گزارش جداول</h2>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-400 border-b border-gray-800">
                            <th className="text-right px-5 py-3">جدول</th>
                            <th className="text-right px-4 py-3">منبع</th>
                            <th className="text-right px-4 py-3">منتقل شده</th>
                            <th className="text-right px-4 py-3">رد شده</th>
                            <th className="text-right px-4 py-3">خطا</th>
                            <th className="text-right px-4 py-3">وضعیت</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map((row) => {
                            const variant = getStatusVariant(row.migrated, row.source)
                            const pct = row.source > 0 ? Math.round((row.migrated / row.source) * 100) : 100
                            return (
                                <tr key={row.table} className="border-b border-gray-800/50">
                                    <td className="px-5 py-3 text-gray-200 font-mono text-xs">{row.table}</td>
                                    <td className="px-4 py-3 text-gray-300">{row.source.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-3 text-green-400">{row.migrated.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-3 text-yellow-400">{row.skipped.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-3 text-red-400">{row.errors.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={variant}>{pct}٪</Badge>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Confirm modal */}
            <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="تأیید اجرای Migration">
                <div className="space-y-4">
                    <div className="bg-yellow-900/20 border border-yellow-600 rounded-xl p-4 text-yellow-400 text-sm">
                        ⚠️ این عملیات داده‌های موجود در پایگاه‌داده جدید را بازنویسی می‌کند. آیا مطمئن هستید؟
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowConfirm(false)}
                            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition-colors">
                            انصراف
                        </button>
                        <button onClick={handleRun}
                            className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors">
                            بله، اجرا شود
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
