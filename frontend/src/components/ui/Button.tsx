import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import Spinner from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: Size
    loading?: boolean
    icon?: ReactNode
    fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-primary-700 hover:bg-primary-600 active:bg-primary-800 text-white border-transparent',
    secondary:
        'bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-primary-600',
    ghost:
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent',
    danger:
        'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-transparent',
}

const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-base rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-lg rounded-xl gap-2.5',
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    fullWidth = false,
    disabled,
    children,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={[
                'inline-flex items-center justify-center font-semibold border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variantClasses[variant],
                sizeClasses[size],
                fullWidth ? 'w-full' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...props}
        >
            {loading ? <Spinner size={size === 'sm' ? 'sm' : 'md'} /> : icon}
            {children}
        </button>
    )
}
