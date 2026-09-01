'use client'

interface SwitchProps {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    disabled?: boolean
}

export default function Switch({
    checked,
    onChange,
    label,
    disabled = false,
}: SwitchProps) {
    return (
        <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={[
                    'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1',
                    checked ? 'bg-primary-700' : 'bg-gray-300 dark:bg-gray-600',
                    disabled ? 'opacity-50 cursor-not-allowed' : '',
                ].join(' ')}
            >
                <span
                    className={[
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                        checked ? 'translate-x-0.5' : 'translate-x-5',
                    ].join(' ')}
                />
            </button>
            {label && (
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            )}
        </label>
    )
}
