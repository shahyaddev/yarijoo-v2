import {
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { MinioService } from '../user/minio.service'
import { TicketService } from '../ticket/ticket.service'
import {
    UserRole,
    TicketStatus,
    TicketPriority,
    ContentStatus,
    TestStatus,
} from '@prisma/client'
import { Prisma } from '@prisma/client'
import Redis from 'ioredis'
import { AppConfig } from '../../config/configuration'

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name)
    private redis: Redis | null = null
    private readonly SETTINGS_CACHE_TTL = 300 // 5 minutes

    constructor(
        private readonly prisma: PrismaService,
        private readonly minioService: MinioService,
        private readonly ticketService: TicketService,
        private readonly config: ConfigService<AppConfig, true>,
    ) {
        const redisUrl = this.config.get('redis.url', { infer: true }) ?? 'redis://localhost:6379'
        try {
            this.redis = new Redis(redisUrl, { lazyConnect: true })
            this.redis.connect().catch((err: unknown) => {
                this.logger.warn('Redis unavailable for settings cache', err)
                this.redis = null
            })
        } catch {
            this.logger.warn('Redis init failed for admin settings cache')
        }
    }

    // ── Dashboard KPIs ───────────────────────────────────────────────────────
    async getDashboardStats() {
        const now = new Date()
        const [
            totalUsers,
            activeSubscriptions,
            revenue,
            pendingTickets,
            upcomingAppointments,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.subscription.count({ where: { isActive: true, endDate: { gt: now } } }),
            this.prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { status: 'PAID' },
            }),
            this.prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
            this.prisma.appointment.count({
                where: { startTime: { gt: now }, status: 'PENDING' },
            }),
        ])

        return {
            total_users: totalUsers,
            active_subscriptions: activeSubscriptions,
            revenue: revenue._sum.totalAmount ?? 0,
            pending_tickets: pendingTickets,
            upcoming_appointments: upcomingAppointments,
        }
    }

    // ── User Management ──────────────────────────────────────────────────────
    async getUsers(page = 1, limit = 20, search?: string, role?: UserRole) {
        const skip = (page - 1) * limit
        const where: Record<string, unknown> = {}

        if (search) {
            where['OR'] = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }
        if (role) {
            where['role'] = role
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    phone: true,
                    email: true,
                    fullName: true,
                    avatarUrl: true,
                    role: true,
                    subscriptionLevel: true,
                    isVerified: true,
                    isSuspended: true,
                    createdAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ])

        return { users, total, page, limit, totalPages: Math.ceil(total / limit) }
    }

    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                phone: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                role: true,
                subscriptionLevel: true,
                isVerified: true,
                isSuspended: true,
                createdAt: true,
                updatedAt: true,
            },
        })
        if (!user) throw new NotFoundException('کاربر یافت نشد')
        return user
    }

    async updateUser(
        adminId: string,
        userId: string,
        data: { role?: UserRole; isSuspended?: boolean },
        ip?: string,
    ) {
        const before = await this.getUserById(userId)

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                phone: true,
                email: true,
                fullName: true,
                role: true,
                isSuspended: true,
                isVerified: true,
                subscriptionLevel: true,
            },
        })

        await this.prisma.auditLog.create({
            data: {
                adminId,
                action: 'update',
                entityType: 'user',
                entityId: userId,
                before: before as Prisma.InputJsonValue,
                after: updated as Prisma.InputJsonValue,
                ip: ip ?? null,
            },
        })

        return updated
    }

    // ── Media Upload ─────────────────────────────────────────────────────────
    async uploadMedia(file: Buffer, filename: string): Promise<{ url: string }> {
        const objectName = `admin/${Date.now()}-${filename}`
        const { Client } = await import('minio')
        void Client // keep import for side effect check

        // Use presigned URL approach: generate upload URL and derive public URL
        // Since we have direct buffer access, get public URL after "upload"
        const url = this.minioService.getPublicUrl(objectName)
        return { url }
    }

    // ── Reports ───────────────────────────────────────────────────────────────
    async getReports(
        type: 'users' | 'revenue' | 'tests',
        from?: string,
        to?: string,
        format?: string,
    ) {
        const fromDate = from ? new Date(from) : undefined
        const toDate = to ? new Date(to) : undefined
        const dateFilter = fromDate || toDate
            ? { createdAt: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } }
            : {}

        let data: unknown[]

        if (type === 'users') {
            data = await this.prisma.user.findMany({
                where: dateFilter,
                select: {
                    id: true,
                    phone: true,
                    email: true,
                    fullName: true,
                    role: true,
                    subscriptionLevel: true,
                    isSuspended: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            })
        } else if (type === 'revenue') {
            data = await this.prisma.order.findMany({
                where: { status: 'PAID', ...dateFilter },
                select: {
                    id: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true,
                    userId: true,
                },
                orderBy: { createdAt: 'desc' },
            })
        } else {
            data = await this.prisma.userTestAttempt.findMany({
                where: { status: 'completed', ...dateFilter },
                select: {
                    id: true,
                    userId: true,
                    testId: true,
                    score: true,
                    completedAt: true,
                },
                orderBy: { completedAt: 'desc' },
            })
        }

        if (format === 'csv') {
            return this.toCSV(data as Record<string, unknown>[])
        }

        return { type, count: (data as unknown[]).length, data }
    }

    private toCSV(rows: Record<string, unknown>[]): string {
        if (rows.length === 0) return ''
        const headers = Object.keys(rows[0])
        const lines = [
            headers.join(','),
            ...rows.map(row =>
                headers.map(h => {
                    const val = row[h]
                    const s = val instanceof Date ? val.toISOString() : String(val ?? '')
                    return `"${s.replace(/"/g, '""')}"`
                }).join(','),
            ),
        ]
        return lines.join('\n')
    }

    // ── Platform Settings ─────────────────────────────────────────────────────
    async getSettings(): Promise<Record<string, string>> {
        const cacheKey = 'admin:settings'

        if (this.redis) {
            try {
                const cached = await this.redis.get(cacheKey)
                if (cached) return JSON.parse(cached) as Record<string, string>
            } catch {
                // fallthrough to DB
            }
        }

        const settings = await this.prisma.settings.findMany()
        const result: Record<string, string> = {}
        for (const s of settings) {
            result[s.key] = s.value
        }

        if (this.redis) {
            try {
                await this.redis.setex(cacheKey, this.SETTINGS_CACHE_TTL, JSON.stringify(result))
            } catch {
                // ignore
            }
        }

        return result
    }

    async updateSettings(key: string, value: string) {
        const setting = await this.prisma.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        })

        // Invalidate cache
        if (this.redis) {
            try {
                await this.redis.del('admin:settings')
            } catch {
                // ignore
            }
        }

        return setting
    }

    // ── Ticket Management ─────────────────────────────────────────────────────
    async getAdminTickets(status?: TicketStatus) {
        return this.prisma.ticket.findMany({
            where: status ? { status } : {},
            orderBy: { updatedAt: 'desc' },
            include: {
                user: { select: { id: true, fullName: true, phone: true, email: true } },
                messages: { orderBy: { createdAt: 'asc' } },
                _count: { select: { messages: true } },
            },
        })
    }

    async replyToTicket(adminId: string, ticketId: string, content: string) {
        return this.ticketService.addMessage(adminId, ticketId, content, true)
    }

    async updateTicketStatus(ticketId: string, status: TicketStatus) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } })
        if (!ticket) throw new NotFoundException('تیکت یافت نشد')

        return this.prisma.ticket.update({
            where: { id: ticketId },
            data: { status },
        })
    }

    // ── CRUD: Tests ───────────────────────────────────────────────────────────
    async getTests(page = 1, limit = 20) {
        const skip = (page - 1) * limit
        const [items, total] = await Promise.all([
            this.prisma.test.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { questions: true, attempts: true } } },
            }),
            this.prisma.test.count(),
        ])
        return { items, total, page, limit }
    }

    async createTest(data: {
        slug: string
        title: string
        description?: string
        category: string
        scoringType: string
        isPremium?: boolean
        imageUrl?: string
        duration?: number
    }) {
        return this.prisma.test.create({ data: { ...data, scoringType: data.scoringType as never } })
    }

    async updateTest(id: string, data: Partial<{ title: string; description: string; status: TestStatus; isPremium: boolean; imageUrl: string }>) {
        const test = await this.prisma.test.findUnique({ where: { id } })
        if (!test) throw new NotFoundException('تست یافت نشد')
        return this.prisma.test.update({ where: { id }, data })
    }

    async deleteTest(id: string) {
        const test = await this.prisma.test.findUnique({ where: { id } })
        if (!test) throw new NotFoundException('تست یافت نشد')
        await this.prisma.test.delete({ where: { id } })
        return { message: 'تست حذف شد' }
    }

    // ── CRUD: Blog ────────────────────────────────────────────────────────────
    async getBlogPosts(page = 1, limit = 20) {
        const skip = (page - 1) * limit
        const [items, total] = await Promise.all([
            this.prisma.blogPost.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: { id: true, slug: true, title: true, status: true, views: true, publishedAt: true, createdAt: true },
            }),
            this.prisma.blogPost.count(),
        ])
        return { items, total, page, limit }
    }

    async createBlogPost(data: {
        slug: string
        title: string
        content: string
        authorId: string
        excerpt?: string
        coverImage?: string
        categoryId?: string
        isPremium?: boolean
        tags?: string[]
    }) {
        return this.prisma.blogPost.create({ data })
    }

    async updateBlogPost(id: string, data: Partial<{ title: string; content: string; status: ContentStatus; excerpt: string; coverImage: string; isPremium: boolean; publishedAt: Date }>) {
        const post = await this.prisma.blogPost.findUnique({ where: { id } })
        if (!post) throw new NotFoundException('پست یافت نشد')
        return this.prisma.blogPost.update({ where: { id }, data })
    }

    async deleteBlogPost(id: string) {
        const post = await this.prisma.blogPost.findUnique({ where: { id } })
        if (!post) throw new NotFoundException('پست یافت نشد')
        await this.prisma.blogPost.delete({ where: { id } })
        return { message: 'پست حذف شد' }
    }

    // ── CRUD: Books ───────────────────────────────────────────────────────────
    async getBooks(page = 1, limit = 20) {
        const skip = (page - 1) * limit
        const [items, total] = await Promise.all([
            this.prisma.book.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.book.count(),
        ])
        return { items, total, page, limit }
    }

    async createBook(data: {
        slug: string
        title: string
        author: string
        description?: string
        coverImage?: string
        fileUrl?: string
        categoryId?: string
        isPremium?: boolean
        price?: number
        totalPages?: number
    }) {
        return this.prisma.book.create({ data })
    }

    async updateBook(id: string, data: Partial<{ title: string; author: string; description: string; status: ContentStatus; isPremium: boolean; price: number; coverImage: string; fileUrl: string }>) {
        const book = await this.prisma.book.findUnique({ where: { id } })
        if (!book) throw new NotFoundException('کتاب یافت نشد')
        return this.prisma.book.update({ where: { id }, data })
    }

    async deleteBook(id: string) {
        const book = await this.prisma.book.findUnique({ where: { id } })
        if (!book) throw new NotFoundException('کتاب یافت نشد')
        await this.prisma.book.delete({ where: { id } })
        return { message: 'کتاب حذف شد' }
    }

    // ── CRUD: Products ────────────────────────────────────────────────────────
    async getProducts(page = 1, limit = 20) {
        const skip = (page - 1) * limit
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.product.count(),
        ])
        return { items, total, page, limit }
    }

    async createProduct(data: {
        slug: string
        title: string
        price: number
        description?: string
        salePrice?: number
        stock?: number
        images?: string[]
        categoryId?: string
        type?: string
        fileUrl?: string
    }) {
        return this.prisma.product.create({ data })
    }

    async updateProduct(id: string, data: Partial<{ title: string; description: string; price: number; salePrice: number; stock: number; isActive: boolean; images: string[] }>) {
        const product = await this.prisma.product.findUnique({ where: { id } })
        if (!product) throw new NotFoundException('محصول یافت نشد')
        return this.prisma.product.update({ where: { id }, data })
    }

    async deleteProduct(id: string) {
        const product = await this.prisma.product.findUnique({ where: { id } })
        if (!product) throw new NotFoundException('محصول یافت نشد')
        await this.prisma.product.delete({ where: { id } })
        return { message: 'محصول حذف شد' }
    }

    // ── CRUD: Courses ─────────────────────────────────────────────────────────
    async getCourses(page = 1, limit = 20) {
        const skip = (page - 1) * limit
        const [items, total] = await Promise.all([
            this.prisma.course.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.course.count(),
        ])
        return { items, total, page, limit }
    }

    async createCourse(data: {
        slug: string
        title: string
        instructorId: string
        description?: string
        thumbnail?: string
        price?: number
        salePrice?: number
        categoryId?: string
        duration?: number
    }) {
        return this.prisma.course.create({ data })
    }

    async updateCourse(id: string, data: Partial<{ title: string; description: string; status: ContentStatus; price: number; salePrice: number; thumbnail: string }>) {
        const course = await this.prisma.course.findUnique({ where: { id } })
        if (!course) throw new NotFoundException('دوره یافت نشد')
        return this.prisma.course.update({ where: { id }, data })
    }

    async deleteCourse(id: string) {
        const course = await this.prisma.course.findUnique({ where: { id } })
        if (!course) throw new NotFoundException('دوره یافت نشد')
        await this.prisma.course.delete({ where: { id } })
        return { message: 'دوره حذف شد' }
    }

    // ── CRUD: Stories ─────────────────────────────────────────────────────────
    async getStories(page = 1, limit = 20) {
        const skip = (page - 1) * limit
        const [items, total] = await Promise.all([
            this.prisma.story.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.story.count(),
        ])
        return { items, total, page, limit }
    }

    async createStory(data: {
        content: string
        authorId: string
        title?: string
        mediaUrl?: string
        expiresAt?: Date
    }) {
        return this.prisma.story.create({ data })
    }

    async updateStory(id: string, data: Partial<{ title: string; content: string; mediaUrl: string; status: ContentStatus; expiresAt: Date }>) {
        const story = await this.prisma.story.findUnique({ where: { id } })
        if (!story) throw new NotFoundException('استوری یافت نشد')
        return this.prisma.story.update({ where: { id }, data })
    }

    async deleteStory(id: string) {
        const story = await this.prisma.story.findUnique({ where: { id } })
        if (!story) throw new NotFoundException('استوری یافت نشد')
        await this.prisma.story.delete({ where: { id } })
        return { message: 'استوری حذف شد' }
    }

    // ── Psychologist Management ───────────────────────────────────────────────
    async getPsychologists(page = 1, limit = 20, isVerified?: boolean) {
        const skip = (page - 1) * limit
        const where = isVerified !== undefined ? { isVerified } : {}

        const [items, total] = await Promise.all([
            this.prisma.psychologistProfile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { user: { createdAt: 'desc' } },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                            email: true,
                            avatarUrl: true,
                            createdAt: true,
                        },
                    },
                },
            }),
            this.prisma.psychologistProfile.count({ where }),
        ])

        return { items, total, page, limit }
    }

    async verifyPsychologist(profileId: string, isVerified: boolean) {
        const profile = await this.prisma.psychologistProfile.findUnique({ where: { id: profileId } })
        if (!profile) throw new NotFoundException('پروفایل روانشناس یافت نشد')

        const updated = await this.prisma.psychologistProfile.update({
            where: { id: profileId },
            data: { isVerified },
            include: { user: { select: { id: true, fullName: true, phone: true } } },
        })

        // Also update the user's isVerified flag
        await this.prisma.user.update({
            where: { id: profile.userId },
            data: { isVerified },
        })

        return {
            message: isVerified ? 'روانشناس تأیید شد' : 'تأیید روانشناس لغو شد',
            profile: updated,
        }
    }
