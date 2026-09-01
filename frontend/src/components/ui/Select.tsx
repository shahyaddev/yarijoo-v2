'use client'
import { type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options: { value: string; label: string }[]
}

export default function Select({
    label,
    error,
    options,
    className = '',
    id,
    ...props
}: SelectProps) {
    const selectId = id ?? label?.replace(/\s+/g, '-').toLowerCase()

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label
                    htmlFor={selectId}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={[
                    'w-full px-4 py-2.5 border-2 rounded-xl appearance-none',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                    'focus:outline-none focus:ring-2 transition-all',
                    error
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 dark:border-gray-600 focus:border-primary-600 focus:ring-primary-100',
                    className,
                ].join(' ')}
                {...props}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}
