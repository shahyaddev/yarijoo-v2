'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import OTPInput from '@/components/features/auth/OTPInput'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'

type Step = 'phone' | 'otp'

const RESEND_SECONDS = 120

function normalizePhone(phone: string): string {
    const clean = phone.trim().replace(/\s/g, '')
    if (clean.startsWith('+98')) return clean
    if (clean.startsWith('0')) return '+98' + clean.slice(1)
    if (/^9\d{9}$/.test(clean)) return '+98' + clean
    return clean
}

function formatCountdown(s: number): string {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirect') ?? '/dashboard'

    const [step, setStep] = useState<Step>('phone')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [phoneError, setPhoneError] = useState('')
    const [otpError, setOtpError] = useState('')
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const { login, isAuthenticated } = useAuthStore()

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace(redirectTo)
        }
    }, [isAuthenticated, redirectTo, router])

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    // Auto-submit when 6 digits entered
    useEffect(() => {
        if (otp.length === 6 && step === 'otp') {
            void handleVerifyOtp()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp])

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        const normalized = normalizePhone(phone)
        if (!/^\+989\d{9}$/.test(normalized)) {
            setPhoneError('شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)')
            return
        }
        setPhoneError('')
        setLoading(true)
        try {
            await api.post('/auth/send-otp', { phone: normalized })
            setStep('otp')
            setCountdown(RESEND_SECONDS)
            toast.success('کد تأیید ارسال شد')
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'خطا در ارسال کد. دوباره تلاش کنید.'
            setPhoneError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setOtpError('کد ۶ رقمی را کامل وارد کنید')
            return
        }
        setOtpError('')
        setLoading(true)
        try {
            await login(normalizePhone(phone), otp)
            toast.success('خوش آمدید!')
            router.replace(redirectTo)
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'کد نامعتبر یا منقضی شده است'
            setOtpError(msg)
            setOtp('')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (countdown > 0) return
        setLoading(true)
        setOtpError('')
        try {
            await api.post('/auth/send-otp', { phone: normalizePhone(phone) })
            setCountdown(RESEND_SECONDS)
            setOtp('')
            toast.success('کد جدید ارسال شد')
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'خطا در ارسال مجدد'
            setOtpError(msg)
        } finally {
            setLoading(false)
        }
    }

    const cardVariants = {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
        exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#FAF7F2' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl shadow-2xl p-8 w-full max-w-md"
                style={{ background: 'white' }}
            >
                {/* Back button */}
                <div className="mb-6">
                    <Link href="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
                        style={{ color: '#1B4332' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        بازگشت به سایت
                    </Link>
                </div>

                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                        style={{ background: '#1B4332' }}>
                        <span className="text-white text-3xl font-black">ی</span>
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>یاری‌جو</h1>
                    <p className="text-sm mt-1" style={{ color: '#8C8C8E' }}>پلتفرم سلامت روان</p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'phone' ? (
                        <motion.form
                            key="phone-step"
                            variants={cardVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            onSubmit={handleSendOtp}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: '#5C5C5E' }}
                                >
                                    شماره موبایل
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value)
                                        setPhoneError('')
                                    }}
                                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                                    dir="ltr"
                                    autoFocus
                                    autoComplete="tel"
                                    className="w-full px-4 py-3 border-2 rounded-xl text-center tracking-widest text-lg focus:outline-none transition-all"
                                    style={{
                                        borderColor: phoneError ? '#C62828' : '#EDE6D6',
                                        background: '#FAF7F2',
                                        color: '#1C1C1E',
                                    }}
                                    onFocus={e => !phoneError && ((e.target as HTMLInputElement).style.borderColor = '#1B4332')}
                                    onBlur={e => !phoneError && ((e.target as HTMLInputElement).style.borderColor = '#EDE6D6')}
                                />
                                {phoneError && (
                                    <p className="mt-1.5 text-sm" style={{ color: '#C62828' }}>{phoneError}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !phone}
                                className="w-full py-3 text-white font-semibold rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ background: '#1B4332' }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        در حال ارسال...
                                    </span>
                                ) : (
                                    'دریافت کد تأیید'
                                )}
                            </button>

                            {/* Bottom links */}
                            <div className="text-center pt-2">
                                <p className="text-sm" style={{ color: '#8C8C8E' }}>
                                    حساب ندارید؟{' '}
                                    <span className="font-semibold cursor-pointer" style={{ color: '#1B4332' }}>
                                        با ورود شماره موبایل ثبت‌نام می‌شوید
                                    </span>
                                </p>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="otp-step"
                            variants={cardVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-6"
                        >
                            {/* Info */}
                            <div className="text-center space-y-1">
                                <p className="text-sm" style={{ color: '#8C8C8E' }}>کد تأیید ارسال شده به</p>
                                <p className="font-bold text-lg" dir="ltr" style={{ color: '#1C1C1E' }}>
                                    {phone}
                                </p>
                            </div>

                            {/* OTP inputs */}
                            <OTPInput value={otp} onChange={setOtp} disabled={loading} hasError={!!otpError} />

                            {otpError && (
                                <p className="text-sm text-center" style={{ color: '#C62828' }}>{otpError}</p>
                            )}

                            {/* Submit button */}
                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length !== 6}
                                className="w-full py-3 text-white font-semibold rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ background: '#1B4332' }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        در حال تأیید...
                                    </span>
                                ) : (
                                    'تأیید و ورود'
                                )}
                            </button>

                            {/* Footer actions */}
                            <div className="flex items-center justify-between text-sm pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('phone')
                                        setOtp('')
                                        setOtpError('')
                                    }}
                                    className="font-medium transition-colors hover:opacity-70"
                                    style={{ color: '#1B4332' }}
                                >
                                    ← تغییر شماره
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={countdown > 0 || loading}
                                    className="font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:opacity-70"
                                    style={{ color: '#1B4332' }}
                                >
                                    {countdown > 0
                                        ? `ارسال مجدد (${formatCountdown(countdown)})`
                                        : 'ارسال مجدد کد'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
