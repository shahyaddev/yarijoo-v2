import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { ContentStatus, TestStatus } from '@prisma/client'
import Redis from 'ioredis'
import { AppConfig } from '../../config/configuration'

export interface SearchResultItem {
    id: string
    type: 'blog' | 'book' | 'test' | 'course' | 'psychologist'
    title: string
    slug?: string
    excerpt?: string
    imageUrl?: string
    [key: string]: unknown
}

export interface SearchResult {
    items: SearchResultItem[]
    total: number
    page: number
    limit: number
    totalPages: number
    query: string
    type: string
}

export type SearchType = 'all' | 'blog' | 'book' | 'test' | 'course' | 'psychologist'

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name)
    private redis: Redis | null = null

    private readonly SEARCH_TTL = 5 * 60   // 5 minutes
    private readonly AUTOCOMPLETE_TTL = 2 * 60 // 2 minutes
    private readonly AUTOCOMPLETE_LIMIT = 8

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService<AppConfig, true>,
    ) {
        const redisUrl = this.config.get('redis.url', { infer: true }) ?? 'redis://localhost:6379'
        try {
            this.redis = new Redis(redisUrl, { lazyConnect: true })
            this.redis.connect().catch((err: unknown) => {
                this.logger.warn('Redis unavailable for search cache', err)
                this.redis = null
            })
        } catch {
            this.logger.warn('Redis init failed for search service')
        }
    }

    // ── Public search ────────────────────────────────────────────────────────

    async search(
        query: string,
        type: SearchType = 'all',
        page = 1,
        limit = 10,
        userId?: string,
    ): Promise<SearchResult> {
        const cacheKey = `search:${type}:${query}:${page}`

        // Try cache first
        const cached = await this.getFromCache<SearchResult>(cacheKey)
        if (cached) return cached

        // Run parallel queries
        const items = await this.runSearchQueries(query, type, page, limit)
        const total = items.length // approximate for merged results

        const result: SearchResult = {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            query,
            type,
        }

        // Cache results
        await this.setCache(cacheKey, result, this.SEARCH_TTL)

        // Log search term asynchronously (don't await, fire-and-forget)
        this.logSearchTerm(query, userId).catch((err: unknown) =>
            this.logger.warn('Failed to log search term', err),
        )

        return result
    }

    // ── Autocomplete ────────────────────────────────────────────────────────

    async autocomplete(query: string): Promise<{ title: string; type: string; slug?: string }[]> {
        if (!query || query.trim().length === 0) return []

        const cacheKey = `autocomplete:${query}`

        // Try cache first
        const cached = await this.getFromCache<{ title: string; type: string; slug?: string }[]>(cacheKey)
        if (cached) return cached

        const lim = this.AUTOCOMPLETE_LIMIT
        const mode = 'insensitive' as const

        // Parallel ILIKE searches on title fields only
        const [blogs, books, tests, courses] = await Promise.all([
            this.prisma.blogPost.findMany({
                where: {
                    status: ContentStatus.PUBLISHED,
                    title: { contains: query, mode },
                },
                take: lim,
                select: { title: true, slug: true },
            }),
            this.prisma.book.findMany({
                where: {
                    status: ContentStatus.PUBLISHED,
                    title: { contains: query, mode },
                },
                take: lim,
                select: { title: true, slug: true },
            }),
            this.prisma.test.findMany({
                where: {
                    status: TestStatus.PUBLISHED,
                    title: { contains: query, mode },
                },
                take: lim,
                select: { title: true, slug: true },
            }),
            this.prisma.course.findMany({
                where: {
                    status: ContentStatus.PUBLISHED,
                    title: { contains: query, mode },
                },
                take: lim,
                select: { title: true, slug: true },
            }),
        ])

        // Merge, deduplicate by title, slice to limit
        const merged: { title: string; type: string; slug?: string }[] = [
            ...blogs.map(b => ({ title: b.title, type: 'blog', slug: b.slug })),
            ...books.map(b => ({ title: b.title, type: 'book', slug: b.slug })),
            ...tests.map(t => ({ title: t.title, type: 'test', slug: t.slug })),
            ...courses.map(c => ({ title: c.title, type: 'course', slug: c.slug })),
        ]

        const seen = new Set<string>()
        const unique = merged.filter(item => {
            if (seen.has(item.title)) return false
            seen.add(item.title)
            return true
        })

        const result = unique.slice(0, this.AUTOCOMPLETE_LIMIT)

        await this.setCache(cacheKey, result, this.AUTOCOMPLETE_TTL)
        return result
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private async runSearchQueries(
        query: string,
        type: SearchType,
        page: number,
        limit: number,
    ): Promise<SearchResultItem[]> {
        const skip = (page - 1) * limit
        const mode = 'insensitive' as const

        const shouldSearch = (t: Exclude<SearchType, 'all'>) => type === 'all' || type === t

        const [blogs, books, tests, courses, psychologists] = await Promise.all([
            shouldSearch('blog')
                ? this.prisma.blogPost.findMany({
                    where: {
                        status: ContentStatus.PUBLISHED,
                        OR: [
                            { title: { contains: query, mode } },
                            { excerpt: { contains: query, mode } },
                            { content: { contains: query, mode } },
                        ],
                    },
                    skip: type === 'blog' ? skip : 0,
                    take: type === 'blog' ? limit : limit,
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        excerpt: true,
                        coverImage: true,
                        publishedAt: true,
                    },
                })
                : Promise.resolve([]),

            shouldSearch('book')
                ? this.prisma.book.findMany({
                    where: {
                        status: ContentStatus.PUBLISHED,
                        OR: [
                            { title: { contains: query, mode } },
                            { description: { contains: query, mode } },
                        ],
                    },
                    skip: type === 'book' ? skip : 0,
                    take: type === 'book' ? limit : limit,
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        description: true,
                        coverImage: true,
                        author: true,
                    },
                })
                : Promise.resolve([]),

            shouldSearch('test')
                ? this.prisma.test.findMany({
                    where: {
                        status: TestStatus.PUBLISHED,
                        OR: [
                            { title: { contains: query, mode } },
                            { description: { contains: query, mode } },
                        ],
                    },
                    skip: type === 'test' ? skip : 0,
                    take: type === 'test' ? limit : limit,
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        description: true,
                        imageUrl: true,
                        category: true,
                    },
                })
                : Promise.resolve([]),

            shouldSearch('course')
                ? this.prisma.course.findMany({
                    where: {
                        status: ContentStatus.PUBLISHED,
                        OR: [
                            { title: { contains: query, mode } },
                            { description: { contains: query, mode } },
                        ],
                    },
                    skip: type === 'course' ? skip : 0,
                    take: type === 'course' ? limit : limit,
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        description: true,
                        thumbnail: true,
                        rating: true,
                    },
                })
                : Promise.resolve([]),

            shouldSearch('psychologist')
                ? this.prisma.psychologistProfile.findMany({
                    where: {
                        isVerified: true,
                        OR: [
                            { bio: { contains: query, mode } },
                            {
                                user: {
                                    fullName: { contains: query, mode },
                                },
                            },
                        ],
                    },
                    skip: type === 'psychologist' ? skip : 0,
                    take: type === 'psychologist' ? limit : limit,
                    select: {
                        id: true,
                        bio: true,
                        specialty: true,
                        rating: true,
                        user: {
                            select: {
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                })
                : Promise.resolve([]),
        ])

        // Normalise to SearchResultItem shape
        const blogItems: SearchResultItem[] = blogs.map(b => ({
            id: b.id,
            type: 'blog',
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt ?? undefined,
            imageUrl: b.coverImage ?? undefined,
            publishedAt: b.publishedAt,
        }))

        const bookItems: SearchResultItem[] = books.map(b => ({
            id: b.id,
            type: 'book',
            title: b.title,
            slug: b.slug,
            excerpt: b.description ?? undefined,
            imageUrl: b.coverImage ?? undefined,
            author: b.author,
        }))

        const testItems: SearchResultItem[] = tests.map(t => ({
            id: t.id,
            type: 'test',
            title: t.title,
            slug: t.slug,
            excerpt: t.description ?? undefined,
            imageUrl: t.imageUrl ?? undefined,
            category: t.category,
        }))

        const courseItems: SearchResultItem[] = courses.map(c => ({
            id: c.id,
            type: 'course',
            title: c.title,
            slug: c.slug,
            excerpt: c.description ?? undefined,
            imageUrl: c.thumbnail ?? undefined,
            rating: c.rating,
        }))

        const psychologistItems: SearchResultItem[] = psychologists.map(p => ({
            id: p.id,
            type: 'psychologist',
            title: p.user.fullName ?? 'روانشناس',
            imageUrl: p.user.avatarUrl ?? undefined,
            excerpt: p.bio ?? undefined,
            specialty: p.specialty,
            rating: p.rating,
        }))

        const all = [
            ...blogItems,
            ...bookItems,
            ...testItems,
            ...courseItems,
            ...psychologistItems,
        ]

        // When type='all', apply global skip/limit
        if (type === 'all') {
            return all.slice((page - 1) * limit, page * limit)
        }

        return all
    }

    private async logSearchTerm(term: string, userId?: string): Promise<void> {
        if (!term || term.trim().length === 0) return

        try {
            // Try to find existing log for this term (and userId if provided)
            const existing = await this.prisma.searchLog.findFirst({
                where: {
                    term,
                    userId: userId ?? null,
                },
            })

            if (existing) {
                await this.prisma.searchLog.update({
                    where: { id: existing.id },
                    data: { count: { increment: 1 } },
                })
            } else {
                await this.prisma.searchLog.create({
                    data: {
                        term,
                        userId: userId ?? null,
                        count: 1,
                    },
                })
            }
        } catch (err) {
            this.logger.warn('Search log persistence failed', err)
        }
    }

    private async getFromCache<T>(key: string): Promise<T | null> {
        if (!this.redis) return null
        try {
            const cached = await this.redis.get(key)
            if (cached) return JSON.parse(cached) as T
        } catch (err) {
            this.logger.warn(`Redis get failed for key ${key}`, err)
        }
        return null
    }

    private async setCache(key: string, value: unknown, ttl: number): Promise<void> {
        if (!this.redis) return
        try {
            await this.redis.setex(key, ttl, JSON.stringify(value))
        } catch (err) {
            this.logger.warn(`Redis set failed for key ${key}`, err)
        }
    }
}
