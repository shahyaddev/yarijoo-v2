'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        const stored = localStorage.getItem('yarijoo-theme')
        const isDark =
            stored === 'dark' ||
            (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
        setTheme(isDark ? 'dark' : 'light')
    }, [])

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        localStorage.setItem('yarijoo-theme', next)
        document.documentElement.setAttribute('data-theme', next)
        if (next === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    return (
        <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'روشن کردن تم' : 'تاریک کردن تم'}
            className={[
                'p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300',
                className,
            ].join(' ')}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    )
}
