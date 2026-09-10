'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ event, onConfirm, onCancel }: {
    event: PlannerEvent
    onConfirm: () => void
    onCancel: () => void
}) {
    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onCancel])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={onCancel}
        >
            <div
                className="w-full max-w-sm rounded-2xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: '#FEE2E2' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-black text-base" style={{ color: '#1C1C1E' }}>حذف رویداد</h3>
                        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#5C5C5E' }}>
                            آیا مطمئنید که می‌خواهید رویداد
                            {' '}<span className="font-bold" style={{ color: '#1C1C1E' }}>«{event.title}»</span>{' '}
                            را حذف کنید؟ این عمل قابل بازگشت نیست.
                        </p>
                    </div>
                </div>

                {/* Event preview */}
                <div className="mx-6 mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
                    style={{ background: '#FDFBF8', border: '1px solid #EDE6D6' }}>
                    <div className="w-3 h-full min-h-[36px] rounded-full shrink-0" style={{ background: event.color }} />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1C1C1E' }}>{event.title}</p>
                        {event.event_time && (
                            <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                                ساعت {event.event_time.slice(0, 5)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-[#F3EDE3]"
                        style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>
                        انصراف
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                        style={{ background: '#C62828' }}>
                        حذف رویداد
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = ['#1B4332', '#1565C0', '#C62828', '#C9A84C', '#6A1B9A', '#00695C', '#E65100']

const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']
const WEEK_DAYS = ['ش','ی','د','س','چ','پ','ج']

const REMINDER_OPTIONS = [
    { value: '15',   label: '۱۵ دقیقه قبل' },
    { value: '30',   label: '۳۰ دقیقه قبل' },
    { value: '60',   label: '۱ ساعت قبل' },
    { value: '120',  label: '۲ ساعت قبل' },
    { value: '1440', label: '۱ روز قبل' },
]

// ─── Jalali helpers ───────────────────────────────────────────────────────────

function toGregorian(jy: number, jm: number, jd: number): Date {
    const j_mi = [31,31,31,31,31,31,30,30,30,30,30,29]
    let jy2=jy-979,jm2=jm-1,jd2=jd-1
    let j_day_no=365*jy2+Math.floor(jy2/33)*8+Math.floor((jy2%33+3)/4)
    for(let i=0;i<jm2;i++) j_day_no+=j_mi[i]
    j_day_no+=jd2
    let g_day_no=j_day_no+79
    let gy=1600+400*Math.floor(g_day_no/146097)
    g_day_no%=146097
    let leap=true
    if(g_day_no>=36525){g_day_no--;gy+=100*Math.floor(g_day_no/36524);g_day_no%=36524;if(g_day_no>=365)g_day_no++;else leap=false}
    gy+=4*Math.floor(g_day_no/1461);g_day_no%=1461
    if(g_day_no>=366){leap=false;g_day_no--;gy+=Math.floor(g_day_no/365);g_day_no%=365}
    const g_mon=[29,31,28,31,30,31,30,31,31,30,31,30,31]
    if(leap) g_mon[1]=29
    let gm=0
    for(gm=0;gm<12;gm++){if(g_day_no<g_mon[gm+1])break;g_day_no-=g_mon[gm+1]}
    return new Date(gy,gm,g_day_no+1)
}

function toJalali(gy: number, gm: number, gd: number): [number,number,number] {
    const isLeap=(y: number)=>y%4===0&&(y%100!==0||y%400===0)
    const g_days=[0,31,59+(isLeap(gy)?1:0),90,120,151,181,212,243,273,304,334]
    const g_d_no=365*(gy-1600)+Math.floor((gy-1597)/4)-Math.floor((gy-1601)/100)+Math.floor((gy-1601)/400)
    let g_day_no=g_d_no+g_days[gm-1]+gd-1
    let j_day_no=g_day_no-79
    const j_np=Math.floor(j_day_no/12053);j_day_no%=12053
    let jy=979+33*j_np+4*Math.floor(j_day_no/1461)
    j_day_no%=1461
    if(j_day_no>=366){jy+=Math.floor((j_day_no-1)/365);j_day_no=(j_day_no-1)%365}
    const j_mi=[31,31,31,31,31,31,30,30,30,30,30,29]
    let jm2=0
    for(jm2=0;jm2<11&&j_day_no>=j_mi[jm2];jm2++) j_day_no-=j_mi[jm2]
    return [jy,jm2+1,j_day_no+1]
}

function getDaysInMonth(jy: number, jm: number): number {
    if(jm<=6) return 31
    if(jm<=11) return 30
    return toGregorian(jy,12,29).getFullYear()%4===0 ? 30 : 29
}

function getFirstDay(jy: number, jm: number): number {
    return (toGregorian(jy,jm,1).getDay()+1)%7
}

function toISO(jy: number, jm: number, jd: number): string {
    const g=toGregorian(jy,jm,jd)
    return `${g.getFullYear()}-${String(g.getMonth()+1).padStart(2,'0')}-${String(g.getDate()).padStart(2,'0')}`
}

// ─── Custom Checkbox ─────────────────────────────────────────────────────────

function Checkbox({ checked, onChange, color = '#1B4332' }: {
    checked: boolean; onChange: (v: boolean) => void; color?: string
}) {
    return (
        <button type="button" onClick={() => onChange(!checked)}
            className="flex items-center justify-center rounded-lg shrink-0 transition-all"
            style={{
                width: 20, height: 20,
                border: `2px solid ${checked ? color : '#DDD5C5'}`,
                background: checked ? color : 'white',
                boxShadow: checked ? `0 0 0 3px ${color}22` : 'none',
            }}>
            {checked && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </button>
    )
}

// ─── Custom Select ────────────────────────────────────────────────────────────

function Select({ value, onChange, options }: {
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const current = options.find(o => o.value === value)

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'white', border: `1.5px solid ${open ? '#1B4332' : '#EDE6D6'}`, color: '#1C1C1E' }}>
                <span>{current?.label ?? '—'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C8C8E" strokeWidth="2.5" strokeLinecap="round"
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
                    style={{ background: 'white', border: '1.5px solid #EDE6D6', boxShadow: '0 8px 24px rgba(27,67,50,0.12)' }}>
                    {options.map(o => (
                        <button key={o.value} type="button"
                            onClick={() => { onChange(o.value); setOpen(false) }}
                            className="w-full text-right px-4 py-2.5 text-sm transition-colors hover:bg-[#F3EDE3]"
                            style={{
                                color: o.value === value ? '#1B4332' : '#1C1C1E',
                                fontWeight: o.value === value ? 700 : 400,
                                background: o.value === value ? '#E8F5E9' : 'transparent',
                            }}>
                            {o.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function IcoPlus({ size = 14, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function IcoTrash({ size = 13, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}
function IcoClock({ size = 12, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function IcoSms({ size = 12, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
}
function IcoCalendar({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}
function IcoChevronLeft({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function IcoChevronRight({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlannerPage() {
    const { accessToken } = useAuthStore()
    const today = new Date()
    const [jToday] = useState(() => toJalali(today.getFullYear(), today.getMonth()+1, today.getDate()))
    const [viewYear,  setViewYear]  = useState(jToday[0])
    const [viewMonth, setViewMonth] = useState(jToday[1])
    const [selectedDay, setSelectedDay] = useState<number | null>(jToday[2])
    const [events,  setEvents]  = useState<PlannerEvent[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [saving,  setSaving]  = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<PlannerEvent | null>(null)
    const [form, setForm] = useState({
        title: '', description: '', event_time: '',
        color: '#1B4332', sms_reminder: false, reminder_minutes: '60',
    })

    const loadEvents = useCallback(() => {
        if (!accessToken) return
        setLoading(true)
        // A Jalali month spans parts of 2 Gregorian months.
        // Query the full Gregorian range: from first day of Jalali month to last day.
        const startG = toGregorian(viewYear, viewMonth, 1)
        const endG   = toGregorian(viewYear, viewMonth, getDaysInMonth(viewYear, viewMonth))

        // We need all Gregorian months between startG and endG.
        // Simplest: query from startG year/month to endG year/month inclusive.
        const params = new URLSearchParams({
            yearStart:  String(startG.getFullYear()),
            monthStart: String(startG.getMonth() + 1),
            yearEnd:    String(endG.getFullYear()),
            monthEnd:   String(endG.getMonth() + 1),
        })
        fetch(`/api/planner?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(r => r.json())
            .then(r => setEvents(r.data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false))
    }, [accessToken, viewYear, viewMonth])

    useEffect(() => { loadEvents() }, [loadEvents])

    const daysInMonth = getDaysInMonth(viewYear, viewMonth)
    const firstDay    = getFirstDay(viewYear, viewMonth)
    const selectedISO = selectedDay ? toISO(viewYear, viewMonth, selectedDay) : ''

    const getEventsForDay = (day: number) => {
        const iso = toISO(viewYear, viewMonth, day)
        return events.filter(e => {
            // Normalize: extract just YYYY-MM-DD regardless of whether
            // the DB returned a plain date or a timestamptz string
            const dateStr = e.event_date.slice(0, 10)
            return dateStr === iso
        })
    }
    const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : []

    const prevMonth = () => { if(viewMonth===1){setViewYear(y=>y-1);setViewMonth(12)}else setViewMonth(m=>m-1);setSelectedDay(null) }
    const nextMonth = () => { if(viewMonth===12){setViewYear(y=>y+1);setViewMonth(1)}else setViewMonth(m=>m+1);setSelectedDay(null) }
    const isToday   = (d: number) => jToday[0]===viewYear && jToday[1]===viewMonth && jToday[2]===d

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
            setForm({ title:'', description:'', event_time:'', color:'#1B4332', sms_reminder:false, reminder_minutes:'60' })
            setShowForm(false)
            loadEvents()
        } catch {}
        finally { setSaving(false) }
    }

    const toggleDone = async (id: string, done: boolean) => {
        try {
            await fetch(`/api/planner?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ is_done: !done })
            })
            setEvents(es => es.map(ev => ev.id===id ? {...ev, is_done:!done} : ev))
        } catch {}
    }

    const deleteEvent = async (id: string) => {
        try {
            await fetch(`/api/planner?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            setEvents(es => es.filter(ev => ev.id !== id))
            setDeleteTarget(null)
        } catch {}
    }

    // stats
    const totalEvents  = events.length
    const doneEvents   = events.filter(e => e.is_done).length
    const smsEvents    = events.filter(e => e.sms_reminder).length

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#1C1C1E' }}>تقویم برنامه‌ریزی</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#8C8C8E' }}>
                        امروز: {jToday[2].toLocaleString('fa-IR')} {MONTHS[jToday[1]-1]} {jToday[0].toLocaleString('fa-IR')}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: '#E8F5E9', color: '#1B4332' }}>
                    <IcoCalendar size={14} color="#1B4332" />
                    {jToday[0].toLocaleString('fa-IR')}/{String(jToday[1]).padStart(2,'0')}/{String(jToday[2]).padStart(2,'0')}
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">

                {/* ── Calendar ─────────────────────────────────────── */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 16px rgba(27,67,50,0.07)' }}>

                    {/* Month navigation */}
                    <div className="flex items-center justify-between px-5 py-4"
                        style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                        <button onClick={nextMonth}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[#E8F5E9]"
                            style={{ color: '#1B4332' }}>
                            <IcoChevronRight size={16} color="#1B4332" />
                        </button>
                        <h2 className="font-black text-base" style={{ color: '#1C1C1E' }}>
                            {MONTHS[viewMonth-1]} {viewYear.toLocaleString('fa-IR')}
                        </h2>
                        <button onClick={prevMonth}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[#E8F5E9]"
                            style={{ color: '#1B4332' }}>
                            <IcoChevronLeft size={16} color="#1B4332" />
                        </button>
                    </div>

                    <div className="p-4">
                        {/* Week headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {WEEK_DAYS.map(d => (
                                <div key={d} className="text-center text-[11px] font-bold py-1.5"
                                    style={{ color: '#C4B8A8' }}>{d}</div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDay }).map((_,i) => <div key={`e-${i}`} className="h-8" />)}
                            {Array.from({ length: daysInMonth }, (_,i) => i+1).map(day => {
                                const dayEvs  = getEventsForDay(day)
                                const sel     = selectedDay === day
                                const tod     = isToday(day)
                                const hasDone = dayEvs.some(e => e.is_done)
                                const hasPend = dayEvs.some(e => !e.is_done)

                                return (
                                    <button key={day}
                                        onClick={() => { setSelectedDay(day); setShowForm(false) }}
                                        className="relative flex flex-col items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 mx-auto w-full"
                                        style={{
                                            height: 36,
                                            maxWidth: 40,
                                            background: sel ? '#1B4332' : tod ? '#E8F5E9' : 'transparent',
                                            boxShadow: sel ? '0 2px 8px rgba(27,67,50,0.3)' : 'none',
                                        }}>
                                        <span className="text-xs font-bold leading-none"
                                            style={{ color: sel ? 'white' : tod ? '#1B4332' : '#1C1C1E' }}>
                                            {day.toLocaleString('fa-IR')}
                                        </span>
                                        {/* event dots */}
                                        {dayEvs.length > 0 && (
                                            <div className="flex gap-0.5 mt-1">
                                                {hasPend && <div className="w-1 h-1 rounded-full" style={{ background: sel ? 'rgba(255,255,255,0.8)' : dayEvs.find(e=>!e.is_done)?.color ?? '#1B4332' }} />}
                                                {hasDone && <div className="w-1 h-1 rounded-full" style={{ background: sel ? 'rgba(255,255,255,0.5)' : '#C4B8A8' }} />}
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Month mini-stats */}
                    {totalEvents > 0 && (
                        <div className="grid grid-cols-3 divide-x divide-x-reverse"
                            style={{ borderTop: '1px solid #F3EDE3' }}>
                            {[
                                { label: 'رویداد', value: totalEvents },
                                { label: 'انجام شده', value: doneEvents },
                                { label: 'یادآوری', value: smsEvents },
                            ].map(s => (
                                <div key={s.label} className="flex flex-col items-center py-3 gap-0.5">
                                    <span className="text-base font-black" style={{ color: '#1C1C1E' }}>
                                        {s.value.toLocaleString('fa-IR')}
                                    </span>
                                    <span className="text-[11px]" style={{ color: '#8C8C8E' }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Day panel ────────────────────────────────────── */}
                <div className="rounded-2xl"
                    style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 16px rgba(27,67,50,0.07)' }}>

                    {!selectedDay ? (
                        <div className="flex flex-col items-center justify-center py-20 px-6 gap-3 rounded-2xl">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: '#E8F5E9' }}>
                                <IcoCalendar size={26} color="#1B4332" />
                            </div>
                            <p className="text-sm font-semibold" style={{ color: '#1C1C1E' }}>یک روز انتخاب کنید</p>
                            <p className="text-xs text-center" style={{ color: '#8C8C8E' }}>
                                روی هر روز در تقویم کلیک کنید تا رویدادها و برنامه‌هایش را ببینید
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-5 py-4 rounded-t-2xl"
                                style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                                <div>
                                    <h3 className="font-black text-sm" style={{ color: '#1C1C1E' }}>
                                        {selectedDay.toLocaleString('fa-IR')} {MONTHS[viewMonth-1]}
                                    </h3>
                                    <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                                        {selectedEvents.length > 0
                                            ? `${selectedEvents.length.toLocaleString('fa-IR')} رویداد`
                                            : 'بدون رویداد'}
                                    </p>
                                </div>
                                <button onClick={() => setShowForm(v => !v)}
                                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90"
                                    style={{ background: showForm ? '#C62828' : '#1B4332' }}>
                                    {showForm
                                        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> لغو</>
                                        : <><IcoPlus size={12} color="white" /> رویداد جدید</>}
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* ── Add form ── */}
                                {showForm && (
                                    <form onSubmit={createEvent}
                                        className="rounded-2xl p-4 space-y-3.5"
                                        style={{ background: '#FDFBF8', border: '1px solid #EDE6D6' }}>

                                        {/* Title */}
                                        <div>
                                            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>
                                                عنوان <span style={{ color: '#C62828' }}>*</span>
                                            </label>
                                            <input required value={form.title}
                                                onChange={e => setForm({...form, title: e.target.value})}
                                                placeholder="عنوان رویداد را وارد کنید"
                                                className="w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors"
                                                style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                                                onFocus={e => (e.target as HTMLInputElement).style.borderColor='#1B4332'}
                                                onBlur={e  => (e.target as HTMLInputElement).style.borderColor='#EDE6D6'} />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>یادداشت</label>
                                            <textarea value={form.description} rows={2}
                                                onChange={e => setForm({...form, description: e.target.value})}
                                                placeholder="توضیحات (اختیاری)"
                                                className="w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none resize-none transition-colors"
                                                style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                                                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor='#1B4332'}
                                                onBlur={e  => (e.target as HTMLTextAreaElement).style.borderColor='#EDE6D6'} />
                                        </div>

                                        {/* Time + Color */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>ساعت</label>
                                                <input type="time" value={form.event_time}
                                                    onChange={e => setForm({...form, event_time: e.target.value})}
                                                    className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none"
                                                    style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>رنگ</label>
                                                <div className="flex gap-1.5 items-center pt-1 flex-wrap">
                                                    {COLORS.map(c => (
                                                        <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                                                            className="rounded-lg transition-all hover:scale-110"
                                                            style={{
                                                                width: 22, height: 22,
                                                                background: c,
                                                                boxShadow: form.color===c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                                                                transform: form.color===c ? 'scale(1.15)' : 'scale(1)',
                                                            }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* SMS reminder toggle */}
                                        <div className="flex items-center justify-between p-3 rounded-xl"
                                            style={{ background: form.sms_reminder ? '#E8F5E9' : 'white', border: '1px solid #EDE6D6', transition: 'background .2s' }}>
                                            <div className="flex items-center gap-2.5">
                                                <IcoSms size={15} color={form.sms_reminder ? '#1B4332' : '#8C8C8E'} />
                                                <span className="text-sm font-medium" style={{ color: form.sms_reminder ? '#1B4332' : '#5C5C5E' }}>
                                                    یادآوری پیامکی
                                                </span>
                                            </div>
                                            <Checkbox
                                                checked={form.sms_reminder}
                                                onChange={v => setForm({...form, sms_reminder: v})}
                                                color="#1B4332"
                                            />
                                        </div>

                                        {/* Reminder time */}
                                        {form.sms_reminder && (
                                            <div>
                                                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>
                                                    زمان یادآوری
                                                </label>
                                                <Select
                                                    value={form.reminder_minutes}
                                                    onChange={v => setForm({...form, reminder_minutes: v})}
                                                    options={REMINDER_OPTIONS}
                                                />
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <button type="submit" disabled={saving}
                                            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
                                            style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)' }}>
                                            {saving
                                                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> ذخیره...</>
                                                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> ذخیره رویداد</>}
                                        </button>
                                    </form>
                                )}

                                {/* ── Events list ── */}
                                {loading ? (
                                    <div className="space-y-2">
                                        {[1,2].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: '#F3EDE3' }} />)}
                                    </div>
                                ) : selectedEvents.length === 0 && !showForm ? (
                                    <div className="text-center py-10">
                                        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                                            style={{ background: '#F3EDE3' }}>
                                            <IcoCalendar size={22} color="#C4B8A8" />
                                        </div>
                                        <p className="text-sm" style={{ color: '#8C8C8E' }}>
                                            برای این روز رویدادی ندارید
                                        </p>
                                        <button onClick={() => setShowForm(true)}
                                            className="mt-3 text-xs font-bold transition-opacity hover:opacity-70"
                                            style={{ color: '#1B4332' }}>
                                            + اضافه کردن رویداد
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedEvents.map(ev => (
                                            <div key={ev.id}
                                                className="flex items-start gap-3 p-3.5 rounded-xl border transition-all"
                                                style={{
                                                    borderColor: ev.is_done ? '#F3EDE3' : '#EDE6D6',
                                                    background: ev.is_done ? '#FDFBF8' : 'white',
                                                    borderRight: `3px solid ${ev.color}`,
                                                }}>
                                                <div className="mt-0.5">
                                                    <Checkbox
                                                        checked={ev.is_done}
                                                        onChange={() => toggleDone(ev.id, ev.is_done)}
                                                        color={ev.color}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold leading-snug ${ev.is_done ? 'line-through' : ''}`}
                                                        style={{ color: ev.is_done ? '#8C8C8E' : '#1C1C1E' }}>
                                                        {ev.title}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                        {ev.event_time && (
                                                            <span className="flex items-center gap-1 text-xs" style={{ color: '#8C8C8E' }}>
                                                                <IcoClock size={11} color="#C4B8A8" />
                                                                {ev.event_time.slice(0,5)}
                                                            </span>
                                                        )}
                                                        {ev.sms_reminder && (
                                                            <span className="flex items-center gap-1 text-xs" style={{ color: '#1B4332' }}>
                                                                <IcoSms size={11} color="#1B4332" />
                                                                یادآوری
                                                            </span>
                                                        )}
                                                    </div>

                                                    {ev.description && (
                                                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#5C5C5E' }}>
                                                            {ev.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <button onClick={() => setDeleteTarget(ev)}
                                                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 mt-0.5"
                                                    style={{ color: '#C62828' }}>
                                                    <IcoTrash size={13} color="#C62828" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

            </div>

            {/* Delete confirmation modal */}
            {deleteTarget && (
                <DeleteModal
                    event={deleteTarget}
                    onConfirm={() => deleteEvent(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}
