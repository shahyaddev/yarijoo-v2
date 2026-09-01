// Update book cover images in PostgreSQL from MySQL data
import { PrismaClient } from '@prisma/client'
import mysql2 from 'mysql2/promise'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
    const conn = await mysql2.createConnection('mysql://root@localhost:3306/yarijoo_legacy')
    console.log('✅ Connected to MySQL')

    // Get all books with covers from MySQL
    const [rows] = await conn.query(
        `SELECT title, slug, cover FROM books WHERE cover IS NOT NULL`
    )

    console.log(`\n📚 Updating ${rows.length} book images...`)
    let updated = 0, skipped = 0, notFound = 0

    for (const row of rows) {
        try {
            // cover is like "Uploads/books/6913a54e215ba.jpg"
            const coverPath = String(row.cover)
            const filename = coverPath.split('/').pop() // "6913a54e215ba.jpg"

            // Check if file exists locally
            const localPath = `/Users/sinamoh/Desktop/yarijoonew1404/yarijoo-v2/frontend/public/uploads/books/${filename}`
            const publicPath = `/uploads/books/${filename}`

            // Try to find the book by slug
            const slug = String(row.slug)
            const book = await prisma.book.findFirst({
                where: { slug: { contains: slug.substring(0, 20) } }
            })

            if (!book) {
                // Try by title
                const bookByTitle = await prisma.book.findFirst({
                    where: { title: String(row.title) }
                })
                if (!bookByTitle) { skipped++; continue }

                if (existsSync(localPath)) {
                    await prisma.book.update({
                        where: { id: bookByTitle.id },
                        data: { coverImage: publicPath }
                    })
                    updated++
                } else {
                    // File not in zip, use remote URL
                    await prisma.book.update({
                        where: { id: bookByTitle.id },
                        data: { coverImage: `https://api.yarijoo.ir/${coverPath}` }
                    })
                    notFound++
                }
                continue
            }

            if (existsSync(localPath)) {
                await prisma.book.update({
                    where: { id: book.id },
                    data: { coverImage: publicPath }
                })
                updated++
            } else {
                await prisma.book.update({
                    where: { id: book.id },
                    data: { coverImage: `https://api.yarijoo.ir/${coverPath}` }
                })
                notFound++
            }
        } catch (err) {
            skipped++
        }
    }

    console.log(`  ✅ ${updated} updated with local image`)
    console.log(`  🌐 ${notFound} updated with remote URL`)
    console.log(`  ⏭️  ${skipped} skipped`)

    await conn.end()
    await prisma.$disconnect()
    console.log('\n🎉 Done!')
}

main().catch(e => { console.error(e); process.exit(1) })
