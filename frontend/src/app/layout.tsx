import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from './providers'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarijoo.ir'

export const metadata: Metadata = {
    title: {
        default: 'یاری‌جو | سلامت روان',
        template: '%s | یاری‌جو',
    },
    description: 'پلتفرم جامع سلامت روان — تست‌های روانشناسی، مشاوره آنلاین، کتاب‌ها و دوره‌های تخصصی',
    metadataBase: new URL(siteUrl),
    openGraph: {
        locale: 'fa_IR',
        type: 'website',
        siteName: 'یاری‌جو',
        title: 'یاری‌جو | سلامت روان',
        description: 'پلتفرم جامع سلامت روان',
        url: siteUrl,
    },
    twitter: {
        card: 'summary_large_image',
        site: '@yarijoo',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#1B4332',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fa" dir="rtl" suppressHydrationWarning>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
