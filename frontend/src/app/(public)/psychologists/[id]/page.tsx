import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BookAppointmentButton from './BookAppointmentButton'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

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
    availability: Record<string, unknown>
    user: { fullName: string | null; phone: string; avatarUrl: string | null }
}

interface PageProps { params: Promise<{ id: string }> }

async function getPsy(id: string): Promise<Psychologist | null> {
    try {
        const res = await fetch(`${API}/psychologists/${id}`, { cache: 'no-store' })
        if (!res.ok) return null
        const j = await res.json() as { data: Psychologist }
        return j.data
    } catch { return null }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const psy = await getPsy(id)
    return { title: psy?.user?.fullName ? `${psy.user.fullName} | یاری‌جو` : 'روانشناس | یاری‌جو' }
}

export default async function PsychologistDetailPage({ params }: PageProps) {
    const { id } = await params
    const psy = await getPsy(id)
    if (!psy) notFound()

    const name = psy.user?.fullName ?? 'روانشناس'

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            <div className="max-w-4xl mx-auto px-5 py-12">
                <Link href="/psychologists"
                    className="inline-flex items-center gap-2 text-sm font-semibold mb-8 hover:opacity-70 transition-opacity"
                    style={{ color: '#1B4332' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    بازگشت
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
                    {/* Left: card */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                            <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg,#F3EDE3,#EDE6D6)' }}>
                                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white mx-auto mb-3 shadow-md"
                                    style={{ background: '#1B4332' }}>
                                    {name.charAt(0)}
                                </div>
                                <h1 className="font-black text-xl mb-1" style={{ color: '#1C1C1E' }}>{name}</h1>
                                {psy.isVerified && (
                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: '#E8F5E9', color: '#1B4332' }}>✅ تأیید شده</span>
                                )}
                                {psy.rating && (
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <span className="text-[#C9A84C]">★</span>
                                        <span className="text-sm font-bold" style={{ color: '#C9A84C' }}>{psy.rating.toFixed(1)}</span>
                                        <span className="text-xs" style={{ color: '#8C8C8E' }}>({psy.reviewCount} نظر)</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: '#8C8C8E' }}>هزینه هر جلسه</span>
                                    <span className="font-black" style={{ color: '#1B4332' }}>{psy.hourlyRate.toLocaleString('fa-IR')} تومان</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: '#8C8C8E' }}>وضعیت</span>
                                    <span className="font-semibold" style={{ color: psy.isAvailable ? '#1B4332' : '#C62828' }}>
                                        {psy.isAvailable ? '🟢 آنلاین' : '🔴 ناموجود'}
                                    </span>
                                </div>
                                {psy.licenseNo && (
                                    <div className="flex justify-between">
                                        <span style={{ color: '#8C8C8E' }}>شماره پروانه</span>
                                        <span style={{ color: '#5C5C5E' }}>{psy.licenseNo}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Book button */}
                        <BookAppointmentButton
                            psychologistId={psy.id}
                            isAvailable={psy.isAvailable}
                            hourlyRate={psy.hourlyRate}
                        />
                    </div>

                    {/* Right: info */}
                    <div className="space-y-5">
                        {psy.bio && (
                            <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <h2 className="font-bold text-base mb-3" style={{ color: '#1C1C1E' }}>درباره من</h2>
                                <p className="text-sm leading-relaxed" style={{ color: '#5C5C5E' }}>{psy.bio}</p>
                            </div>
                        )}

                        {psy.specialty?.length > 0 && (
                            <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#EDE6D6' }}>
                                <h2 className="font-bold text-base mb-3" style={{ color: '#1C1C1E' }}>تخصص‌ها</h2>
                                <div className="flex flex-wrap gap-2">
                                    {psy.specialty.map(s => (
                                        <span key={s} className="text-sm font-semibold px-3 py-1.5 rounded-xl"
                                            style={{ background: '#E8F5E9', color: '#1B4332' }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* How it works */}
                        <div className="rounded-2xl border p-5" style={{ background: '#F9F5EF', borderColor: '#EDE6D6' }}>
                            <h2 className="font-bold text-base mb-4" style={{ color: '#1C1C1E' }}>نحوه مشاوره</h2>
                            <div className="space-y-3">
                                {[
                                    { n: '۱', t: 'رزرو نوبت', d: 'زمان مناسب خود را انتخاب کنید' },
                                    { n: '۲', t: 'پرداخت آنلاین', d: 'پرداخت امن از طریق درگاه بانکی' },
                                    { n: '۳', t: 'جلسه آنلاین', d: 'در زمان مقرر از طریق تماس ویدیویی' },
                                ].map(s => (
                                    <div key={s.n} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5"
                                            style={{ background: '#1B4332' }}>{s.n}</div>
                                        <div>
                                            <p className="font-semibold text-sm" style={{ color: '#1C1C1E' }}>{s.t}</p>
                                            <p className="text-xs" style={{ color: '#8C8C8E' }}>{s.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
