'use client'
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface HlsPlayerProps {
    src: string | null
    title?: string
    onProgress?: (watchedSeconds: number, percent: number) => void
    onEnded?: () => void
    autoPlay?: boolean
}

export default function HlsPlayer({ src, title, onProgress, onEnded, autoPlay = false }: HlsPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const hlsRef = useRef<Hls | null>(null)
    const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const video = videoRef.current
        if (!video || !src) {
            setIsLoading(false)
            return
        }

        setError(null)
        setIsLoading(true)

        // Clean up previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
            })
            hlsRef.current = hls

            hls.loadSource(src)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false)
                if (autoPlay) {
                    video.play().catch(() => {/* autoplay blocked */})
                }
            })

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    setError('خطا در بارگذاری ویدیو. لطفاً صفحه را رفرش کنید.')
                    setIsLoading(false)
                }
            })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari/iOS)
            video.src = src
            video.addEventListener('loadedmetadata', () => setIsLoading(false), { once: true })
            if (autoPlay) {
                video.play().catch(() => {})
            }
        } else {
            setError('مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.')
            setIsLoading(false)
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }
    }, [src, autoPlay])

    // Report progress every 10 seconds while playing
    useEffect(() => {
        const video = videoRef.current
        if (!video || !onProgress) return

        const handleTimeUpdate = () => {
            if (!video.duration) return
            const percent = Math.round((video.currentTime / video.duration) * 100)
            const watched = Math.round(video.currentTime)
            onProgress(watched, percent)
        }

        progressTimerRef.current = setInterval(() => {
            if (!video.paused && !video.ended) {
                handleTimeUpdate()
            }
        }, 10000)

        return () => {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current)
        }
    }, [onProgress])

    // Fire onEnded
    useEffect(() => {
        const video = videoRef.current
        if (!video || !onEnded) return
        video.addEventListener('ended', onEnded)
        return () => video.removeEventListener('ended', onEnded)
    }, [onEnded])

    if (!src) {
        return (
            <div className="rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <p className="text-4xl mb-2">🎬</p>
                    <p className="text-sm">ویدیو در دسترس نیست</p>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl overflow-hidden bg-black aspect-video relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            )}

            {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center text-white px-6">
                        <p className="text-3xl mb-3">⚠️</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    playsInline
                    aria-label={title ?? 'ویدیوی درس'}
                />
            )}
        </div>
    )
}
