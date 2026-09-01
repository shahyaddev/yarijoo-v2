import { PrismaClient } from '@prisma/client'
import mysql2 from 'mysql2/promise'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
    const conn = await mysql2.createConnection('mysql://root@localhost:3306/yarijoo_legacy')

    // Get gallery images mapped to product slugs
    const [rows] = await conn.query(`
        SELECT sp.slug, sp.title, MIN(g.image) as image
        FROM gallery g 
        JOIN shop_products sp ON sp.id = g.product_id 
        WHERE sp.deleted_at IS NULL
        GROUP BY sp.id, sp.slug, sp.title
    `)

    console.log(`Updating ${rows.length} product images...`)
    let updated = 0

    for (const row of rows) {
        const imagePath = String(row.image) // "Uploads/shop/6812624da6c60.png"
        const filename = imagePath.split('/').pop()
        const localPath = `/Users/sinamoh/Desktop/yarijoonew1404/yarijoo-v2/frontend/public/uploads/shop/${filename}`
        const publicPath = `/uploads/shop/${filename}`
        const remotePath = `https://api.yarijoo.ir/${imagePath}`

        // Find product by slug (fuzzy match)
        const slugRaw = String(row.slug)
        let product = await prisma.product.findFirst({
            where: { title: String(row.title) }
        })

        if (!product) {
            console.log(`  Not found: ${String(row.title).substring(0, 40)}`)
            continue
        }

        const finalPath = existsSync(localPath) ? publicPath : remotePath
        await prisma.product.update({
            where: { id: product.id },
            data: { images: [finalPath] }
        })
        updated++
    }

    console.log(`✅ ${updated} products updated`)
    await conn.end()
    await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
