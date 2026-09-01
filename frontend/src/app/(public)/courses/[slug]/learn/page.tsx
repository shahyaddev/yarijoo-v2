import type { Metadata } from 'next'
import LearnPageClient from './LearnPageClient'

export const metadata: Metadata = {
    title: 'یادگیری دوره | یاری‌جو',
}

export default async function LearnPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    return <LearnPageClient slug={slug} />
}
