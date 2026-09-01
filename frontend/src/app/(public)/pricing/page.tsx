import type { Metadata } from 'next'
import PricingClient from './PricingClient'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarijoo.com'

export const metadata: Metadata = {
    title: 'پلن‌های اشتراک',
    description: 'اشتراک ماهانه یا سالانه یاری‌جو — دسترسی نامحدود به تست‌ها، مقالات، کتاب‌ها و تخفیف مشاوره',
    openGraph: {
        title: 'پلن‌های اشتراک | یاری‌جو',
        description: 'دسترسی نامحدود به تمام امکانات یاری‌جو با اشتراک ماهانه یا سالانه',
        url: `${siteUrl}/pricing`,
        type: 'website',
        locale: 'fa_IR',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'پلن‌های اشتراک یاری‌جو' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'پلن‌های اشتراک | یاری‌جو',
        description: 'دسترسی نامحدود به تمام امکانات یاری‌جو',
        images: ['/og-image.png'],
    },
    alternates: { canonical: `${siteUrl}/pricing` },
}

export default function PricingPage() {
    return <PricingClient />
}
