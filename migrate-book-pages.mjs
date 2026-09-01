// Migrate book pages from MySQL to PostgreSQL
import { createConnection } from 'mysql2/promise'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const conn = await createConnection('mysql://root@localhost:3306/yarijoo_legacy')
    console.log('✅ Connected to MySQL')

    const [books] = await conn.query(`
        SELECT b.id as mysql_id, b.slug, b.title, COUNT(bp.id) as page_count
        FROM books b
        INNER JOIN book_pages bp ON bp.book_id = b.id
        GROUP BY b.id
        ORDER BY page_count DESC
    `)

    console.log(`\n📚 Found ${books.length} books with pages`)
    let totalMigrated = 0

    for (const book of books) {
        // Find PG book by slug
        const pgBook = await prisma.book.findFirst({
            where: { slug: { contains: String(book.slug).substring(0, 15) } }
        })
        if (!pgBook) {
            console.log(`  ⚠️  Book not found in PG: ${book.title}`)
            continue
        }

        // Check if already migrated
        const existing = await prisma.$queryRaw`SELECT COUNT(*)::int as c FROM book_pages WHERE book_id = ${pgBook.id}`
        if (Number(existing[0]?.c) > 0) {
            console.log(`  ⏭️  Already: ${pgBook.title}`)
            continue
        }

        const [pages] = await conn.query(
            'SELECT title, content FROM book_pages WHERE book_id = ? ORDER BY id ASC',
            [book.mysql_id]
        )

        let order = 1
        for (const page of pages) {
            await prisma.$executeRaw`
                INSERT INTO book_pages (id, book_id, title, content, page_order, created_at)
                VALUES (gen_random_uuid()::text, ${pgBook.id}, ${page.title}, ${page.content}, ${order}, NOW())
            `
            order++
        }

        await prisma.book.update({
            where: { id: pgBook.id },
            data: { totalPages: pages.length }
        })

        console.log(`  ✅ ${pgBook.title}: ${pages.length} pages`)
        totalMigrated += pages.length
    }

    console.log(`\n🎉 Total: ${totalMigrated} pages migrated!`)
    await conn.end()
    await prisma.$disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
