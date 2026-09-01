'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

type Status = 'loading' | 'success' | 'failed' | 'error'

interface VerifyResult {
    success: boolean
    refId?: number
    appointmentId?: string
    message?: string
}

export default function AppointmentCallbackPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<Status>('loading')
    const [result, setResult] = useState<VerifyResult | null>(null)
    const verifiedRef = useRef(false)

    useEffect(() => {
        // Guard against double invocation in React strict mode
        if (verifiedRef.current) return
        verifiedRef.current = true

        const appointmentId = searchParams.get('appointmentId')
        const authority = searchParams.get('Authority')
        const payStatus = searchParams.get('Status')

        if (!appointmentId || !authority) {
            setStatus('error')
            return
        }

        // Call backend to verify the payment
        api.get<VerifyResult>('/appointments/callback', {
            params: { appointmentId, Authority: authority, Status: payStatus },
        })
            .then((res) => {
                const data = res.data as VerifyResult
                setResult(data)
                setStatus(data.success ? 'success' : 'failed')
            })
            .catch(() => {
                setStatus('error')
            })
    }, [searchParams])

    // Auto-redirect to appointments page after success
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => router.push('/dashboard/appointments'), 4000)
            return () => clearTimeout(timer)
        }
    }, [status, router])

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAF7F2' }}>
            <div className="max-w-md w-full rounded-3xl border p-10 text-center shadow-lg" style={{ background: 'white', borderColor: '#EDE6D6' }}>

                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin mx-auto mb-6" />
                        <h2 className="text-lg font-bold mb-2" style={{ color: '#1C1C1E' }}>در حال تأیید پرداخت...</h2>
                        <p className="text-sm" style={{ color: '#8C8C8E' }}>لطفاً صبر کنید</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-xl font-black mb-2" style={{ color: '#1B4332' }}>پرداخت موفق</h2>
                        <p className="text-sm mb-1" style={{ color: '#2D6A4F' }}>نوبت مشاوره شما با موفقیت رزرو شد</p>
                        {result?.refId && (
                            <p className="text-xs mt-3 px-4 py-2 rounded-xl inline-block" style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                کد پیگیری: <span className="font-bold">{result.refId}</span>
                            </p>
                        )}
                        <p className="text-xs mt-4" style={{ color: '#8C8C8E' }}>در حال انتقال به پنل نوبت‌ها...</p>
                        <Link href="/dashboard/appointments"
                            className="inline-block mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                            style={{ background: '#1B4332' }}>
                            مشاهده نوبت‌ها
                        </Link>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-xl font-black mb-2" style={{ color: '#C62828' }}>پرداخت ناموفق</h2>
                        <p className="text-sm mb-4" style={{ color: '#8C8C8E' }}>
                            {result?.message ?? 'پرداخت انجام نشد یا توسط شما لغو شد.'}
                        </p>
                        <p className="text-xs mb-6" style={{ color: '#8C8C8E' }}>مبلغی از حساب شما کسر نشده است.</p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/psychologists"
                                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                                style={{ background: '#1B4332' }}>
                                رزرو مجدد
                            </Link>
                            <Link href="/dashboard"
                                className="px-5 py-2.5 rounded-xl text-sm border font-medium"
                                style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>
                                داشبورد
                            </Link>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-black mb-2" style={{ color: '#C9A84C' }}>خطای غیرمنتظره</h2>
                        <p className="text-sm mb-6" style={{ color: '#8C8C8E' }}>
                            در پردازش پرداخت مشکلی پیش آمد. با پشتیبانی تماس بگیرید.
                        </p>
                        <Link href="/dashboard/appointments"
                            className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                            style={{ background: '#1B4332' }}>
                            بررسی نوبت‌ها
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
