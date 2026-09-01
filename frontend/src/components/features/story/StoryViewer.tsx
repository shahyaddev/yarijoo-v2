'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Story {
    id: string
    title?: string | null
    content: string
    mediaUrl?: string | null
    seen?: boolean
}

interface StoryViewerProps {
    stories: Story[]
    initialIndex: number
    onClose: () => void
}

const STORY_DURATION = 5000

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [progress, setProgress] = useState(0)

    const goNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex((i) => i + 1)
            setProgress(0)
        } else {
            onClose()
        }
    }, [currentIndex, stories.length, onClose])

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((i) => i - 1)
            setProgress(0)
        }
    }, [currentIndex])

    // Auto-advance timer
    useEffect(() => {
        setProgress(0)
        const interval = setInterval(() => {
            setProgress((p) => {
                const next = p + (100 / (STORY_DURATION / 100))
                if (next >= 100) {
                    goNext()
                    return 0
                }
                return next
            })
        }, 100)
        return () => clearInterval(interval)
    }, [currentIndex, goNext])

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') goPrev()
            if (e.key === 'ArrowLeft') goNext()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [goNext, goPrev, onClose])

    const story = stories[currentIndex]
    if (!story) return null

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="مشاهده استوری"
        >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-20">
                {stories.map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={i === currentIndex ? Math.round(progress) : i < currentIndex ? 100 : 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full bg-white rounded-full"
                            style={{
                                width:
                                    i < currentIndex
                                        ? '100%'
                                        : i === currentIndex
                                            ? `${progress}%`
                                            : '0%',
                                transition: i === currentIndex ? 'none' : undefined,
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                aria-label="بستن استوری"
                className="absolute top-6 left-4 text-white text-2xl z-20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
                ✕
            </button>

            {/* Story content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-sm mx-4"
                    style={{ height: 'min(90vh, 600px)' }}
                >
                    <div className="w-full h-full bg-gradient-to-br from-primary-800 to-primary-950 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative">
                        {/* Media or default illustration */}
                        {story.mediaUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={story.mediaUrl}
                                alt={story.title ?? 'استوری'}
                                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                            />
                        ) : null}

                        {/* Caption overlay */}
                        <div className="text-center px-8 z-10 relative">
                            {!story.mediaUrl && (
                                <div className="text-6xl mb-6" aria-hidden="true">🧠</div>
                            )}
                            {story.title && (
                                <h2 className="text-xl font-bold text-white mb-3 drop-shadow">{story.title}</h2>
                            )}
                            <p className="text-primary-100 text-sm leading-relaxed drop-shadow">{story.content}</p>
                        </div>

                        {/* Tap areas — left/right navigation */}
                        <button
                            onClick={goPrev}
                            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer focus:outline-none"
                            aria-label="استوری قبلی"
                            tabIndex={-1}
                        />
                        <button
                            onClick={goNext}
                            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer focus:outline-none"
                            aria-label="استوری بعدی"
                            tabIndex={-1}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
