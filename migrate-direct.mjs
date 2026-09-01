// Direct migration script - bypasses auth
import { PrismaClient } from '@prisma/client'
import mysql2 from 'mysql2/promise'

const prisma = new PrismaClient()

function normalizePhone(phone) {
    const clean = String(phone ?? '').trim().replace(/\s/g, '')
    if (clean.startsWith('+98')) return clean
    if (clean.startsWith('0')) return '+98' + clean.slice(1)
    if (/^9\d{9}$/.test(clean)) return '+98' + clean
    return clean
}

async function main() {
    const conn = await mysql2.createConnection('mysql://root@localhost:3306/yarijoo_legacy')
    console.log('✅ Connected to MySQL')

    // 1. Migrate blog posts
    const [rows] = await conn.query(
        `SELECT id, title, slug, description, content, image, view_count, publish_at FROM blog_posts WHERE deleted_at IS NULL AND status = 'publish' LIMIT 200`
    )

    let systemUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!systemUser) systemUser = await prisma.user.findFirst()

    console.log(`\n📝 Migrating ${rows.length} blog posts...`)
    let migrated = 0, errors = 0
    for (const row of rows) {
        try {
            const slug = String(row.slug ?? '').trim()
            if (!slug || !row.title) continue

            const coverPath = row.image ? String(row.image) : null
            const coverImage = coverPath
                ? (coverPath.startsWith('http') ? coverPath : `https://api.yarijoo.ir${coverPath.startsWith('/') ? '' : '/'}${coverPath}`)
                : null

            await prisma.blogPost.upsert({
                where: { slug },
                update: {},
                create: {
                    slug,
                    title: String(row.title),
                    excerpt: row.description ? String(row.description).substring(0, 500) : null,
                    content: row.content ? String(row.content) : '',
                    coverImage,
                    authorId: systemUser.id,
                    status: 'PUBLISHED',
                    views: Number(row.view_count ?? 0),
                    publishedAt: row.publish_at ? new Date(String(row.publish_at)) : new Date(),
                },
            })
            migrated++
        } catch (err) {
            errors++
            if (errors <= 3) console.error(`  Error: ${err.message?.substring(0, 80)}`)
        }
    }
    console.log(`  ✅ ${migrated} migrated, ${errors} errors`)

    await conn.end()
    await prisma.$disconnect()
    console.log('\n🎉 Migration complete!')
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
