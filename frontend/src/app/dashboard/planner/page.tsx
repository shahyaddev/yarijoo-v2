'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth.store'

interface PlannerEvent {
    id: string
    title: string
    description: string | null
    event_date: string
    event_time: string | null
    color: string
    sms_reminder: boolean
    reminder_minutes: number
    is_done: boolean
}

const COLORS = ['#1B4332', '#1565C0', '#C62828', '#C9A84C', '#6A1B9A', '#00695C', '#E65100']

const JALALI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

function toGregorian(jy: number, jm: number, jd: number): Date {
    // Simple Persian to Gregorian conversion
    const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
    let jy2 = jy - 979
    let jm2 = jm - 1
    let jd2 = jd - 1
    let j_day_no = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor((jy2 % 33 + 3) / 4)
    for (let i = 0; i < jm2; i++) j_day_no += j_days_in_month[i]
    j_day_no += jd2
    let g_day_no = j_day_no + 79
    let gy = 1600 + 400 * Math.floor(g_day_no / 146097)
    g_day_no %= 146097
    let leap = true
    if (g_day_no >= 36525) { g_day_no--; gy += 100 * Math.floor(g_day_no / 36524); g_day_no %= 36524; if (g_day_no >= 365) g_day_no++; else leap = false }
    gy += 4 * Math.floor(g_day_no / 1461)
    g_day_no %= 1461
    if (g_day_no >= 366) { leap = false; g_day_no--; gy += Math.floor(g_day_no / 365); g_day_no %= 365 }
    const g_mon = [29, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (leap) g_mon[1] = 29
    let gm = 0
    for (gm = 0; gm < 12; gm++) { if (g_day_no < g_mon[gm + 1]) break; g_day_no -= g_mon[gm + 1] }
    const gd = g_day_no + 1
    return new Date(gy, gm, gd)
}

function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
    const g_d_no = 365 * (gy - 1600) + Math.floor((gy - 1600 + 3) / 4) - Math.floor((gy - 1600 + 99) / 100) + Math.floor((gy - 1600 + 399) / 400)
    const g_days = [0, 31, 59 + Math.floor((gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) ? 1 : 0), 90, 120, 151, 181, 212, 243, 273, 304, 334]
    let g_day_no = g_d_no + g_days[gm - 1] + gd - 1
    let j_day_no = g_day_no - 79
    const j_np = Math.floor(j_day_no / 12053); j_day_no %= 12053
    let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461)
    j_day_no %= 1461
    if (j_day_no >= 366) { jy += Math.floor((j_day_no - 1) / 365); j_day_no = (j_day_no - 1) % 365 }
    const j_mi = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
    let jm2 = 0
    for (jm2 = 0; jm2 < 11 && j_day_no >= j_mi[jm2]; jm2++) j_day_no -= j_mi[jm2]
    return [jy, jm2 + 1, j_day_no + 1]
}

function getDaysInJalaliMonth(jy: number, jm: number): number {
    if (jm <= 6) return 31
    if (jm <= 11) return 30
    // اسفند
    const g = toGregorian(jy, 12, 29)
    const isLeap = (g.getFullYear() % 4 === 0 && (g.getFullYear() % 100 !== 0 || g.getFullYear() % 400 === 0))
    return isLeap ? 30 : 29
}

function getFirstDayOfJalaliMonth(jy: number, jm: number): number {
    // returns 0=Saturday ... 6=Friday
    const d = toGregorian(jy, jm, 1)
    return (d.getDay() + 1) % 7
}

function toISO(jy: number, jm: number, jd: number): string {
    const g = toGregorian(jy, jm, jd)
    return `${g.getFullYear()}-${String(g.getMonth() + 1).padStart(2, '0')}-${String(g.getDate()).padStart(2, '0')}`
}

