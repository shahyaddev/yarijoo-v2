import { type ReactNode, type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    shadow?: boolean
    hover?: boolean
}

export function Card({
    children,
    shadow = true,
    hover = false,
    className = '',
    ...props
}: CardProps) {
    return (
        <div
            className={[
                'bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800',
                shadow ? 'shadow-card' : '',
                hover
                    ? 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
                    : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({
    children,
    className = '',
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div
            className={[
                'px-5 py-4 border-b border-gray-100 dark:border-gray-800',
                className,
            ].join(' ')}
        >
            {children}
        </div>
    )
}

export function CardBody({
    children,
    className = '',
}: {
    children: ReactNode
    className?: string
}) {
    return <div className={['px-5 py-4', className].join(' ')}>{children}</div>
}
