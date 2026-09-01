import type { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 0

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

export const metadata: Metadata = {
    title: 'روانشناسان متخصص | یاری‌جو',
    description: 'مشاوره آنلاین با متخصصان تأیید شده سلامت روان — رزرو نوبت آنلاین',
}

interface Psychologist {
    id: string
    userId: string
    bio: string | null
    specialty: string[]
    licenseNo: string | null
    hourlyRate: number
    isVerified: boolean
    isAvailable: boolean
    rating: number | null
    reviewCount: number
    user: {
        fullName: string | null
        phone: string
        avatarUrl: string | null
    }
}

async function getPsychologists() {
    try {
        const res = await fetch(`${API}/psychologists?limit=50`, { cache: 'no-store' })
        if (!res.ok) return []
        const json = await res.json() as { data: { psychologists: Psychologist[] } }
        return json.data?.psychologists ?? []
    } catch {
        return [] as Psychologist[]
    }
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#C9A84C' : 'none'}
                    stroke="#C9A84C" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
            <span className="text-xs font-semibold mr-1" style={{ color: '#C9A84C' }}>{rating.toFixed(1)}</span>
        </div>
    )
}

export default async function PsychologistsPage() {
    const psychologists = await getPsychologists()

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: '#1B4332' }} className="py-14 px-5">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">روانشناسان متخصص</h1>
                    <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-lg">
                        {psychologists.length > 0 ? `${psychologists.length.toLocaleString('fa-IR')} متخصص تأیید شده` : 'مشاوره آنلاین با متخصصان سلامت روان'}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 py-10">
                {psychologists.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-4">👩‍⚕️</div>
                        <p className="text-lg font-semibold" style={{ color: '#1C1C1E' }}>در حال بارگذاری...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {psychologists.map(psy => {
                            const name = psy.user?.fullName ?? 'روانشناس'
                            const initials = name.charAt(0)
                            return (
                                <div key={psy.id}
                                    className="rounded-2xl border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
                                    style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                    {/* Header */}
                                    <div className="p-5 pb-4" style={{ background: 'linear-gradient(135deg,#F3EDE3,#EDE6D6)' }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0 shadow-md"
                                                style={{ background: '#1B4332' }}>
                                                {psy.user?.avatarUrl
                                                    ? <img src={psy.user.avatarUrl} alt={name} className="w-full h-full object-cover rounded-2xl" />
                                                    : initials}
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="font-black text-[16px] truncate" style={{ color: '#1C1C1E' }}>{name}</h2>
                                                {psy.isVerified && (
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1"
                                                        style={{ background: '#E8F5E9', color: '#1B4332' }}>✅ تأیید شده</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center justify-between mt-3">
                                            {psy.rating ? <StarRating rating={psy.rating} /> : <div />}
                                            <span className="text-[11px]" style={{ color: '#8C8C8E' }}>
                                                {psy.reviewCount.toLocaleString('fa-IR')} نظر
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        {psy.bio && (
                                            <p className="text-[13px] leading-relaxed mb-4 line-clamp-3" style={{ color: '#5C5C5E' }}>
                                                {psy.bio}
                                            </p>
                                        )}

                                        {/* Specialties */}
                                        {psy.specialty?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {psy.specialty.map(s => (
                                                    <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                        style={{ background: '#F3EDE3', color: '#5C5C5E' }}>
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Price + availability */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-[11px]" style={{ color: '#8C8C8E' }}>هر جلسه</p>
                                                <p className="text-[15px] font-black" style={{ color: '#1B4332' }}>
                                                    {psy.hourlyRate.toLocaleString('fa-IR')} تومان
                                                </p>
                                            </div>
                                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full`}
                                                style={psy.isAvailable
                                                    ? { background: '#E8F5E9', color: '#1B4332' }
                                                    : { background: '#FCE4EC', color: '#C62828' }}>
                                                {psy.isAvailable ? '🟢 آنلاین' : '🔴 ناموجود'}
                                            </span>
                                        </div>

                                        {/* CTA */}
                                        <Link href={`/psychologists/${psy.id}`}
                                            className="block text-center py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                                            style={{ background: psy.isAvailable ? '#1B4332' : '#DDD5C5' }}>
                                            {psy.isAvailable ? 'رزرو نوبت' : 'مشاهده پروفایل'}
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
