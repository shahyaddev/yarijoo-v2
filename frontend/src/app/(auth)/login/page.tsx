'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import OTPInput from '@/components/features/auth/OTPInput'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'

type Step = 'phone' | 'otp' | 'profile'

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

const cardVariants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
}

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirect') ?? '/dashboard'

    const [step, setStep] = useState<Step>('phone')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [fullName, setFullName] = useState('')
    const [phoneError, setPhoneError] = useState('')
    const [otpError, setOtpError] = useState('')
    const [nameError, setNameError] = useState('')
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [devCode, setDevCode] = useState<string | null>(null)

    const { login, isAuthenticated, setUser, user } = useAuthStore()

    // Redirect if already authenticated and has a name
    useEffect(() => {
        if (isAuthenticated && user?.fullName) {
            router.replace(redirectTo)
        }
    }, [isAuthenticated, user, redirectTo, router])

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    // Auto-submit OTP when 6 digits entered
    useEffect(() => {
        if (otp.length === 6 && step === 'otp') {
            void handleVerifyOtp()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp])

    // ── Step 1: Send OTP ─────────────────────────────────────────────────────
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
            const res = await api.post<{ data: { message: string; devCode?: string } }>('/auth/send-otp', { phone: normalized })
            setStep('otp')
            setCountdown(RESEND_SECONDS)
            setDevCode(res.data?.data?.devCode ?? null)
            toast.success('کد تأیید ارسال شد')
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ارسال کد. دوباره تلاش کنید.'
            setPhoneError(msg)
        } finally {
            setLoading(false)
        }
    }

    // ── Step 2: Verify OTP ───────────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        if (otp.length !== 6) { setOtpError('کد ۶ رقمی را کامل وارد کنید'); return }
        setOtpError('')
        setLoading(true)
        try {
            const { isNewUser } = await login(normalizePhone(phone), otp)
            toast.success('خوش آمدید!')
            if (isNewUser) {
                setStep('profile')
            } else {
                window.location.href = redirectTo
            }
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'کد نامعتبر یا منقضی شده است'
            setOtpError(msg)
            setOtp('')
        } finally {
            setLoading(false)
        }
    }

    // ── Step 3: Complete Profile ─────────────────────────────────────────────
    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fullName.trim()) { setNameError('لطفاً نام خود را وارد کنید'); return }
        if (fullName.trim().length < 2) { setNameError('نام باید حداقل ۲ حرف باشد'); return }
        setNameError('')
        setLoading(true)
        try {
            const res = await api.patch<{ data: { fullName: string } }>('/users/profile', { fullName: fullName.trim() })
            // Update store with new name
            const updatedName = res.data?.data?.fullName ?? fullName.trim()
            const currentUser = useAuthStore.getState().user
            if (currentUser) {
                setUser({ ...currentUser, fullName: updatedName })
            }
            toast.success(`خوش آمدید ${updatedName} عزیز!`)
            window.location.href = redirectTo
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ذخیره اطلاعات'
            setNameError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (countdown > 0) return
        setLoading(true)
        setOtpError('')
        try {
            const res = await api.post<{ data: { message: string; devCode?: string } }>('/auth/send-otp', { phone: normalizePhone(phone) })
            setCountdown(RESEND_SECONDS)
            setOtp('')
            setDevCode(res.data?.data?.devCode ?? null)
            toast.success('کد جدید ارسال شد')
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ارسال مجدد'
            setOtpError(msg)
        } finally {
            setLoading(false)
        }
    }

    // ── Step indicator ───────────────────────────────────────────────────────
    const stepIndex = step === 'phone' ? 0 : step === 'otp' ? 1 : 2

    return (
        <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#FAF7F2' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl shadow-2xl p-8 w-full max-w-md"
                style={{ background: 'white' }}
            >
                {/* Back button */}
                {step !== 'profile' && (
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
                )}

                {/* Brand */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                        style={{ background: '#1B4332' }}>
                        <span className="text-white text-3xl font-black">ی</span>
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>یاری‌جو</h1>
                    <p className="text-sm mt-1" style={{ color: '#8C8C8E' }}>پلتفرم سلامت روان</p>
                </div>

                {/* Step dots */}
                <div className="flex items-center justify-center gap-2 mb-7">
                    {['شماره', 'کد تأیید', 'پروفایل'].map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                                    style={{
                                        background: i < stepIndex ? '#D1FAE5' : i === stepIndex ? '#1B4332' : '#F3EDE3',
                                        color: i < stepIndex ? '#065F46' : i === stepIndex ? 'white' : '#C4B8A8',
                                    }}>
                                    {i < stepIndex
                                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        : i + 1}
                                </div>
                                <span className="text-[10px]" style={{ color: i === stepIndex ? '#1B4332' : '#C4B8A8' }}>{label}</span>
                            </div>
                            {i < 2 && (
                                <div className="w-8 h-0.5 mb-4 rounded-full transition-all duration-300"
                                    style={{ background: i < stepIndex ? '#1B4332' : '#EDE6D6' }} />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">

                    {/* ── Step 1: Phone ─────────────────────── */}
                    {step === 'phone' && (
                        <motion.form key="phone" variants={cardVariants} initial="initial" animate="animate" exit="exit"
                            onSubmit={handleSendOtp} className="space-y-5">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#5C5C5E' }}>
                                    شماره موبایل
                                </label>
                                <input
                                    id="phone" type="tel" value={phone} dir="ltr" autoFocus autoComplete="tel"
                                    onChange={e => { setPhone(e.target.value); setPhoneError('') }}
                                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                                    className="w-full px-4 py-3 border-2 rounded-xl text-center tracking-widest text-lg focus:outline-none transition-colors"
                                    style={{ borderColor: phoneError ? '#C62828' : '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }}
                                    onFocus={e => !phoneError && ((e.target as HTMLInputElement).style.borderColor = '#1B4332')}
                                    onBlur={e => !phoneError && ((e.target as HTMLInputElement).style.borderColor = '#EDE6D6')}
                                />
                                {phoneError && <p className="mt-1.5 text-sm" style={{ color: '#C62828' }}>{phoneError}</p>}
                            </div>
                            <button type="submit" disabled={loading || !phone}
                                className="w-full py-3 text-white font-semibold rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ background: '#1B4332' }}>
                                {loading
                                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />در حال ارسال...</span>
                                    : 'دریافت کد تأیید'}
                            </button>
                            <p className="text-center text-sm pt-1" style={{ color: '#8C8C8E' }}>
                                با ورود شماره موبایل، ثبت‌نام یا ورود انجام می‌شود
                            </p>
                        </motion.form>
                    )}

                    {/* ── Step 2: OTP ───────────────────────── */}
                    {step === 'otp' && (
                        <motion.div key="otp" variants={cardVariants} initial="initial" animate="animate" exit="exit"
                            className="space-y-5">
                            <div className="text-center">
                                <p className="text-sm" style={{ color: '#8C8C8E' }}>کد تأیید ارسال شده به</p>
                                <p className="font-bold text-lg mt-0.5" dir="ltr" style={{ color: '#1C1C1E' }}>{phone}</p>
                            </div>

                            {devCode && (
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                    style={{ background: '#FFF8E1', border: '1.5px dashed #C9A84C' }}>
                                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                                    </svg>
                                    <div>
                                        <p className="text-xs font-semibold mb-0.5" style={{ color: '#92400E' }}>حالت تست — SMS ارسال نشد</p>
                                        <p className="text-sm font-black tracking-widest" style={{ color: '#92400E' }} dir="ltr">{devCode}</p>
                                    </div>
                                </div>
                            )}

                            <OTPInput value={otp} onChange={setOtp} disabled={loading} hasError={!!otpError} />

                            {otpError && <p className="text-sm text-center" style={{ color: '#C62828' }}>{otpError}</p>}

                            <button type="button" onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}
                                className="w-full py-3 text-white font-semibold rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ background: '#1B4332' }}>
                                {loading
                                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />در حال تأیید...</span>
                                    : 'تأیید و ادامه'}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button type="button" onClick={() => { setStep('phone'); setOtp(''); setOtpError('') }}
                                    className="font-medium hover:opacity-70 transition-opacity" style={{ color: '#1B4332' }}>
                                    ← تغییر شماره
                                </button>
                                <button type="button" onClick={handleResend} disabled={countdown > 0 || loading}
                                    className="font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
                                    style={{ color: '#1B4332' }}>
                                    {countdown > 0 ? `ارسال مجدد (${formatCountdown(countdown)})` : 'ارسال مجدد کد'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 3: Complete Profile ──────────── */}
                    {step === 'profile' && (
                        <motion.form key="profile" variants={cardVariants} initial="initial" animate="animate" exit="exit"
                            onSubmit={handleCompleteProfile} className="space-y-5">

                            <div className="text-center pb-1">
                                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                                    style={{ background: '#E8F5E9' }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <h2 className="font-black text-lg" style={{ color: '#1C1C1E' }}>تکمیل پروفایل</h2>
                                <p className="text-sm mt-1" style={{ color: '#8C8C8E' }}>
                                    خوش اومدی! لطفاً اسمت رو بنویس
                                </p>
                            </div>

                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium mb-2" style={{ color: '#5C5C5E' }}>
                                    نام و نام خانوادگی
                                </label>
                                <input
                                    id="fullName" type="text" value={fullName} autoFocus autoComplete="name"
                                    onChange={e => { setFullName(e.target.value); setNameError('') }}
                                    placeholder="مثال: علی احمدی"
                                    className="w-full px-4 py-3 border-2 rounded-xl text-center text-lg focus:outline-none transition-colors"
                                    style={{ borderColor: nameError ? '#C62828' : '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }}
                                    onFocus={e => !nameError && ((e.target as HTMLInputElement).style.borderColor = '#1B4332')}
                                    onBlur={e => !nameError && ((e.target as HTMLInputElement).style.borderColor = '#EDE6D6')}
                                />
                                {nameError && <p className="mt-1.5 text-sm" style={{ color: '#C62828' }}>{nameError}</p>}
                            </div>

                            <button type="submit" disabled={loading || !fullName.trim()}
                                className="w-full py-3 text-white font-semibold rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ background: '#1B4332' }}>
                                {loading
                                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />در حال ذخیره...</span>
                                    : 'ورود به پنل کاربری'}
                            </button>

                            <button type="button"
                                onClick={() => { window.location.href = redirectTo }}
                                className="w-full py-2 text-sm font-medium transition-opacity hover:opacity-70"
                                style={{ color: '#8C8C8E' }}>
                                فعلاً رد می‌شم ←
                            </button>
                        </motion.form>
                    )}

                </AnimatePresence>
            </motion.div>
        </div>
    )
}
