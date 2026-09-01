'use client'
import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AccordionItem {
    id: string
    title: string
    content: ReactNode
}

interface AccordionProps {
    items: AccordionItem[]
    allowMultiple?: boolean
}

export default function Accordion({
    items,
    allowMultiple = false,
}: AccordionProps) {
    const [openIds, setOpenIds] = useState<string[]>([])

    const toggle = (id: string) => {
        if (allowMultiple) {
            setOpenIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
            )
        } else {
            setOpenIds((prev) => (prev.includes(id) ? [] : [id]))
        }
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {items.map(({ id, title, content }) => {
                const isOpen = openIds.includes(id)
                return (
                    <div key={id}>
                        <button
                            onClick={() => toggle(id)}
                            aria-expanded={isOpen}
                            className="w-full flex items-center justify-between px-5 py-4 text-right font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <span>{title}</span>
                            <motion.span
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-gray-400"
                            >
                                ▼
                            </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-4 text-gray-600 dark:text-gray-400 text-sm">
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
