import type { Metadata } from 'next'
import CoursesClient from './CoursesClient'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarijoo.com'

export const metadata: Metadata = {
    title: 'دوره‌های آموزشی روانشناسی',
    description: 'بهترین دوره‌های تخصصی سلامت روان و رشد فردی — ویدیو آموزشی آنلاین',
    openGraph: {
        title: 'دوره‌های آموزشی | یاری‌جو',
        description: 'بهترین دوره‌های تخصصی سلامت روان و رشد فردی',
        url: `${siteUrl}/courses`,
        type: 'website',
        locale: 'fa_IR',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'دوره‌های آموزشی یاری‌جو' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'دوره‌های آموزشی | یاری‌جو',
        description: 'بهترین دوره‌های تخصصی سلامت روان',
        images: ['/og-image.png'],
    },
    alternates: { canonical: `${siteUrl}/courses` },
}

export default function CoursesPage() {
    return <CoursesClient />
}