export default function PlannerPage() {
    const { accessToken } = useAuthStore()
    const today = new Date()
    const [jToday] = useState(() => toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate()))
    const [viewYear, setViewYear] = useState(jToday[0])
    const [viewMonth, setViewMonth] = useState(jToday[1])
    const [selectedDay, setSelectedDay] = useState<number | null>(jToday[2])
    const [events, setEvents] = useState<PlannerEvent[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', description: '', event_time: '', color: '#1B4332', sms_reminder: false, reminder_minutes: '60' })
    const [saving, setSaving] = useState(false)

    const loadEvents = useCallback(() => {
        if (!accessToken) return
        setLoading(true)
        // Convert jalali month to gregorian for API
        const startG = toGregorian(viewYear, viewMonth, 1)
        fetch(`/api/planner?year=${startG.getFullYear()}&month=${startG.getMonth() + 1}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(r => r.json())
            .then(r => setEvents(r.data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false))
    }, [accessToken, viewYear, viewMonth])

    useEffect(() => { loadEvents() }, [loadEvents])

    const daysInMonth = getDaysInJalaliMonth(viewYear, viewMonth)
    const firstDay = getFirstDayOfJalaliMonth(viewYear, viewMonth)

    const getEventsForDay = (day: number) => {
        const iso = toISO(viewYear, viewMonth, day)
        return events.filter(e => e.event_date.startsWith(iso))
    }

    const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : []
    const selectedISO = selectedDay ? toISO(viewYear, viewMonth, selectedDay) : ''

    const prevMonth = () => {
        if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
        else setViewMonth(m => m - 1)
        setSelectedDay(null)
    }
    const nextMonth = () => {
        if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
        else setViewMonth(m => m + 1)
        setSelectedDay(null)
    }

    const createEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedISO || !form.title.trim()) return
        setSaving(true)
        try {
            await fetch('/api/planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({
                    title: form.title.trim(),
                    description: form.description.trim() || null,
                    event_date: selectedISO,
                    event_time: form.event_time || null,
                    color: form.color,
                    sms_reminder: form.sms_reminder,
                    reminder_minutes: parseInt(form.reminder_minutes) || 60,
                })
            })
            setForm({ title: '', description: '', event_time: '', color: '#1B4332', sms_reminder: false, reminder_minutes: '60' })
            setShowForm(false)
            loadEvents()
        } catch { }
        finally { setSaving(false) }
    }

    const toggleDone = async (id: string, done: boolean) => {
        try {
            await fetch(`/api/planner?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ is_done: !done })
            })
            setEvents(es => es.map(ev => ev.id === id ? { ...ev, is_done: !done } : ev))
        } catch { }
    }

    const deleteEvent = async (id: string) => {
        if (!confirm('رویداد حذف شود؟')) return
        try {
            await fetch(`/api/planner?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            setEvents(es => es.filter(ev => ev.id !== id))
        } catch { }
    }

    const isToday = (day: number) => jToday[0] === viewYear && jToday[1] === viewMonth && jToday[2] === day

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>تقویم برنامه‌ریزی</h1>
                <div className="text-xs px-3 py-1.5 rounded-xl font-semibold" style={{ background: '#E8F5E9', color: '#1B4332' }}>
                    {jToday[0]}/{String(jToday[1]).padStart(2, '0')}/{String(jToday[2]).padStart(2, '0')}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
                {/* Calendar */}
                <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#F3EDE3] transition-colors" style={{ color: '#1B4332' }}>‹</button>
                        <h2 className="font-black text-lg" style={{ color: '#1C1C1E' }}>
                            {JALALI_MONTHS[viewMonth - 1]} {viewYear.toLocaleString('fa-IR')}
                        </h2>
                        <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#F3EDE3] transition-colors" style={{ color: '#1B4332' }}>›</button>
                    </div>

                    {/* Week day headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {WEEK_DAYS.map(d => (
                            <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: '#8C8C8E' }}>{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const dayEvents = getEventsForDay(day)
                            const selected = selectedDay === day
                            const today2 = isToday(day)
                            return (
                                <button
                                    key={day}
                                    onClick={() => { setSelectedDay(day); setShowForm(false) }}
                                    className="relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
                                    style={{
                                        background: selected ? '#1B4332' : today2 ? '#E8F5E9' : 'transparent',
                                        color: selected ? 'white' : today2 ? '#1B4332' : '#1C1C1E',
                                        fontWeight: today2 ? 700 : 500,
                                    }}
                                >
                                    {day.toLocaleString('fa-IR')}
                                    {/* Event dots */}
                                    {dayEvents.length > 0 && (
                                        <div className="absolute bottom-1 flex gap-0.5">
                                            {dayEvents.slice(0, 3).map(ev => (
                                                <div key={ev.id} className="w-1.5 h-1.5 rounded-full"
                                                    style={{ background: selected ? 'rgba(255,255,255,0.7)' : ev.color }} />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Day panel */}
                <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6', minHeight: '400px' }}>
                    {!selectedDay ? (
                        <div className="flex flex-col items-center justify-center h-full py-10" style={{ color: '#8C8C8E' }}>
                            <div className="text-4xl mb-3">📅</div>
                            <p className="text-sm">یک روز را انتخاب کنید</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-base" style={{ color: '#1C1C1E' }}>
                                    {selectedDay.toLocaleString('fa-IR')} {JALALI_MONTHS[viewMonth - 1]}
                                </h3>
                                <button onClick={() => setShowForm(true)}
                                    className="text-xs px-3 py-1.5 rounded-xl font-bold text-white transition-colors"
                                    style={{ background: '#1B4332' }}>+ رویداد</button>
                            </div>

                            {/* Add form */}
                            {showForm && (
                                <form onSubmit={createEvent} className="mb-4 p-4 rounded-xl space-y-3" style={{ background: '#F9F5EF', border: '1px solid #EDE6D6' }}>
                                    <input required value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="عنوان رویداد *"
                                        className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-green-600"
                                        style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }} />
                                    <textarea value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="یادداشت (اختیاری)"
                                        rows={2} className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none resize-none"
                                        style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs mb-1 block" style={{ color: '#8C8C8E' }}>ساعت</label>
                                            <input type="time" value={form.event_time}
                                                onChange={e => setForm({ ...form, event_time: e.target.value })}
                                                className="w-full px-2 py-1.5 rounded-lg text-sm border focus:outline-none"
                                                style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }} />
                                        </div>
                                        <div>
                                            <label className="text-xs mb-1 block" style={{ color: '#8C8C8E' }}>رنگ</label>
                                            <div className="flex gap-1.5 flex-wrap pt-0.5">
                                                {COLORS.map(c => (
                                                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                                                        className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                                                        style={{ background: c, borderColor: form.color === c ? '#1C1C1E' : 'transparent' }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.sms_reminder}
                                            onChange={e => setForm({ ...form, sms_reminder: e.target.checked })}
                                            className="w-4 h-4 rounded accent-green-700" />
                                        <span className="text-sm" style={{ color: '#1C1C1E' }}>یادآوری پیامکی</span>
                                    </label>
                                    {form.sms_reminder && (
                                        <div>
                                            <label className="text-xs mb-1 block" style={{ color: '#8C8C8E' }}>چند دقیقه قبل</label>
                                            <select value={form.reminder_minutes}
                                                onChange={e => setForm({ ...form, reminder_minutes: e.target.value })}
                                                className="w-full px-2 py-1.5 rounded-lg text-sm border focus:outline-none"
                                                style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}>
                                                <option value="15">۱۵ دقیقه</option>
                                                <option value="30">۳۰ دقیقه</option>
                                                <option value="60">۱ ساعت</option>
                                                <option value="120">۲ ساعت</option>
                                                <option value="1440">۱ روز</option>
                                            </select>
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-1">
                                        <button type="submit" disabled={saving}
                                            className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                            style={{ background: '#1B4332' }}>
                                            {saving ? 'ذخیره…' : 'ذخیره'}
                                        </button>
                                        <button type="button" onClick={() => setShowForm(false)}
                                            className="px-4 py-2 rounded-xl text-sm border"
                                            style={{ borderColor: '#EDE6D6', color: '#8C8C8E' }}>لغو</button>
                                    </div>
                                </form>
                            )}

                            {/* Events list */}
                            {loading ? (
                                <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#F3EDE3' }} />)}</div>
                            ) : selectedEvents.length === 0 ? (
                                <div className="text-center py-8" style={{ color: '#8C8C8E' }}>
                                    <p className="text-sm">رویدادی برای این روز ندارید</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedEvents.map(ev => (
                                        <div key={ev.id}
                                            className="flex items-start gap-3 p-3 rounded-xl border transition-all"
                                            style={{ borderColor: '#EDE6D6', background: ev.is_done ? '#F9F9F9' : 'white', opacity: ev.is_done ? 0.65 : 1 }}>
                                            <button onClick={() => toggleDone(ev.id, ev.is_done)}
                                                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                                                style={{ borderColor: ev.color, background: ev.is_done ? ev.color : 'transparent' }}>
                                                {ev.is_done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold ${ev.is_done ? 'line-through' : ''}`} style={{ color: '#1C1C1E' }}>{ev.title}</p>
                                                {ev.event_time && <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>⏰ {ev.event_time.slice(0, 5)}</p>}
                                                {ev.description && <p className="text-xs mt-1 leading-relaxed" style={{ color: '#5C5C5E' }}>{ev.description}</p>}
                                                {ev.sms_reminder && <p className="text-xs mt-1" style={{ color: '#1B4332' }}>📱 یادآوری پیامکی</p>}
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <div className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ background: ev.color }} />
                                                <button onClick={() => deleteEvent(ev.id)}
                                                    className="text-xs transition-colors" style={{ color: '#C62828' }}>×</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* This month summary */}
            {events.length > 0 && (
                <div className="mt-5 rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                    <h3 className="font-bold mb-3" style={{ color: '#1C1C1E' }}>خلاصه این ماه</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                            { label: 'کل رویداد', v: events.length, color: '#E8F5E9' },
                            { label: 'انجام شده', v: events.filter(e => e.is_done).length, color: '#E3F2FD' },
                            { label: 'با یادآوری', v: events.filter(e => e.sms_reminder).length, color: '#FFF8E1' },
                        ].map(s => (
                            <div key={s.label} className="rounded-xl p-3" style={{ background: s.color }}>
                                <div className="text-2xl font-black" style={{ color: '#1C1C1E' }}>{s.v.toLocaleString('fa-IR')}</div>
                                <div className="text-xs mt-1" style={{ color: '#8C8C8E' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
