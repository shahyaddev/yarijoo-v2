'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
    open: boolean
    onClose: () => void
    title?: string
    /** Accessible label used when `title` is not provided (required for a11y). */
    ariaLabel?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
}

/** Focusable element selectors for the keyboard trap. */
const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({
    open,
    onClose,
    title,
    ariaLabel,
    children,
    size = 'md',
}: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null)
    /** Element that had focus before the modal opened. */
    const previousFocusRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        if (!open) return

        // Store the previously-focused element so we can restore it on close.
        previousFocusRef.current = document.activeElement as HTMLElement

        // Move focus into the modal on open.
        const timer = setTimeout(() => {
            const el = dialogRef.current
            if (!el) return
            const firstFocusable = el.querySelector<HTMLElement>(FOCUSABLE)
            firstFocusable?.focus()
        }, 50)

        document.body.style.overflow = 'hidden'

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
                return
            }

            // Keyboard focus trap — cycle within the dialog.
            if (e.key === 'Tab') {
                const el = dialogRef.current
                if (!el) return
                const focusableEls = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE))
                if (focusableEls.length === 0) return
                const first = focusableEls[0]
                const last = focusableEls[focusableEls.length - 1]

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault()
                        last.focus()
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault()
                        first.focus()
                    }
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            clearTimeout(timer)
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
            // Restore focus to the element that triggered the modal.
            previousFocusRef.current?.focus()
        }
    }, [open, onClose])

    if (typeof window === 'undefined') return null

    const labelledBy = title ? 'modal-title' : undefined
    const labelledByProp = labelledBy ? { 'aria-labelledby': labelledBy } : {}
    const labelProp = !title && ariaLabel ? { 'aria-label': ariaLabel } : {}

    return createPortal(
        <AnimatePresence>
            {open && (
                <div
                    ref={dialogRef}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    {...labelledByProp}
                    {...labelProp}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={[
                            'relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full',
                            sizeClasses[size],
                        ].join(' ')}
                    >
                        {title && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                <h2
                                    id="modal-title"
                                    className="text-lg font-bold text-gray-900 dark:text-white"
                                >
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    aria-label="بستن دیالوگ"
                                    className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <div className="px-6 py-4">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    )
}
