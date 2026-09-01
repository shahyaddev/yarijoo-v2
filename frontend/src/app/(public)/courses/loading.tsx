import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="h-8 w-48 mb-8">
                <Skeleton className="h-full w-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-44 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    )
}
