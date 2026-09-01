'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
    const { user, fetchMe } = useAuthStore()
    const [form, setForm] = useState({ fullName: '', email: '' })
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (user) setForm({ fullName: user.fullName ?? '', email: user.email ?? '' })
    }, [user])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.patch('/users/profile', {
                fullName: form.fullName.trim() || null,
                email: form.email.trim() || null,
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
            const formData = new FormData()
            formData.append('file', file)
            await api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            await fetchMe()
            toast.success('عکس پروفایل بروزرسانی شد')
        } catch {
            toast.error('خطا در آپلود عکس')
        } finally {
            setUploading(false)
        }
    }

    const initials = (user?.fullName ?? user?.phone ?? '?').charAt(0).toUpperCase()

    return (
        <div style={{ maxWidth: '640px' }}>
            <h1 className="text-xl font-black mb-6" style={{ color: '#1C1C1E' }}>پروفایل من</h1>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6 p-5 rounded-2xl border" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                <div className="relative">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="آواتار"
                            className="w-20 h-20 rounded-full object-cover border-2"
                            style={{ borderColor: '#EDE6D6' }} />
                    ) : (
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white"
                            style={{ background: '#1B4332' }}>
                            {initials}
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
                <div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                        className="px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
                        style={{ background: '#1B4332' }}>
                        {uploading ? 'در حال آپلود...' : 'تغییر عکس'}
                    </button>
                    <p className="text-xs mt-1" style={{ color: '#8C8C8E' }}>JPG، PNG — حداکثر ۵MB</p>
                </div>
            </div>

            {/* Info */}
            <form onSubmit={handleSave} className="rounded-2xl border p-6 space-y-4 mb-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                <h2 className="font-bold" style={{ color: '#1C1C1E' }}>اطلاعات شخصی</h2>

                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#5C5C5E' }}>شماره موبایل</label>
                    <input value={user?.phone ?? ''} readOnly dir="ltr"
                        className="w-full px-4 py-2.5 rounded-xl text-sm border cursor-not-allowed"
                        style={{ borderColor: '#EDE6D6', background: '#FAF7F2', color: '#8C8C8E' }} />
                    <p className="text-xs mt-1" style={{ color: '#8C8C8E' }}>شماره موبایل قابل تغییر نیست</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#5C5C5E' }}>نام و نام خانوادگی</label>
                    <input value={form.fullName}
                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                        placeholder="نام خود را وارد کنید"
                        className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors"
                        style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#1B4332'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE6D6'}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#5C5C5E' }}>ایمیل</label>
                    <input value={form.email} type="email" dir="ltr"
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors"
                        style={{ borderColor: '#EDE6D6', background: 'white', color: '#1C1C1E' }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#1B4332'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE6D6'}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#5C5C5E' }}>سطح اشتراک</label>
                    <div className="flex items-center gap-3">
                        <span className="text-sm px-3 py-1.5 rounded-xl font-semibold"
                            style={{ background: user?.subscriptionLevel === 'FREE' ? '#F3EDE3' : '#E8F5E9', color: user?.subscriptionLevel === 'FREE' ? '#8C8C8E' : '#1B4332' }}>
                            {user?.subscriptionLevel === 'FREE' ? 'رایگان' : user?.subscriptionLevel}
                        </span>
                        {user?.subscriptionLevel === 'FREE' && (
                            <a href="/pricing" className="text-xs font-bold hover:opacity-70 transition-opacity" style={{ color: '#C9A84C' }}>
                                ارتقا به پریمیوم ←
                            </a>
                        )}
                    </div>
                </div>

                <button type="submit" disabled={saving}
                    className="w-full py-3 rounded-xl text-white font-bold transition-opacity disabled:opacity-50 hover:opacity-90"
                    style={{ background: '#1B4332' }}>
                    {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
            </form>

            {/* Account info */}
            <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                <h2 className="font-bold mb-4" style={{ color: '#1C1C1E' }}>اطلاعات حساب</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span style={{ color: '#8C8C8E' }}>شناسه کاربری</span>
                        <span className="font-mono text-xs" style={{ color: '#5C5C5E' }}>{user?.id?.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                        <span style={{ color: '#8C8C8E' }}>وضعیت حساب</span>
                        <span className="font-semibold" style={{ color: '#1B4332' }}>
                            {user?.isVerified ? '✅ تأیید شده' : '⏳ در انتظار تأیید'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span style={{ color: '#8C8C8E' }}>نقش</span>
                        <span className="font-semibold" style={{ color: '#1C1C1E' }}>{user?.role}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
