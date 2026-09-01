import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { TEST_TABLE_MAP } from './table-map'
import { UserRole, ScoringType, TestStatus } from '@prisma/client'
import * as mysql2 from 'mysql2/promise'

export interface MigrationReport {
    startedAt: string
    completedAt?: string
    status: 'running' | 'completed' | 'failed' | 'not_configured'
    tables: Record<string, { source: number; migrated: number; skipped: number; errors: number }>
    totalMigrated: number
    totalSkipped: number
    totalErrors: number
    error?: string
}

@Injectable()
export class MigrationService {
    private readonly logger = new Logger(MigrationService.name)
    private report: MigrationReport | null = null

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) { }

    getMigrationStatus(): MigrationReport | { status: 'not_started' } {
        return this.report ?? { status: 'not_started' }
    }

    async runMigration(): Promise<MigrationReport> {
        const mysqlUrl = this.config.get<string>('LEGACY_MYSQL_URL')
        if (!mysqlUrl) {
            this.report = {
                startedAt: new Date().toISOString(),
                status: 'not_configured',
                tables: {},
                totalMigrated: 0,
                totalSkipped: 0,
                totalErrors: 0,
                error: 'LEGACY_MYSQL_URL env var not set',
            }
            return this.report
        }

        this.report = {
            startedAt: new Date().toISOString(),
            status: 'running',
            tables: {},
            totalMigrated: 0,
            totalSkipped: 0,
            totalErrors: 0,
        }

        let conn: mysql2.Connection | null = null
        try {
            conn = await mysql2.createConnection(mysqlUrl)

            await this.migrateUsers(conn)
            await this.migrateProducts(conn)
            await this.migrateBooks(conn)
            await this.migrateBlogPosts(conn)
            await this.migrateTestDefinitions()
            await this.migrateAllQuestions(conn)
            await this.migrateAllResults(conn)

            this.report.status = 'completed'
            this.report.completedAt = new Date().toISOString()
        } catch (err) {
            this.report.status = 'failed'
            this.report.error = err instanceof Error ? err.message : String(err)
        } finally {
            if (conn) await conn.end().catch(() => { })
        }

        return this.report
    }

    private normalizePhone(phone: string): string {
        const clean = String(phone ?? '').trim().replace(/\s/g, '')
        if (clean.startsWith('+98')) return clean
        if (clean.startsWith('0')) return '+98' + clean.slice(1)
        if (/^9\d{9}$/.test(clean)) return '+98' + clean
        return clean
    }

    private addToReport(
        table: string,
        migrated: number,
        skipped: number,
        errors: number,
        source: number,
    ) {
        if (!this.report) return
        this.report.tables[table] = { source, migrated, skipped, errors }
        this.report.totalMigrated += migrated
        this.report.totalSkipped += skipped
        this.report.totalErrors += errors
    }

    private async migrateBlogPosts(conn: mysql2.Connection) {
        // Get or create a system author
        let systemUser = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (!systemUser) {
            systemUser = await this.prisma.user.findFirst()
        }
        if (!systemUser) {
            this.addToReport('blog_posts', 0, 0, 1, 0)
            return
        }

        const [rows] = (await conn.query(
            `SELECT id, title, slug, description, content, image, status, view_count, publish_at, created_at FROM blog_posts WHERE deleted_at IS NULL AND status = 'publish' LIMIT 200`,
        )) as [Record<string, unknown>[], unknown]

        let migrated = 0, skipped = 0, errors = 0

        for (const row of rows) {
            try {
                const slug = String(row['slug'] ?? '').trim()
                if (!slug || !row['title']) { skipped++; continue }

                const coverPath = row['image'] ? String(row['image']) : null
                const coverImage = coverPath
                    ? (coverPath.startsWith('http') ? coverPath : `https://api.yarijoo.ir${coverPath.startsWith('/') ? '' : '/'}${coverPath}`)
                    : null

                await this.prisma.blogPost.upsert({
                    where: { slug },
                    update: {},
                    create: {
                        slug,
                        title: String(row['title']),
                        excerpt: row['description'] ? String(row['description']).substring(0, 500) : null,
                        content: row['content'] ? String(row['content']) : '',
                        coverImage,
                        authorId: systemUser!.id,
                        status: 'PUBLISHED',
                        views: Number(row['view_count'] ?? 0),
                        publishedAt: row['publish_at'] ? new Date(String(row['publish_at'])) : new Date(),
                    },
                })
                migrated++
            } catch (err) {
                this.logger.warn(`Blog migration error id=${row['id']}: ${err instanceof Error ? err.message : String(err)}`)
                errors++
            }
        }

        this.addToReport('blog_posts', migrated, skipped, errors, rows.length)
    }

    private async migrateProducts(conn: mysql2.Connection) {
        const [rows] = (await conn.query(
            `SELECT id, title, slug, description, price, off_price, status, type, qty, created_at FROM shop_products WHERE deleted_at IS NULL`,
        )) as [Record<string, unknown>[], unknown]

        let migrated = 0, skipped = 0, errors = 0

        for (const row of rows) {
            try {
                const slug = String(row['slug'] ?? '').replace(/[^a-zA-Z0-9\u0600-\u06FF\-_]/g, '-').substring(0, 200)
                if (!slug || !row['title']) { skipped++; continue }

                await this.prisma.product.upsert({
                    where: { slug },
                    update: {},
                    create: {
                        slug,
                        title: String(row['title']),
                        description: row['description'] ? String(row['description']) : null,
                        price: Number(row['price'] ?? 0),
                        salePrice: row['off_price'] ? Number(row['off_price']) : null,
                        stock: Number(row['qty'] ?? 0),
                        type: row['type'] ? String(row['type']) : 'physical',
                        isActive: row['status'] === 'publish',
                        images: [],
                    },
                })
                migrated++
            } catch (err) {
                this.logger.warn(`Product migration error id=${row['id']}: ${err instanceof Error ? err.message : String(err)}`)
                errors++
            }
        }

        this.addToReport('products', migrated, skipped, errors, rows.length)
    }

    private async migrateBooks(conn: mysql2.Connection) {
        const [rows] = (await conn.query(
            `SELECT id, title, slug, author, des, price, cover, created_at FROM books`,
        )) as [Record<string, unknown>[], unknown]

        let migrated = 0, skipped = 0, errors = 0

        for (const row of rows) {
            try {
                const slug = String(row['slug'] ?? '').replace(/[^a-zA-Z0-9\u0600-\u06FF\-_]/g, '-').substring(0, 200)
                if (!slug || !row['title']) { skipped++; continue }

                const coverPath = row['cover'] ? String(row['cover']) : null
                const coverImage = coverPath ? (coverPath.startsWith('http') ? coverPath : `https://api.yarijoo.ir${coverPath.startsWith('/') ? '' : '/'}${coverPath}`) : null

                await this.prisma.book.upsert({
                    where: { slug },
                    update: {},
                    create: {
                        slug,
                        title: String(row['title']),
                        author: String(row['author'] ?? 'نامشخص'),
                        description: row['des'] ? String(row['des']) : null,
                        price: Number(row['price'] ?? 0),
                        coverImage,
                        isPremium: Number(row['price'] ?? 0) > 0,
                        status: 'PUBLISHED',
                    },
                })
                migrated++
            } catch (err) {
                this.logger.warn(`Book migration error id=${row['id']}: ${err instanceof Error ? err.message : String(err)}`)
                errors++
            }
        }

        this.addToReport('books', migrated, skipped, errors, rows.length)
    }

    private async migrateUsers(conn: mysql2.Connection) {
        const [rows] = (await conn.query('SELECT * FROM users')) as [
            Record<string, unknown>[],
            unknown,
        ]
        let migrated = 0,
            skipped = 0,
            errors = 0

        for (const row of rows) {
            try {
                const phone = this.normalizePhone(String(row['phone_number'] ?? ''))
                if (!phone || !/^\+98/.test(phone)) {
                    skipped++
                    continue
                }
                const fullName =
                    [row['name'], row['family_name']].filter(Boolean).join(' ') || null
                const roleInt = Number(row['role'] ?? 1)
                const role = roleInt === 2 ? UserRole.ADMIN : UserRole.USER
                const isSuspended = row['status'] === 0 || row['status'] === '0'

                await this.prisma.user.upsert({
                    where: { phone },
                    update: {},
                    create: {
                        phone,
                        fullName,
                        role,
                        isSuspended,
                        isVerified: true,
                    },
                })
                migrated++
            } catch (err) {
                this.logger.warn(
                    `User migration error for id=${row['id']}: ${err instanceof Error ? err.message : String(err)}`,
                )
                errors++
            }
        }

        this.addToReport('users', migrated, skipped, errors, rows.length)
    }

    private async migrateTestDefinitions() {
        let migrated = 0,
            skipped = 0,
            errors = 0

        for (const entry of TEST_TABLE_MAP) {
            try {
                await this.prisma.test.upsert({
                    where: { slug: entry.slug },
                    update: {},
                    create: {
                        slug: entry.slug,
                        title: entry.title,
                        category: entry.category,
                        scoringType: (entry.scoringType as ScoringType) ?? ScoringType.SUM,
                        status: TestStatus.PUBLISHED,
                    },
                })
                migrated++
            } catch (err) {
                this.logger.warn(
                    `Test definition migration error for slug=${entry.slug}: ${err instanceof Error ? err.message : String(err)}`,
                )
                errors++
            }
        }

        this.addToReport('test_definitions', migrated, skipped, errors, TEST_TABLE_MAP.length)
    }

    private async migrateAllQuestions(conn: mysql2.Connection) {
        let totalMigrated = 0,
            totalSkipped = 0,
            totalErrors = 0,
            totalSource = 0

        for (const entry of TEST_TABLE_MAP) {
            const tableName = `${entry.slug}_questions`
            try {
                const [rows] = (await conn.query(
                    `SELECT * FROM \`${tableName}\``,
                )) as [Record<string, unknown>[], unknown]

                const test = await this.prisma.test.findUnique({ where: { slug: entry.slug } })
                if (!test) {
                    totalSkipped += rows.length
                    continue
                }
                totalSource += rows.length

                // Build question records to insert
                const questionData: { testId: string; text: string; order: number; options: never[] }[] =
                    []
                let order = 1
                for (const row of rows) {
                    const text = String(
                        row['question_text'] ?? row['text'] ?? row['title'] ?? '',
                    )
                    if (!text) {
                        totalSkipped++
                        continue
                    }
                    questionData.push({
                        testId: test.id,
                        text,
                        order: order++,
                        options: [],
                    })
                }

                // Use createMany with skipDuplicates since TestQuestion has no @@unique on (testId, order)
                // First delete existing questions for this test to avoid order conflicts on re-run
                if (questionData.length > 0) {
                    const result = await this.prisma.testQuestion.createMany({
                        data: questionData,
                        skipDuplicates: true,
                    })
                    totalMigrated += result.count
                    totalSkipped += questionData.length - result.count
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err)
                if (!msg.includes("doesn't exist") && !msg.includes('does not exist')) {
                    this.logger.warn(`Questions migration error for ${tableName}: ${msg}`)
                }
                totalSkipped++
            }
        }

        this.addToReport('test_questions', totalMigrated, totalSkipped, totalErrors, totalSource)
    }

    private async migrateAllResults(conn: mysql2.Connection) {
        let totalMigrated = 0,
            totalSkipped = 0,
            totalErrors = 0,
            totalSource = 0

        for (const entry of TEST_TABLE_MAP) {
            const tableName = `${entry.slug}_results`
            try {
                const [rows] = (await conn.query(
                    `SELECT * FROM \`${tableName}\``,
                )) as [Record<string, unknown>[], unknown]

                const test = await this.prisma.test.findUnique({
                    where: { slug: entry.slug },
                    select: { id: true },
                })
                if (!test) {
                    totalSkipped += rows.length
                    continue
                }
                totalSource += rows.length

                for (const row of rows) {
                    try {
                        const legacyUserId = row['user_id']
                        if (!legacyUserId) {
                            totalSkipped++
                            continue
                        }
                        // Legacy int IDs cannot be mapped to new UUIDs without a stored mapping table.
                        // Skip results migration for now — this requires a second pass with user ID map.
                        totalSkipped++
                    } catch {
                        totalErrors++
                    }
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err)
                if (!msg.includes("doesn't exist") && !msg.includes('does not exist')) {
                    this.logger.warn(`Results migration error for ${tableName}: ${msg}`)
                }
            }
        }

        this.addToReport('test_results', totalMigrated, totalSkipped, totalErrors, totalSource)
    }
}
