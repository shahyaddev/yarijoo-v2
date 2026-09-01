'use client'
import { useEffect, useRef, useState } from 'react'

interface Stat {
    label: string
    value: number
    suffix?: string
}

const STATS: Stat[] = [
    { label: 'کاربر فعال', value: 50000, suffix: '+' },
    { label: 'تست روانشناسی', value: 150, suffix: '+' },
    { label: 'جلسه مشاوره', value: 10000, suffix: '+' },
    { label: 'روانشناس متخصص', value: 80, suffix: '+' },
]

function useCountUp(target: number, duration = 2000, shouldStart = false) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!shouldStart) return
        const start = Date.now()
        const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            setCount(Math.floor(progress * target))
            if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
    }, [target, duration, shouldStart])
    return count
}

function StatCard({ label, value, suffix = '' }: Stat) {
    const ref = useRef<HTMLDivElement>(null)
    const [started, setStarted] = useState(false)
    const count = useCountUp(value, 2000, started)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStarted(true) },
            { threshold: 0.5 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-5xl font-black text-primary-700 dark:text-primary-400 mb-2">
                {count.toLocaleString('fa-IR')}{suffix}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">{label}</div>
        </div>
    )
}

export default function StatsSection() {
    return (
        <section className="py-16 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>
            </div>
        </section>
    )
}
