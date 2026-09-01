'use client'
import { useState, type ReactNode } from 'react'

interface TooltipProps {
    content: string
    children: ReactNode
    position?: 'top' | 'bottom'
}

export default function Tooltip({
    content,
    children,
    position = 'top',
}: TooltipProps) {
    const [visible, setVisible] = useState(false)

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div
                    className={[
                        'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg whitespace-nowrap shadow-lg pointer-events-none',
                        'left-1/2 -translate-x-1/2',
                        position === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
                    ].join(' ')}
                >
                    {content}
                </div>
            )}
        </div>
    )
}
