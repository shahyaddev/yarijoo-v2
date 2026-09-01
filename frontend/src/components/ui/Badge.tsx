import { type ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

const variants: Record<BadgeVariant, string> = {
    success:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export default function Badge({
    children,
    variant = 'default',
    className = '',
}: {
    children: ReactNode
    variant?: BadgeVariant
    className?: string
}) {
    return (
        <span
            className={[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                variants[variant],
                className,
            ].join(' ')}
        >
            {children}
        </span>
    )
}
