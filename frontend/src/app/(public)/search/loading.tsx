export default function SearchLoading() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse"
                >
                    <div className="flex gap-4">
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
