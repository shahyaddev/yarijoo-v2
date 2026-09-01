import Link from 'next/link'
import { Badge } from '@/components/ui'

interface BlogCardProps {
    slug: string
    title: string
    excerpt?: string | null
    coverImage?: string | null
    category?: string
    readTime?: number | null
    publishedAt?: string | null
    variant?: 'vertical' | 'horizontal'
}

export default function BlogCard({
    slug,
    title,
    excerpt,
    coverImage,
    category,
    readTime,
    variant = 'vertical',
}: BlogCardProps) {
    if (variant === 'horizontal') {
        return (
            <Link
                href={`/blog/${slug}`}
                className="group flex gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition-all"
            >
                <div className="w-24 h-20 flex-shrink-0 bg-primary-100 dark:bg-primary-900/30 rounded-lg overflow-hidden flex items-center justify-center text-3xl">
                    {coverImage ? null : '📰'}
                </div>
                <div className="flex-1 min-w-0">
                    {category && (
                        <Badge variant="info" className="mb-1 text-xs">
                            {category}
                        </Badge>
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-primary-700 transition-colors">
                        {title}
                    </h3>
                    {readTime && (
                        <span className="text-xs text-gray-400">⏱ {readTime} دقیقه</span>
                    )}
                </div>
            </Link>
        )
    }

    return (
        <Link
            href={`/blog/${slug}`}
            className="group block bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
        >
            <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 flex items-center justify-center text-5xl">
                📰
            </div>
            <div className="p-4">
                {category && (
                    <Badge variant="info" className="mb-2">
                        {category}
                    </Badge>
                )}
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {title}
                </h3>
                {excerpt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {excerpt}
                    </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                    {readTime && <span>⏱ {readTime} دقیقه مطالعه</span>}
                    <span className="text-primary-600 font-medium">ادامه مطلب</span>
                </div>
            </div>
        </Link>
    )
}
