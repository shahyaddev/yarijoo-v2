/**
 * update-all-images.mjs
 * Updates image paths in PostgreSQL using MySQL as source.
 *
 * Run: /usr/local/bin/node --env-file=backend/.env update-all-images.mjs
 */

import { createConnection } from 'mysql2/promise'
import { PrismaClient } from '@prisma/client'
import { existsSync } from 'fs'
import { basename } from 'path'

const PUBLIC_DIR = '/Users/sinamoh/Desktop/yarijoonew1404/yarijoo-v2/frontend/public'

const prisma = new PrismaClient()

async function getMySQL() {
    return createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'yarijoo_legacy',
    })
}

/* ── helpers ─────────────────────────────────────────────────────── */

function localExists(subdir, filename) {
    const p = `${PUBLIC_DIR}/uploads/${subdir}/${filename}`
    return existsSync(p)
}

/** Given a raw MySQL image path like "Uploads/blog/abc.jpg" return
 *  - local:  /uploads/blog/abc.jpg   if the file exists locally
 *  - remote: https://api.yarijoo.ir/Uploads/blog/abc.jpg  otherwise
 */
function resolveImage(subdir, rawPath) {
    if (!rawPath) return null
    const filename = basename(rawPath)
    if (localExists(subdir, filename)) {
        return `/uploads/${subdir}/${filename}`
    }
    // Fall back to remote
    const clean = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    return `https://api.yarijoo.ir${clean}`
}

/* ── Blog posts ──────────────────────────────────────────────────── */
async function updateBlogPosts(mysql) {
    console.log('\n🔵 Blog posts…')
    const [rows] = await mysql.query(
        'SELECT slug, image FROM blog_posts WHERE image IS NOT NULL AND deleted_at IS NULL'
    )
    console.log(`   Found ${rows.length} posts with images in MySQL.`)

    let updated = 0
    let skipped = 0

    for (const row of rows) {
        const newUrl = resolveImage('blog', row.image)
        if (!newUrl) { skipped++; continue }

        try {
            const result = await prisma.blogPost.updateMany({
                where: { slug: row.slug },
                data: { coverImage: newUrl },
            })
            if (result.count > 0) {
                updated++
                console.log(`   ✅ ${row.slug} → ${newUrl}`)
            } else {
                skipped++
                console.log(`   ⚠️  ${row.slug} not found in PG`)
            }
        } catch (e) {
            console.error(`   ❌ ${row.slug}: ${e.message}`)
            skipped++
        }
    }

    console.log(`   Done: ${updated} updated, ${skipped} skipped.`)
}

/* ── Shop products (no image column in shop_products; skip) ─────── */
async function updateShopProducts(mysql) {
    console.log('\n🔵 Shop products…')

    // Check if shop_product_images table exists
    const [tables] = await mysql.query(
        "SHOW TABLES LIKE 'shop_product_images'"
    )
    if (tables.length === 0) {
        console.log('   shop_product_images table does not exist — skipping.')
        return
    }

    const [rows] = await mysql.query('SELECT slug, image FROM shop_product_images WHERE image IS NOT NULL')
    console.log(`   Found ${rows.length} product images.`)

    let updated = 0
    let skipped = 0

    for (const row of rows) {
        const newUrl = resolveImage('shop', row.image)
        if (!newUrl) { skipped++; continue }
        // ShopProduct images are stored as JSON array; we update the first image
        try {
            const product = await prisma.shopProduct.findUnique({ where: { slug: row.slug } })
            if (!product) { skipped++; continue }

            const existingImages = product.images ?? []
            const newImages = [newUrl, ...existingImages.slice(1)]
            await prisma.shopProduct.update({
                where: { slug: row.slug },
                data: { images: newImages },
            })
            updated++
            console.log(`   ✅ ${row.slug} → ${newUrl}`)
        } catch (e) {
            console.error(`   ❌ ${row.slug}: ${e.message}`)
            skipped++
        }
    }

    console.log(`   Done: ${updated} updated, ${skipped} skipped.`)
}

/* ── Stories ─────────────────────────────────────────────────────── */
async function updateStories(mysql) {
    console.log('\n🔵 Stories…')
    const [rows] = await mysql.query(
        'SELECT id, cover FROM stories WHERE deleted_at IS NULL AND cover IS NOT NULL'
    )
    console.log(`   Found ${rows.length} stories with covers in MySQL.`)

    let updated = 0
    let skipped = 0

    for (const row of rows) {
        const legacyId = `legacy-${row.id}`
        const newUrl = resolveImage('stories', row.cover)
        if (!newUrl) { skipped++; continue }

        try {
            const result = await prisma.story.updateMany({
                where: { id: legacyId },
                data: { mediaUrl: newUrl },
            })
            if (result.count > 0) {
                updated++
                console.log(`   ✅ legacy-${row.id} → ${newUrl}`)
            } else {
                skipped++
                console.log(`   ⚠️  legacy-${row.id} not found in PG`)
            }
        } catch (e) {
            console.error(`   ❌ legacy-${row.id}: ${e.message}`)
            skipped++
        }
    }

    console.log(`   Done: ${updated} updated, ${skipped} skipped.`)
}

/* ── Main ────────────────────────────────────────────────────────── */
async function main() {
    console.log('🚀 update-all-images.mjs starting…')
    let mysql

    try {
        mysql = await getMySQL()
        console.log('✅ MySQL connected')
        console.log('✅ PostgreSQL (Prisma) connected')

        await updateBlogPosts(mysql)
        await updateShopProducts(mysql)
        await updateStories(mysql)

        console.log('\n🎉 All done!')
    } finally {
        if (mysql) await mysql.end()
        await prisma.$disconnect()
    }
}

main().catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
})
