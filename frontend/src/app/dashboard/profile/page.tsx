'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

const ROLE_MAP: Record<string, { label: string; color: string; bg: string }> = {
    USER:          { label: 'کاربر عادی',    color: '#1B4332', bg: '#E8F5E9' },
    ADMIN:         { label: 'مدیر کل',       color: '#7B1FA2', bg: '#F3E5F5' },
    PSYCHOLOGIST:  { label: 'روانشناس',      color: '#1565C0', bg: '#E3F2FD' },
    MODERATOR:     { label: 'ناظر',          color: '#C9A84C', bg: '#FFF8E1' },
}

const SUB_MAP: Record<string, { label: string; color: string; bg: string }> = {
    FREE:     { label: 'رایگان',   color: '#8C8C8E', bg: '#F3EDE3' },
    PREMIUM:  { label: 'پریمیوم', color: '#C9A84C', bg: '#FFF8E1' },
    PRO:      { label: 'پرو',      color: '#1565C0', bg: '#E3F2FD' },
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid #F3EDE3' }}>
            <span className="text-sm" style={{ color: '#8C8C8E' }}>{label}</span>
            <div>{children}</div>
        </div>
    )
}

export default function ProfilePage() {
    const { user, fetchMe } = useAuthStore()
    const [form, setForm] = useState({ fullName: '', email: '', bio: '' })
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (user) setForm({
            fullName: user.fullName ?? '',
            email: user.email ?? '',
            bio: (user as { bio?: string }).bio ?? '',
        })
    }, [user])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.patch('/users/profile', {
                fullName: form.fullName.trim() || null,
                email: form.email.trim() || null,
                bio: form.bio.trim() || null,
            })
            await fetchMe()
            toast.success('پروفایل با موفقیت ذخیره شد')
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ذخیره‌سازی')
        } finally {
            setSaving(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { toast.error('حجم فایل نباید بیشتر از ۵ مگابایت باشد'); return }
        setUploading(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            await api.post('/users/avatar', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            await fetchMe()
            toast.success('عکس پروفایل بروزرسانی شد')
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در آپلود عکس')
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    const initials = (user?.fullName ?? user?.phone ?? '?').charAt(0).toUpperCase()
    const role     = ROLE_MAP[user?.role ?? ''] ?? { label: user?.role ?? '—', color: '#8C8C8E', bg: '#F3EDE3' }
    const sub      = SUB_MAP[user?.subscriptionLevel ?? ''] ?? { label: user?.subscriptionLevel ?? '—', color: '#8C8C8E', bg: '#F3EDE3' }

    return (
        <div className="max-w-2xl space-y-5">

            {/* ── Hero card ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 16px rgba(27,67,50,0.07)' }}>
                {/* Banner gradient */}
                <div className="h-28 relative" style={{ background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 60%,#52B788 100%)' }}>
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '20px 20px' }} />
                </div>

                {/* Avatar + info */}
                <div className="px-6 pb-6">
                    <div className="flex items-end justify-between -mt-10 mb-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black text-white"
                                style={{ background: user?.avatarUrl ? 'transparent' : '#1B4332', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                {user?.avatarUrl
                                    ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    : initials}
                                {uploading && (
                                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button onClick={() => fileRef.current?.click()} disabled={uploading}
                                title="تغییر عکس"
                                className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                                style={{ background: '#1B4332', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 pb-1">
                            <span className="text-xs font-bold px-3 py-1 rounded-full"
                                style={{ background: role.bg, color: role.color }}>
                                {role.label}
                            </span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full"
                                style={{ background: sub.bg, color: sub.color }}>
                                {sub.label}
                            </span>
                        </div>
                    </div>

                    <h2 className="text-lg font-black" style={{ color: '#1C1C1E' }}>
                        {user?.fullName ?? 'بدون نام'}
                    </h2>
                    <p className="text-sm mt-0.5" dir="ltr" style={{ color: '#8C8C8E' }}>
                        {user?.phone}
                    </p>
                </div>
            </div>

            {/* ── Edit form ── */}
            <form onSubmit={handleSave} className="rounded-2xl overflow-hidden"
                style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 16px rgba(27,67,50,0.07)' }}>

                <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                    <h2 className="font-black text-[15px]" style={{ color: '#1C1C1E' }}>اطلاعات شخصی</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>این اطلاعات برای دیگران نمایش داده می‌شود</p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Phone (readonly) */}
                    <div>
                        <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: '#5C5C5E' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                            شماره موبایل
                        </label>
                        <div className="relative">
                            <input value={user?.phone ?? ''} readOnly dir="ltr"
                                className="w-full px-4 py-2.5 rounded-xl text-sm border"
                                style={{ borderColor: '#EDE6D6', background: '#F9F6F1', color: '#8C8C8E', cursor: 'not-allowed' }} />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4B8A8" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Full name */}
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>نام و نام خانوادگی</label>
                        <input value={form.fullName}
                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                            placeholder="نام خود را وارد کنید"
                            className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors"
                            style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#1B4332'}
                            onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE6D6'} />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>ایمیل</label>
                        <input value={form.email} type="email" dir="ltr"
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="email@example.com"
                            className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors"
                            style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#1B4332'}
                            onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE6D6'} />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5C5C5E' }}>بیوگرافی کوتاه</label>
                        <textarea value={form.bio} rows={3}
                            onChange={e => setForm({ ...form, bio: e.target.value })}
                            placeholder="چند جمله درباره خودتان بنویسید..."
                            className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors resize-none"
                            style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                            onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#1B4332'}
                            onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#EDE6D6'} />
                    </div>

                    <button type="submit" disabled={saving}
                        className="w-full py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)' }}>
                        {saving
                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />در حال ذخیره...</>
                            : <>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ذخیره تغییرات
                              </>}
                    </button>
                </div>
            </form>

            {/* ── Account info ── */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'white', border: '1px solid #EDE6D6', boxShadow: '0 2px 16px rgba(27,67,50,0.07)' }}>

                <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                    <h2 className="font-black text-[15px]" style={{ color: '#1C1C1E' }}>اطلاعات حساب</h2>
                </div>

                <div className="px-6 pb-2">
                    <InfoRow label="شناسه کاربری">
                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ background: '#F3EDE3', color: '#5C5C5E' }}>
                            {user?.id?.slice(0, 8)}...
                        </span>
                    </InfoRow>

                    <InfoRow label="وضعیت حساب">
                        <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: user?.isVerified ? '#065F46' : '#C9A84C' }}>
                            <span className="w-2 h-2 rounded-full" style={{ background: user?.isVerified ? '#059669' : '#C9A84C' }} />
                            {user?.isVerified ? 'تأیید شده' : 'در انتظار تأیید'}
                        </span>
                    </InfoRow>

                    <InfoRow label="نقش کاربری">
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: role.bg, color: role.color }}>
                            {role.label}
                        </span>
                    </InfoRow>

                    <InfoRow label="سطح اشتراک">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: sub.bg, color: sub.color }}>
                                {sub.label}
                            </span>
                            {user?.subscriptionLevel === 'FREE' && (
                                <a href="/pricing" className="text-xs font-bold transition-opacity hover:opacity-70" style={{ color: '#C9A84C' }}>
                                    ارتقا ←
                                </a>
                            )}
                        </div>
                    </InfoRow>

                    {/* last row — no border */}
                    <div className="flex items-center justify-between py-3.5">
                        <span className="text-sm" style={{ color: '#8C8C8E' }}>شماره موبایل</span>
                        <span className="text-sm font-mono font-semibold" dir="ltr" style={{ color: '#1C1C1E' }}>{user?.phone}</span>
                    </div>
                </div>
            </div>

            {/* ── Danger zone ── */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'white', border: '1px solid #FECACA', boxShadow: '0 2px 16px rgba(27,67,50,0.04)' }}>
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-sm" style={{ color: '#C62828' }}>ناحیه خطر</h3>
                        <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>این عملیات‌ها قابل بازگشت نیستند</p>
                    </div>
                    <button className="text-xs font-bold px-4 py-2 rounded-xl border transition-colors hover:bg-red-50"
                        style={{ borderColor: '#FECACA', color: '#C62828' }}>
                        حذف حساب
                    </button>
                </div>
            </div>

        </div>
    )
}
