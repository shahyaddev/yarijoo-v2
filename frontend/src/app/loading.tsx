export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col gap-6 p-6 animate-pulse">
            {/* Header skeleton */}
            <div className="h-16 rounded-card bg-[var(--color-surface)]" />

            {/* Hero skeleton */}
            <div className="h-80 rounded-card bg-[var(--color-surface)]" />

            {/* Content grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-56 rounded-card bg-[var(--color-surface)]" />
                ))}
            </div>

            {/* Row skeleton */}
            <div className="h-48 rounded-card bg-[var(--color-surface)]" />

            {/* Another row skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-40 rounded-card bg-[var(--color-surface)]" />
                ))}
            </div>

            {/* Screen reader announcement */}
            <span className="sr-only">در حال بارگذاری...</span>
        </div>
    )
}
