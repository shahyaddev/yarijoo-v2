// Migrate stories from MySQL to PostgreSQL
import { PrismaClient } from '@prisma/client'
import mysql2 from 'mysql2/promise'

const prisma = new PrismaClient()

async function main() {
    const conn = await mysql2.createConnection('mysql://root@localhost:3306/yarijoo_legacy')
    console.log('✅ Connected to MySQL')

    // Get admin user for authorId
    const adminUser = await prisma.user.findFirst({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } })
    if (!adminUser) { console.error('No admin user found'); process.exit(1) }

    // Migrate stories (داستان‌های روانشناسی)
    const [rows] = await conn.query(
        `SELECT id, title, slug, cover, des, price, created_at FROM stories WHERE deleted_at IS NULL ORDER BY id ASC`
    )
    console.log(`\n📖 Migrating ${rows.length} stories...`)
    let migrated = 0, errors = 0

    for (const row of rows) {
        try {
            const coverPath = row.cover ? String(row.cover) : null
            const coverImage = coverPath
                ? `https://api.yarijoo.ir/${coverPath.replace(/^\//, '')}`
                : null

            // Stories in v2 schema have: title, content, mediaUrl, authorId, status
            // We store cover as mediaUrl and des as content
            await prisma.story.upsert({
                where: { id: `legacy-${row.id}` },
                update: {},
                create: {
                    id: `legacy-${row.id}`,
                    title: String(row.title ?? ''),
                    content: row.des ? String(row.des).substring(0, 2000) : String(row.title ?? ''),
                    mediaUrl: coverImage,
                    authorId: adminUser.id,
                    status: 'PUBLISHED',
                    expiresAt: null,
                },
            })
            migrated++
        } catch (err) {
            errors++
            if (errors <= 3) console.error(`  Error id=${row.id}: ${err.message?.substring(0, 80)}`)
        }
    }
    console.log(`  ✅ ${migrated} stories migrated, ${errors} errors`)

    await conn.end()
    await prisma.$disconnect()
    console.log('\n🎉 Done!')
}

main().catch(e => { console.error(e); process.exit(1) })
