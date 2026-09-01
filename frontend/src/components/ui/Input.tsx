'use client'
import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    success?: boolean
    helperText?: string
}

export default function Input({
    label,
    error,
    success,
    helperText,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase()

    const borderClass = error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : success
            ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
            : 'border-gray-300 dark:border-gray-600 focus:border-primary-600 focus:ring-primary-100'

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={[
                    'w-full px-4 py-2.5 border-2 rounded-xl',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    borderClass,
                    className,
                ].join(' ')}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {!error && helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        </div>
    )
}
