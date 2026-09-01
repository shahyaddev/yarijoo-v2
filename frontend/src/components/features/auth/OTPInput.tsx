'use client'
import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react'

interface OTPInputProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    length?: number
    hasError?: boolean
}

export default function OTPInput({
    value,
    onChange,
    disabled = false,
    length = 6,
    hasError = false,
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const digits = value.padEnd(length, '').split('').slice(0, length)

    const handleChange = (index: number, char: string) => {
        if (!/^\d*$/.test(char)) return
        const newDigits = [...digits]
        newDigits[index] = char.slice(-1)
        onChange(newDigits.join('').trimEnd())
        if (char && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                const newDigits = [...digits]
                newDigits[index - 1] = ''
                onChange(newDigits.join('').trimEnd())
                inputRefs.current[index - 1]?.focus()
            } else if (digits[index]) {
                const newDigits = [...digits]
                newDigits[index] = ''
                onChange(newDigits.join('').trimEnd())
            }
        } else if (e.key === 'ArrowRight' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        } else if (e.key === 'ArrowLeft' && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
        onChange(pasted)
        const nextIndex = Math.min(pasted.length, length - 1)
        inputRefs.current[nextIndex]?.focus()
    }

    const borderClass = hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 dark:border-gray-600 focus:border-primary-600 dark:focus:border-primary-400 focus:ring-primary-200'

    return (
        <div className="flex gap-2 justify-center" dir="ltr">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        inputRefs.current[i] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i] ?? ''}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    autoComplete="one-time-code"
                    className={[
                        'w-11 h-12 text-center text-xl font-bold border-2 rounded-xl',
                        'bg-white dark:bg-gray-800',
                        'text-gray-900 dark:text-gray-100',
                        'focus:outline-none focus:ring-2',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-all duration-150',
                        borderClass,
                    ].join(' ')}
                />
            ))}
        </div>
    )
}
