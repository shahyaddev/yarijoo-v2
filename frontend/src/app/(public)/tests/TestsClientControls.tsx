'use client'

import { useState } from 'react'
import { Pagination } from '@/components/ui'

interface TestsClientControlsProps {
    showPagination?: boolean
}

export default function TestsClientControls({
    showPagination = false,
}: TestsClientControlsProps) {
    const [page, setPage] = useState(1)
    const [query, setQuery] = useState('')

    if (showPagination) {
        return (
            <Pagination page={page} totalPages={8} onPageChange={setPage} />
        )
    }

    return (
        <div className="mb-6">
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو در تست‌ها..."
                className="w-full max-w-md px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-600"
            />
        </div>
    )
}
