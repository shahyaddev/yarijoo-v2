'use client'
import { useState } from 'react'

interface Props {
    images: string[]
    title: string
}

export default function ImageGallery({ images, title }: Props) {
    const [active, setActive] = useState(0)
    const [zoomed, setZoomed] = useState(false)

    const src = images.length > 0 ? images[active] : null

    return (
        <>
            {/* Main image */}
            <div
                className="rounded-2xl overflow-hidden relative group"
                style={{
                    aspectRatio: '1/1',
                    background: 'linear-gradient(135deg,#EDE6D6,#DDD5C5)',
                    boxShadow: '0 4px 24px rgba(27,67,50,0.10)',
                    cursor: src ? 'zoom-in' : 'default',
                }}
                onClick={() => src && setZoomed(true)}
                role={src ? 'button' : undefined}
                tabIndex={src ? 0 : undefined}
                aria-label={src ? `بزرگ‌نمایی تصویر ${title}` : undefined}
                onKeyDown={e => {
                    if (src && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        setZoomed(true)
                    }
                }}
            >
                {src ? (
                    <>
                        <img
                            src={src}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* zoom icon on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(0,0,0,0.18)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.9)' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="#1B4332" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                    <path d="M11 8v6M8 11h6" />
                                </svg>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 select-none">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                            stroke="#C8B99A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                            aria-hidden="true">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <span className="text-xs font-medium" style={{ color: '#C8B99A' }}>بدون تصویر</span>
                    </div>
                )}

                {/* image counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.50)', color: 'white' }}>
                        {active + 1} / {images.length}
                    </div>
                )}

                {/* prev / next arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={e => { e.stopPropagation(); setActive(i => Math.max(0, i - 1)) }}
                            disabled={active === 0}
                            aria-label="تصویر قبلی"
                            className="absolute top-1/2 right-3 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-0"
                            style={{ background: 'rgba(255,255,255,0.88)' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B4332"
                                strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); setActive(i => Math.min(images.length - 1, i + 1)) }}
                            disabled={active === images.length - 1}
                            aria-label="تصویر بعدی"
                            className="absolute top-1/2 left-3 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-0"
                            style={{ background: 'rgba(255,255,255,0.88)' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B4332"
                                strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-0.5 mt-3" role="list" aria-label="گالری تصاویر">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            role="listitem"
                            onClick={() => setActive(i)}
                            aria-label={`تصویر ${i + 1}`}
                            aria-pressed={active === i}
                            className="shrink-0 rounded-xl overflow-hidden transition-all duration-200"
                            style={{
                                width: 64,
                                height: 64,
                                outline: active === i ? '2.5px solid #1B4332' : '2.5px solid transparent',
                                outlineOffset: '2px',
                                background: '#EDE6D6',
                                opacity: active === i ? 1 : 0.55,
                            }}
                        >
                            <img src={img} alt={`تصویر ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {zoomed && src && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-6"
                    style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setZoomed(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="نمایش بزرگ تصویر"
                >
                    <button
                        onClick={() => setZoomed(false)}
                        className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                        style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
                        aria-label="بستن"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white"
                            strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <img
                        src={src}
                        alt={title}
                        className="max-w-full max-h-[88vh] rounded-2xl object-contain shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />

                    {/* dot nav */}
                    {images.length > 1 && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={e => { e.stopPropagation(); setActive(i) }}
                                    aria-label={`تصویر ${i + 1}`}
                                    className="rounded-full transition-all duration-200"
                                    style={{
                                        width: active === i ? 22 : 8,
                                        height: 8,
                                        background: active === i ? 'white' : 'rgba(255,255,255,0.35)',
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
