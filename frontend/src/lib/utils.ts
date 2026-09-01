import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Class name merger (clsx + tailwind-merge) ────────────────────
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs))
}

// ─── Format price in Iranian Rial/Toman (Persian locale) ─────────
export function formatPrice(
    amount: number,
    currency: 'rial' | 'toman' = 'toman',
): string {
    const value = currency === 'toman' ? Math.round(amount / 10) : amount
    const formatted = new Intl.NumberFormat('fa-IR').format(value)
    return currency === 'toman' ? `${formatted} تومان` : `${formatted} ریال`
}

// ─── Convert Latin digits to Farsi (Eastern Arabic) digits ───────
export function toFarsiNumber(value: number | string): string {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
    return String(value).replace(/[0-9]/g, (digit) => farsiDigits[Number(digit)])
}

// ─── Truncate text to a max character length ─────────────────────
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trimEnd() + '…'
}

// ─── Persian relative time (timeAgo) ─────────────────────────────
export function timeAgo(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)
    const diffWeek = Math.floor(diffDay / 7)
    const diffMonth = Math.floor(diffDay / 30)
    const diffYear = Math.floor(diffDay / 365)

    if (diffSec < 60) return 'لحظاتی پیش'
    if (diffMin < 60) return `${toFarsiNumber(diffMin)} دقیقه پیش`
    if (diffHr < 24) return `${toFarsiNumber(diffHr)} ساعت پیش`
    if (diffDay < 7) return `${toFarsiNumber(diffDay)} روز پیش`
    if (diffWeek < 4) return `${toFarsiNumber(diffWeek)} هفته پیش`
    if (diffMonth < 12) return `${toFarsiNumber(diffMonth)} ماه پیش`
    return `${toFarsiNumber(diffYear)} سال پیش`
}

// ─── Slugify Persian + Latin text ────────────────────────────────
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '')
        .replace(/--+/g, '-')
}

// ─── Read time estimator (Persian output) ────────────────────────
export function estimateReadTime(content: string, wordsPerMin = 200): string {
    const wordCount = content.trim().split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMin)
    return `${toFarsiNumber(minutes)} دقیقه مطالعه`
}
