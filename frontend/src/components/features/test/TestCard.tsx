import Link from 'next/link'
import { Badge, Card, CardBody } from '@/components/ui'

interface TestCardProps {
    id: string
    slug: string
    title: string
    description?: string | null
    category: string
    isPremium: boolean
    duration?: number | null
    questionCount?: number
}

export default function TestCard({
    slug,
    title,
    description,
    category,
    isPremium,
    duration,
    questionCount,
}: TestCardProps) {
    return (
        <Card hover>
            <CardBody>
                <div className="flex items-start justify-between mb-3">
                    <Badge variant={isPremium ? 'warning' : 'success'}>
                        {isPremium ? 'پریمیوم' : 'رایگان'}
                    </Badge>
                    <Badge variant="info">{category}</Badge>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                        {description}
                    </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    {duration && <span>⏱ {duration} دقیقه</span>}
                    {questionCount && <span>❓ {questionCount} سوال</span>}
                </div>
                <Link
                    href={`/tests/${slug}`}
                    className="block w-full text-center py-2 bg-primary-700 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                    شروع تست
                </Link>
            </CardBody>
        </Card>
    )
}
