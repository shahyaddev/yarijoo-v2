'use client'

import { IconBookmark, IconShare } from '@/components/ui/Icon'

export default function StorySidebar({ coverSrc, title }: { coverSrc: string | null; title: string | null }) {
    return (
        <div className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">

            {/* Cover */}
            {coverSrc && (
                <div style={{
                    position: 'relative', aspectRatio: '3/4',
                    borderRadius: 20, overflow: 'hidden',
                    border: '2px solid #EDE6D6',
                    background: 'linear-gradient(145deg,#EDE6D6,#DDD5C5)',
                    boxShadow: '0 16px 48px rgba(27,67,50,0.15)',
                }}>
                    <img src={coverSrc} alt={title ?? 'داستان'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(27,67,50,0.3) 0%, transparent 50%)' }} />
                </div>
            )}

            {/* Quick actions */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid #EDE6D6', boxShadow: '0 2px 8px rgba(27,67,50,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1B4332" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E', margin: 0 }}>عملیات سریع</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                        { Icon: IconBookmark, label: 'ذخیره داستان' },
                        { Icon: IconShare,    label: 'اشتراک‌گذاری' },
                    ].map(({ Icon, label }) => (
                        <button key={label}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 14px', borderRadius: 12,
                                background: 'white', border: '1px solid #EDE6D6',
                                color: '#5C5C5E', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                transition: 'all .2s', fontFamily: 'inherit',
                            }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLElement
                                el.style.borderColor = '#2D6A4F'
                                el.style.color = '#1B4332'
                                el.style.background = '#F0FBF4'
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLElement
                                el.style.borderColor = '#EDE6D6'
                                el.style.color = '#5C5C5E'
                                el.style.background = 'white'
                            }}
                        >
                            <Icon size={15} color="#1B4332" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
