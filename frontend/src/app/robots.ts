import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarijoo.com'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/tests',
                    '/tests/',
                    '/blog',
                    '/blog/',
                    '/shop',
                    '/shop/',
                    '/books',
                    '/books/',
                    '/courses',
                    '/courses/',
                    '/psychologists',
                    '/psychologists/',
                    '/pricing',
                    '/search',
                ],
                disallow: [
                    '/dashboard/',
                    '/admin/',
                    '/auth/',
                    '/checkout/',
                    '/api/',
                    '/_next/',
                    '/books/reader/',
                ],
            },
            // Disallow all crawlers from staging / preview deployments if needed
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/dashboard/', '/admin/', '/api/', '/auth/'],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    }
}
