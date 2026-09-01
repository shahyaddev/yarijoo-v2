'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

interface PsychologistUser {
    id: string
    fullName: string | null
    phone: string
    email: string | null
    avatarUrl: string | null
    createdAt: string
}

interface PsychologistProfile {
    id: string
    userId: string
    bio: string | null
    specialty: string[]
    licenseNo: string | null
    hourlyRate: number | null
    isVerified: boolean
    isAvailable: boolean
    rating: number | null
    reviewCount: number
    user: PsychologistUser
}

interface ApiResponse { items: PsychologistProfile[]; total: number }

type FilterType = 'all' | 'verified' | 'unverified'

export default function AdminPsychologistsPage() {
    const [profiles, setProfiles] = useState<PsychologistProfile[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [page, setPage] = useState(1)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [selectedProfile, setSelectedProfile] = useState<PsychologistProfile | null>(null)

    const fetchProfiles = useCallback(async () => {
        setLoading(true)
        try {
            const params: Record<string, string | number> = { page, limit: 20 }
            if (filter === 'verified') params.verified = 'true'
            if (filter === 'unverified') params.verified = 'false'

            const res = await api.get<ApiResponse>('/admin/psychologists', { params })
            const data = (res.data as { data?: ApiResponse }).data ?? res.data as unknown as ApiResponse
            setProfiles(data.items ?? [])
            setTotal(data.total ?? 0)
        } catch { setProfiles([]) }
        finally { setLoading(false) }
    }, [page, filter])

    useEffect(() => { void fetchProfiles() }, [fetchProfiles])

    const handleVerify = async (profileId: string, isVerified: boolean) => {
        setProcessingId(profileId)
        try {
            await api.patch(`/admin/psychologists/${profileId}/verify`, { isVerified })
            setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isVerified } : p))
            if (selectedProfile?.id === profileId) {
                setSelectedProfile(prev => prev ? { ...prev, isVerified } : null)
            }
        } catch { /* ignore */ }
        finally { setProcessingId(null) }
    }

    const totalPages = Math.ceil(total / 20)
    const pendingCount = profiles.filter(p => !p.isVerified).length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">مدیریت روانشناسان</h1>
                    <p className="text-xs text-gray-400 mt-1">{total} روانشناس{pendingCount > 0 && ` · ${pendingCount} در انتظار تأیید`}</p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {([['all', 'همه'], ['unverified', 'در انتظار تأیید'], ['verified', 'تأییدشده']] as [FilterType, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => { setFilter(val); setPage(1) }}
                        className={['px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                            filter === val ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'].join(' ')}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="flex gap-6">
                {/* List */}
                <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    {loading ? (
                        <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                                    <th className="text-right px-5 py-3">روانشناس</th>
                                    <th className="text-right px-5 py-3">تخصص</th>
                                    <th className="text-right px-5 py-3">نرخ (ت)</th>
                                    <th className="text-right px-5 py-3">امتیاز</th>
                                    <th className="text-right px-5 py-3">وضعیت</th>
                                    <th className="text-right px-5 py-3">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center text-gray-500 py-12">روانشناسی یافت نشد</td></tr>
                                ) : profiles.map((profile) => (
                                    <tr key={profile.id}
                                        onClick={() => setSelectedProfile(profile)}
                                        className={['border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer',
                                            selectedProfile?.id === profile.id ? 'bg-gray-800/50' : ''].join(' ')}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-300 flex-shrink-0">
                                                    {(profile.user.fullName ?? '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-gray-200 font-medium text-sm">{profile.user.fullName ?? '—'}</div>
                                                    <div className="text-xs text-gray-500">{profile.user.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 text-xs max-w-32">
                                            <div className="truncate">{profile.specialty.join('، ') || '—'}</div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-300 text-xs">
                                            {profile.hourlyRate ? profile.hourlyRate.toLocaleString('fa-IR') : '—'}
                                        </td>
                                        <td className="px-5 py-3">
                                            {profile.rating ? (
                                                <span className="text-yellow-400 text-xs">⭐ {profile.rating}</span>
                                            ) : <span className="text-gray-600 text-xs">—</span>}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={['text-xs font-semibold px-2 py-1 rounded-full',
                                                profile.isVerified ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'].join(' ')}>
                                                {profile.isVerified ? '✓ تأییدشده' : 'در انتظار'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {processingId === profile.id ? (
                                                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                            ) : profile.isVerified ? (
                                                <button onClick={(e) => { e.stopPropagation(); handleVerify(profile.id, false) }}
                                                    className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                                    لغو تأیید
                                                </button>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); handleVerify(profile.id, true) }}
                                                    className="text-xs text-green-400 hover:text-green-300 font-semibold transition-colors">
                                                    تأیید کردن
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Detail panel */}
                {selectedProfile && (
                    <div className="w-72 flex-shrink-0 bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4 self-start sticky top-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white text-sm">جزئیات</h3>
                            <button onClick={() => setSelectedProfile(null)} className="text-gray-500 hover:text-gray-300 text-lg leading-none">×</button>
                        </div>

                        <div className="text-center py-3">
                            <div className="w-16 h-16 rounded-full bg-primary-900 flex items-center justify-center text-2xl font-bold text-primary-300 mx-auto mb-2">
                                {(selectedProfile.user.fullName ?? '?').charAt(0)}
                            </div>
                            <p className="font-bold text-white">{selectedProfile.user.fullName ?? '—'}</p>
                            <p className="text-xs text-gray-400 mt-1">{selectedProfile.user.phone}</p>
                            {selectedProfile.user.email && <p className="text-xs text-gray-500">{selectedProfile.user.email}</p>}
                        </div>

                        <div className="space-y-2 text-sm">
                            {selectedProfile.licenseNo && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">شماره پروانه</span>
                                    <span className="text-gray-200 font-mono">{selectedProfile.licenseNo}</span>
                                </div>
                            )}
                            {selectedProfile.hourlyRate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">نرخ ساعتی</span>
                                    <span className="text-gray-200">{selectedProfile.hourlyRate.toLocaleString('fa-IR')} ت</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-400">نظرات</span>
                                <span className="text-gray-200">{selectedProfile.reviewCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">پذیرش بیمار</span>
                                <span className={selectedProfile.isAvailable ? 'text-green-400' : 'text-gray-500'}>
                                    {selectedProfile.isAvailable ? 'فعال' : 'غیرفعال'}
                                </span>
                            </div>
                        </div>

                        {selectedProfile.specialty.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-400 mb-2">تخصص‌ها</p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedProfile.specialty.map((s) => (
                                        <span key={s} className="text-xs bg-primary-900/40 text-primary-300 px-2 py-0.5 rounded-full">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedProfile.bio && (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">بیوگرافی</p>
                                <p className="text-xs text-gray-300 leading-relaxed">{selectedProfile.bio}</p>
                            </div>
                        )}

                        <div className="pt-3 border-t border-gray-800">
                            {selectedProfile.isVerified ? (
                                <button
                                    onClick={() => handleVerify(selectedProfile.id, false)}
                                    disabled={processingId === selectedProfile.id}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 disabled:opacity-50 transition-colors">
                                    لغو تأیید
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleVerify(selectedProfile.id, true)}
                                    disabled={processingId === selectedProfile.id}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-green-900/30 text-green-400 hover:bg-green-900/50 disabled:opacity-50 transition-colors">
                                    ✓ تأیید روانشناس
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)}
                            className={['w-8 h-8 rounded-lg text-sm', p === page ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'].join(' ')}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
