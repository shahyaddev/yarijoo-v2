'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'

interface Props {
    psychologistId: string
    isAvailable: boolean
    hourlyRate: number
}

// Persian digit to ASCII mapping for time parsing
const PERSIAN_TO_ASCII: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
}

function persianToAscii(str: string): string {
    return str.replace(/[۰-۹]/g, (d) => PERSIAN_TO_ASCII[d] ?? d)
}

const TIME_SLOTS = ['۹:۰۰', '۱۰:۰۰', '۱۱:۰۰', '۱۴:۰۰', '۱۵:۰۰', '۱۶:۰۰', '۱۷:۰۰']

export default function BookAppointmentButton({ psychologistId, isAvailable, hourlyRate }: Props) {
    const { isAuthenticated } = useAuthStore()
    const router = useRouter()
    const [showPicker, setShowPicker] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [type, setType] = useState<'online' | 'phone'>('online')
    const [notes, setNotes] = useState('')
    const [booking, setBooking] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Next 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i + 1)
        return {
            iso: d.toISOString().split('T')[0],
            label: d.toLocaleDateString('fa-IR', { weekday: 'short', month: 'short', day: 'numeric' })
        }
    })

    const handleBook = async () => {
        if (!isAuthenticated) { router.push('/auth/login?redirect=/psychologists'); return }
        if (!selectedDate || !selectedTime) { setError('لطفاً تاریخ و ساعت را انتخاب کنید'); return }

        setBooking(true); setError('')
        try {
            const asciiTime = persianToAscii(selectedTime)
            const startTime = new Date(`${selectedDate}T${asciiTime}:00`).toISOString()
            const endTime = new Date(
                new Date(`${selectedDate}T${asciiTime}:00`).getTime() + 60 * 60 * 1000
            ).toISOString()

            const res = await api.post<{
                appointment: { id: string }
                requiresPayment: boolean
                redirectUrl?: string
            }>('/appointments', {
                psychologistId,
                startTime,
                endTime,
                notes: notes.trim() || undefined,
            })

            const data = res.data as {
                appointment: { id: string }
                requiresPayment: boolean
                redirectUrl?: string
            }

            if (data.requiresPayment && data.redirectUrl) {
                // Redirect to Zarinpal payment gateway
                window.location.href = data.redirectUrl
            } else {
                // Free appointment (hourlyRate = 0) — show success
                setSuccess(true)
            }
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در رزرو نوبت')
        } finally {
            setBooking(false)
        }
    }

    if (success) {
        return (
            <div className="rounded-2xl border p-5 text-center" style={{ background: '#E8F5E9', borderColor: '#B2DFCB' }}>
                <div className="text-3xl mb-2">✅</div>
                <p className="font-bold" style={{ color: '#1B4332' }}>نوبت با موفقیت رزرو شد</p>
                <p className="text-sm mt-1" style={{ color: '#2D6A4F' }}>جزئیات به پنل کاربری شما ارسال شد</p>
                <a href="/dashboard/appointments" className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ background: '#1B4332' }}>
                    مشاهده نوبت‌ها
                </a>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {!showPicker ? (
                <button
                    onClick={() => {
                        if (!isAuthenticated) router.push('/auth/login?redirect=/psychologists')
                        else setShowPicker(true)
                    }}
                    disabled={!isAvailable}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                    style={{ background: '#1B4332' }}>
                    {isAvailable ? '📅 رزرو نوبت' : 'در حال حاضر پذیرش ندارد'}
                </button>
            ) : (
                <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <h3 className="font-bold" style={{ color: '#1C1C1E' }}>رزرو نوبت</h3>

                    {/* Date */}
                    <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: '#8C8C8E' }}>تاریخ</p>
                        <div className="flex flex-wrap gap-1.5">
                            {days.map(d => (
                                <button key={d.iso} onClick={() => setSelectedDate(d.iso)}
                                    className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                                    style={selectedDate === d.iso
                                        ? { background: '#1B4332', color: 'white' }
                                        : { background: '#F3EDE3', color: '#5C5C5E' }}>
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time */}
                    <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: '#8C8C8E' }}>ساعت</p>
                        <div className="flex flex-wrap gap-1.5">
                            {TIME_SLOTS.map(t => (
                                <button key={t} onClick={() => setSelectedTime(t)}
                                    className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                                    style={selectedTime === t
                                        ? { background: '#1B4332', color: 'white' }
                                        : { background: '#F3EDE3', color: '#5C5C5E' }}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type */}
                    <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: '#8C8C8E' }}>نوع جلسه</p>
                        <div className="flex gap-2">
                            {[{ v: 'online', l: '📹 آنلاین' }, { v: 'phone', l: '📞 تلفنی' }].map(o => (
                                <button key={o.v} onClick={() => setType(o.v as 'online' | 'phone')}
                                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                                    style={type === o.v
                                        ? { background: '#1B4332', color: 'white' }
                                        : { background: '#F3EDE3', color: '#5C5C5E' }}>
                                    {o.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: '#8C8C8E' }}>توضیحات (اختیاری)</p>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="درباره موضوع مشاوره..."
                            className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none resize-none"
                            style={{ borderColor: '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E' }} />
                    </div>

                    {/* Price */}
                    <div className="flex justify-between text-sm font-bold py-2 border-t" style={{ borderColor: '#EDE6D6', color: '#1C1C1E' }}>
                        <span>هزینه جلسه</span>
                        <span style={{ color: '#1B4332' }}>
                            {hourlyRate > 0 ? `${hourlyRate.toLocaleString('fa-IR')} تومان` : 'رایگان'}
                        </span>
                    </div>

                    {error && <p className="text-xs font-semibold" style={{ color: '#C62828' }}>⚠️ {error}</p>}

                    <div className="flex gap-2">
                        <button onClick={handleBook} disabled={booking}
                            className="flex-1 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                            style={{ background: '#1B4332' }}>
                            {booking ? 'در حال پردازش...' : hourlyRate > 0 ? '💳 پرداخت و رزرو' : '✅ تأیید رزرو'}
                        </button>
                        <button onClick={() => setShowPicker(false)}
                            className="px-4 py-3 rounded-xl text-sm border"
                            style={{ borderColor: '#EDE6D6', color: '#8C8C8E' }}>
                            لغو
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
