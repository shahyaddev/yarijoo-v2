'use client'
import { type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
    helperText?: string
}

export default function Textarea({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}: TextareaProps) {
    const textareaId = id ?? label?.replace(/\s+/g, '-').toLowerCase()

    const borderClass = error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 dark:border-gray-600 focus:border-primary-600 focus:ring-primary-100'

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label
                    htmlFor={textareaId}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                rows={4}
                className={[
                    'w-full px-4 py-2.5 border-2 rounded-xl resize-vertical',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                    'placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all',
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
