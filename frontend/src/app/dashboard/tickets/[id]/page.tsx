'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

interface Message { id: string; content: string; senderId: string; isAdminReply: boolean; createdAt: string }
interface Ticket { id: string; subject: string; status: string; priority: string; createdAt: string; messages: Message[] }

const STATUS: Record<string, { l: string; c: string; bg: string }> = {
    OPEN: { l: 'باز', c: '#1B4332', bg: '#E8F5E9' },
    IN_PROGRESS: { l: 'در بررسی', c: '#1565C0', bg: '#E3F2FD' },
    WAITING_FOR_USER: { l: 'منتظر پاسخ', c: '#C9A84C', bg: '#FFF8E1' },
    RESOLVED: { l: 'حل شده', c: '#2D6A4F', bg: '#F1F8E9' },
    CLOSED: { l: 'بسته', c: '#8C8C8E', bg: '#F3EDE3' },
}

export default function TicketDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuthStore()
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [loading, setLoading] = useState(true)
    const [reply, setReply] = useState('')
    const [sending, setSending] = useState(false)
    const [closing, setClosing] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        api.get(`/tickets/${id}`)
            .then(r => setTicket((r.data as any)?.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [ticket?.messages])

    const sendReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reply.trim()) return
        setSending(true)
        try {
            const res = await api.post(`/tickets/${id}/messages`, { content: reply.trim() })
            const msg = (res.data as any)?.data
            if (msg && ticket) setTicket({ ...ticket, messages: [...ticket.messages, msg] })
            setReply('')
        } catch { }
        finally { setSending(false) }
    }

    const closeTicket = async () => {
        setClosing(true)
        try {
            await api.patch(`/tickets/${id}/close`)
            if (ticket) setTicket({ ...ticket, status: 'CLOSED' })
        } catch { }
        finally { setClosing(false) }
    }

    if (loading) return (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#F3EDE3' }} />)}</div>
    )

    if (!ticket) return (
        <div className="text-center py-20">
            <p style={{ color: '#8C8C8E' }}>تیکت یافت نشد</p>
            <Link href="/dashboard/tickets" className="text-sm font-semibold mt-3 inline-block" style={{ color: '#1B4332' }}>بازگشت</Link>
        </div>
    )

    const s = STATUS[ticket.status] ?? { l: ticket.status, c: '#8C8C8E', bg: '#F3EDE3' }
    const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED'

    return (
        <div style={{ maxWidth: '720px' }}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard/tickets"
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                    style={{ background: '#F3EDE3', color: '#1B4332' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="font-black text-base truncate" style={{ color: '#1C1C1E' }}>{ticket.subject}</h1>
                    <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>
                        {new Date(ticket.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.c }}>{s.l}</span>
                    {!isClosed && (
                        <button onClick={closeTicket} disabled={closing}
                            className="text-xs px-3 py-1.5 rounded-xl font-semibold border disabled:opacity-50"
                            style={{ borderColor: '#EDE6D6', color: '#8C8C8E' }}>
                            {closing ? '...' : 'بستن'}
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                    {ticket.messages.length === 0 ? (
                        <p className="text-center text-sm py-8" style={{ color: '#8C8C8E' }}>پیامی ندارید</p>
                    ) : (
                        ticket.messages.map(msg => {
                            const isMe = !msg.isAdminReply
                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                                        style={{ background: isMe ? '#1B4332' : '#E3F2FD', color: isMe ? 'white' : '#1565C0' }}>
                                        {isMe ? (user?.fullName ?? 'ک').charAt(0) : 'پ'}
                                    </div>
                                    <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                                            style={{
                                                background: isMe ? '#1B4332' : '#F3EDE3',
                                                color: isMe ? 'white' : '#1C1C1E',
                                                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                                            }}>
                                            {msg.content}
                                        </div>
                                        <p className="text-[11px] mt-1 px-1" style={{ color: '#8C8C8E' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                            {msg.isAdminReply && ' · پشتیبانی'}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Reply form */}
            {!isClosed ? (
                <form onSubmit={sendReply} className="flex gap-3">
                    <input value={reply} onChange={e => setReply(e.target.value)}
                        placeholder="پیام خود را بنویسید..."
                        className="flex-1 px-4 py-3 rounded-xl text-sm border focus:outline-none"
                        style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                        disabled={sending} />
                    <button type="submit" disabled={sending || !reply.trim()}
                        className="px-5 py-3 rounded-xl font-bold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                        style={{ background: '#1B4332' }}>
                        {sending ? '...' : 'ارسال'}
                    </button>
                </form>
            ) : (
                <div className="text-center p-4 rounded-2xl border text-sm" style={{ background: '#F3EDE3', borderColor: '#EDE6D6', color: '#8C8C8E' }}>
                    این تیکت {s.l.toLowerCase()} است
                </div>
            )}
        </div>
    )
}
