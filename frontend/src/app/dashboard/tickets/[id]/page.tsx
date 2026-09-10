'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
    id: string
    content: string
    imageUrl?: string | null
    senderId: string
    isAdmin: boolean
    isAdminReply?: boolean
    createdAt: string
}

interface Ticket {
    id: string
    subject: string
    status: string
    priority: string
    createdAt: string
    updatedAt: string
    messages: Message[]
    _count?: { messages: number }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    OPEN:             { label: 'باز',           color: '#065F46', bg: '#D1FAE5', dot: '#059669' },
    IN_PROGRESS:      { label: 'در بررسی',     color: '#1565C0', bg: '#DBEAFE', dot: '#3B82F6' },
    WAITING_FOR_USER: { label: 'منتظر پاسخ',   color: '#854D0E', bg: '#FEF9C3', dot: '#CA8A04' },
    RESOLVED:         { label: 'حل شده',        color: '#065F46', bg: '#ECFDF5', dot: '#10B981' },
    CLOSED:           { label: 'بسته',          color: '#5C5C5E', bg: '#F3EDE3', dot: '#C4B8A8' },
}

const PRIORITY_CFG: Record<string, { label: string; color: string; bg: string }> = {
    LOW:    { label: 'کم',    color: '#5C5C5E', bg: '#F3EDE3' },
    MEDIUM: { label: 'متوسط', color: '#1565C0', bg: '#DBEAFE' },
    HIGH:   { label: 'زیاد', color: '#854D0E', bg: '#FEF9C3' },
    URGENT: { label: 'فوری', color: '#991B1B', bg: '#FEE2E2' },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoSend({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
}
function IcoImage({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
}
function IcoX({ size = 12, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function IcoBack({ size = 14, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
}
function IcoTicket({ size = 15, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>
}
function IcoCalendar({ size = 13, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}
function IcoMessage({ size = 13, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function IcoLock({ size = 13, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TicketDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuthStore()
    const [ticket,  setTicket]  = useState<Ticket | null>(null)
    const [loading, setLoading] = useState(true)
    const [reply,   setReply]   = useState('')
    const [sending, setSending] = useState(false)
    const [closing, setClosing] = useState(false)
    const [imgFile,  setImgFile]  = useState<File | null>(null)
    const [imgPrev,  setImgPrev]  = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const fileRef   = useRef<HTMLInputElement>(null)

    useEffect(() => {
        api.get(`/tickets/${id}`)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(r => setTicket((r.data as any)?.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [ticket?.messages])

    const sendReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reply.trim() && !imgFile) return
        setSending(true)

        let imageUrl: string | undefined
        if (imgFile) {
            setUploading(true)
            try {
                const fd = new FormData()
                fd.append('file', imgFile)
                const res = await api.post<{ data: { avatarUrl?: string } }>('/users/avatar', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                imageUrl = res.data?.data?.avatarUrl
            } catch { /* ignore */ }
            finally { setUploading(false) }
        }

        try {
            const res = await api.post(`/tickets/${id}/messages`, {
                content: reply.trim() || '📎 تصویر پیوست شد',
                ...(imageUrl ? { imageUrl } : {}),
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (res.data as any)?.data
            if (msg && ticket) setTicket({ ...ticket, messages: [...ticket.messages, msg] })
            setReply('')
            setImgFile(null); setImgPrev(null)
            if (fileRef.current) fileRef.current.value = ''
        } catch { }
        finally { setSending(false) }
    }

    const closeTicket = async () => {
        if (!confirm('تیکت بسته شود؟')) return
        setClosing(true)
        try {
            await api.patch(`/tickets/${id}/close`)
            if (ticket) setTicket({ ...ticket, status: 'CLOSED' })
        } catch { }
        finally { setClosing(false) }
    }

    // ── Loading ──
    if (loading) return (
        <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />)}
        </div>
    )

    if (!ticket) return (
        <div className="text-center py-20">
            <p className="mb-3" style={{ color: '#8C8C8E' }}>تیکت یافت نشد</p>
            <Link href="/dashboard/tickets" className="text-sm font-bold" style={{ color: '#1B4332' }}>بازگشت به تیکت‌ها</Link>
        </div>
    )

    const s        = STATUS_CFG[ticket.status]   ?? { label: ticket.status, color: '#8C8C8E', bg: '#F3EDE3', dot: '#C4B8A8' }
    const p        = PRIORITY_CFG[ticket.priority] ?? { label: ticket.priority, color: '#8C8C8E', bg: '#F3EDE3' }
    const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED'
    const msgCount = ticket.messages.length

    return (
        <div className="flex gap-5 h-[calc(100vh-7rem)] items-start">

            {/* ── Chat area ───────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col h-full rounded-2xl overflow-hidden"
                style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 16px rgba(27,67,50,0.07)' }}>

                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 shrink-0"
                    style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                    <Link href="/dashboard/tickets"
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors hover:bg-[#E8F5E9]"
                        style={{ background: '#F3EDE3', color: '#1B4332' }}>
                        <IcoBack size={14} color="#1B4332" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-black text-sm truncate" style={{ color: '#1C1C1E' }}>
                            {ticket.subject}
                        </h1>
                        <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                            {msgCount.toLocaleString('fa-IR')} پیام
                        </p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: s.bg, color: s.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                        {s.label}
                    </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" dir="ltr">
                    {ticket.messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#E8F5E9' }}>
                                <IcoMessage size={24} color="#1B4332" />
                            </div>
                            <p className="text-sm" style={{ color: '#8C8C8E' }}>هنوز پیامی ارسال نشده</p>
                        </div>
                    ) : (
                        ticket.messages.map((msg, idx) => {
                            const isMe    = !msg.isAdmin && !msg.isAdminReply
                            const prevMsg = idx > 0 ? ticket.messages[idx - 1] : null
                            const showAvatar = !prevMsg || (prevMsg.isAdmin !== msg.isAdmin)
                            const initial = isMe ? (user?.fullName ?? user?.phone ?? 'ک').charAt(0).toUpperCase() : 'پ'

                            return (
                                <div key={msg.id}
                                    className="flex gap-2.5"
                                    style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                    {/* Avatar */}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${!showAvatar ? 'invisible' : ''}`}
                                        style={{ background: isMe ? '#1B4332' : '#DBEAFE', color: isMe ? 'white' : '#1565C0' }}>
                                        {initial}
                                    </div>

                                    {/* Bubble */}
                                    <div className="flex flex-col gap-1 max-w-[72%]"
                                        style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                        {showAvatar && (
                                            <span className="text-xs px-1" dir="rtl" style={{ color: '#8C8C8E' }}>
                                                {isMe ? (user?.fullName ?? 'شما') : 'پشتیبانی'}
                                            </span>
                                        )}
                                        <div className="px-4 py-2.5 text-sm leading-7 break-words"
                                            dir="rtl"
                                            style={{
                                                background: isMe ? '#1B4332' : '#F3EDE3',
                                                color:      isMe ? 'white'    : '#1C1C1E',
                                                borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                            }}>
                                            {msg.content}
                                        </div>

                                        {/* Attached image */}
                                        {msg.imageUrl && (
                                            <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer"
                                                className="block overflow-hidden rounded-xl mt-1"
                                                style={{ maxWidth: 220, border: '1px solid rgba(0,0,0,0.08)' }}>
                                                <img src={msg.imageUrl} alt="پیوست" className="w-full object-cover" style={{ maxHeight: 160 }} />
                                            </a>
                                        )}

                                        <span className="text-[11px] px-1" style={{ color: '#C4B8A8' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Reply area */}
                {isClosed ? (
                    <div className="px-5 py-4 shrink-0 flex items-center justify-center gap-2 text-sm"
                        style={{ borderTop: '1px solid #F3EDE3', background: '#FDFBF8', color: '#8C8C8E' }}>
                        <IcoLock size={14} color="#C4B8A8" />
                        این تیکت {s.label.toLowerCase()} است
                    </div>
                ) : (
                    <form onSubmit={sendReply}
                        className="px-4 py-3 shrink-0 space-y-2"
                        style={{ borderTop: '1px solid #F3EDE3', background: 'white' }}>

                        {/* Image preview */}
                        {imgPrev && (
                            <div className="relative inline-block rounded-xl overflow-hidden mr-1"
                                style={{ border: '1px solid #EDE6D6' }}>
                                <img src={imgPrev} alt="" className="h-16 w-auto object-cover" />
                                <button type="button"
                                    onClick={() => { setImgFile(null); setImgPrev(null); if (fileRef.current) fileRef.current.value = '' }}
                                    className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(0,0,0,0.5)' }}>
                                    <IcoX size={10} color="white" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-end gap-2">
                            {/* Image button */}
                            <button type="button" onClick={() => fileRef.current?.click()}
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors hover:bg-[#E8F5E9]"
                                style={{ background: '#F3EDE3', color: '#1B4332' }}>
                                <IcoImage size={16} color="#1B4332" />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                onChange={e => {
                                    const f = e.target.files?.[0]
                                    if (!f) return
                                    setImgFile(f)
                                    const r = new FileReader()
                                    r.onload = ev => setImgPrev(ev.target?.result as string)
                                    r.readAsDataURL(f)
                                }} />

                            {/* Text input */}
                            <textarea value={reply}
                                onChange={e => setReply(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendReply(e as unknown as React.FormEvent) }
                                }}
                                placeholder="پیام خود را بنویسید... (Enter برای ارسال)"
                                rows={1}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none resize-none transition-colors"
                                style={{
                                    borderColor: '#EDE6D6', background: '#FAF7F2', color: '#1C1C1E',
                                    minHeight: 40, maxHeight: 120,
                                }}
                                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#1B4332'}
                                onBlur={e  => (e.target as HTMLTextAreaElement).style.borderColor = '#EDE6D6'}
                                disabled={sending || uploading} />

                            {/* Send button */}
                            <button type="submit"
                                disabled={sending || uploading || (!reply.trim() && !imgFile)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                                style={{ background: '#1B4332' }}>
                                {sending || uploading
                                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <IcoSend size={15} color="white" />}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="w-64 shrink-0 space-y-4" style={{ top: 0 }}>

                {/* Ticket info card */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 12px rgba(27,67,50,0.06)' }}>

                    <div className="px-4 py-3 flex items-center gap-2.5"
                        style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#E8F5E9' }}>
                            <IcoTicket size={14} color="#1B4332" />
                        </div>
                        <span className="text-xs font-black" style={{ color: '#1C1C1E' }}>اطلاعات تیکت</span>
                    </div>

                    <div className="p-4 space-y-3">

                        {/* Status */}
                        <div>
                            <p className="text-[11px] font-semibold mb-1.5" style={{ color: '#C4B8A8' }}>وضعیت</p>
                            <span className="flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1.5 rounded-full"
                                style={{ background: s.bg, color: s.color }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                                {s.label}
                            </span>
                        </div>

                        <div className="h-px" style={{ background: '#F3EDE3' }} />

                        {/* Priority */}
                        <div>
                            <p className="text-[11px] font-semibold mb-1.5" style={{ color: '#C4B8A8' }}>اولویت</p>
                            <span className="text-xs font-bold px-2.5 py-1.5 rounded-full"
                                style={{ background: p.bg, color: p.color }}>
                                {p.label}
                            </span>
                        </div>

                        <div className="h-px" style={{ background: '#F3EDE3' }} />

                        {/* Created */}
                        <div>
                            <p className="text-[11px] font-semibold mb-1" style={{ color: '#C4B8A8' }}>تاریخ ثبت</p>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#5C5C5E' }}>
                                <IcoCalendar size={12} color="#C4B8A8" />
                                {new Date(ticket.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        <div className="h-px" style={{ background: '#F3EDE3' }} />

                        {/* Updated */}
                        <div>
                            <p className="text-[11px] font-semibold mb-1" style={{ color: '#C4B8A8' }}>آخرین بروزرسانی</p>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#5C5C5E' }}>
                                <IcoCalendar size={12} color="#C4B8A8" />
                                {new Date(ticket.updatedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        <div className="h-px" style={{ background: '#F3EDE3' }} />

                        {/* Messages count */}
                        <div>
                            <p className="text-[11px] font-semibold mb-1" style={{ color: '#C4B8A8' }}>تعداد پیام</p>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#5C5C5E' }}>
                                <IcoMessage size={12} color="#C4B8A8" />
                                {msgCount.toLocaleString('fa-IR')} پیام
                            </div>
                        </div>

                    </div>
                </div>

                {/* Actions card */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 12px rgba(27,67,50,0.06)' }}>

                    <div className="p-4 space-y-2">
                        {!isClosed && (
                            <button onClick={closeTicket} disabled={closing}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-colors hover:bg-[#FEE2E2] disabled:opacity-50"
                                style={{ borderColor: '#FECACA', color: '#991B1B' }}>
                                <IcoLock size={13} color="#991B1B" />
                                {closing ? 'در حال بستن...' : 'بستن تیکت'}
                            </button>
                        )}
                        <Link href="/dashboard/tickets"
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-colors hover:bg-[#F3EDE3]"
                            style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>
                            <IcoBack size={12} color="#5C5C5E" />
                            بازگشت به تیکت‌ها
                        </Link>
                    </div>
                </div>

                {/* Subject card */}
                <div className="rounded-2xl p-4"
                    style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 12px rgba(27,67,50,0.06)' }}>
                    <p className="text-[11px] font-semibold mb-1.5" style={{ color: '#C4B8A8' }}>موضوع</p>
                    <p className="text-sm font-semibold leading-relaxed" style={{ color: '#1C1C1E' }}>
                        {ticket.subject}
                    </p>
                </div>

            </aside>
        </div>
    )
}
