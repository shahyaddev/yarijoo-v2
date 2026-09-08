'use client'
import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconChevronDown } from '@/components/ui/Icon'

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
function toPersianNumber(n: number): string {
    return String(n).split('').map(d => PERSIAN_DIGITS[+d] ?? d).join('')
}

interface AccordionItem {
    id: string
    title: string
    content: ReactNode
}

interface AccordionProps {
    items: AccordionItem[]
    allowMultiple?: boolean
}

export default function Accordion({ items, allowMultiple = false }: AccordionProps) {
    const [openIds, setOpenIds] = useState<string[]>([])

    const toggle = (id: string) => {
        if (allowMultiple) {
            setOpenIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
        } else {
            setOpenIds(prev => prev.includes(id) ? [] : [id])
        }
    }

    return (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #EDE6D6' }}>
            {items.map(({ id, title, content }, index) => {
                const isOpen = openIds.includes(id)
                return (
                    <div
                        key={id}
                        style={{
                            borderBottom: index < items.length - 1 ? '1px solid #EDE6D6' : 'none',
                        }}
                    >
                        {/* Header */}
                        <button
                            onClick={() => toggle(id)}
                            aria-expanded={isOpen}
                            className="w-full flex items-center gap-3 px-5 py-4 text-right transition-colors"
                            style={{
                                background: isOpen
                                    ? 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)'
                                    : 'white',
                            }}
                        >
                            {/* Chapter number badge */}
                            <span
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black transition-colors"
                                style={{
                                    background: isOpen ? 'rgba(255,255,255,0.2)' : '#F3EDE3',
                                    color: isOpen ? 'white' : '#1B4332',
                                    minWidth: 32,
                                }}
                            >
                                {toPersianNumber(index + 1)}
                            </span>

                            {/* Title */}
                            <span
                                className="flex-1 font-bold text-sm text-right leading-relaxed"
                                style={{ color: isOpen ? 'white' : '#1C1C1E' }}
                            >
                                {title}
                            </span>

                            {/* Chevron */}
                            <motion.span
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg"
                                style={{
                                    background: isOpen ? 'rgba(255,255,255,0.15)' : '#F3EDE3',
                                }}
                            >
                                <IconChevronDown
                                    size={13}
                                    color={isOpen ? 'white' : '#1B4332'}
                                    strokeWidth={2.5}
                                />
                            </motion.span>
                        </button>

                        {/* Body */}
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    key="body"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div
                                        className="px-5 py-4"
                                        style={{ background: '#FDFBF8' }}
                                    >
                                        {content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}
