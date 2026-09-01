import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yarijoo.com'

/**
 * Dynamic sitemap generated from the database.
 * In production each section fetches live slugs from the backend API.
 * The fallback statics ensure the sitemap is always valid during build/preview.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // ── Static / evergreen routes ────────────────────────────────────────────
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE_URL}/tests`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE_URL}/books`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/psychologists`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    ]

    // ── Dynamic slugs from the backend API ──────────────────────────────────
    let blogSlugs: string[] = []
    let testSlugs: string[] = []
    let productSlugs: string[] = []

    try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

        const [blogsRes, testsRes, productsRes] = await Promise.allSettled([
            fetch(`${apiBase}/blog?fields=slug&limit=1000`, { next: { revalidate: 3600 } }),
            fetch(`${apiBase}/tests?fields=slug&limit=1000`, { next: { revalidate: 3600 } }),
            fetch(`${apiBase}/shop/products?fields=slug&limit=1000`, { next: { revalidate: 3600 } }),
        ])

        if (blogsRes.status === 'fulfilled' && blogsRes.value.ok) {
            const json = await blogsRes.value.json() as { data?: Array<{ slug: string }>; items?: Array<{ slug: string }> }
            const items = json.data ?? json.items ?? []
            blogSlugs = items.map((p) => p.slug)
        }

        if (testsRes.status === 'fulfilled' && testsRes.value.ok) {
            const json = await testsRes.value.json() as { data?: Array<{ slug: string }>; items?: Array<{ slug: string }> }
            const items = json.data ?? json.items ?? []
            testSlugs = items.map((p) => p.slug)
        }

        if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
            const json = await productsRes.value.json() as { data?: Array<{ slug: string }>; items?: Array<{ slug: string }> }
            const items = json.data ?? json.items ?? []
            productSlugs = items.map((p) => p.slug)
        }
    } catch {
        // silently fall back to empty arrays — static routes are always present
    }

    const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
        url: `${BASE_URL}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }))

    const testRoutes: MetadataRoute.Sitemap = testSlugs.map((slug) => ({
        url: `${BASE_URL}/tests/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    }))

    const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
        url: `${BASE_URL}/shop/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
    }))

    return [...staticRoutes, ...blogRoutes, ...testRoutes, ...productRoutes]
}
