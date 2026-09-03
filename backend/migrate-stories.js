/**
 * Properly migrate stories from MySQL dump to PostgreSQL
 * MySQL stories schema: (id, title, author, published_at, price, cover, created_at, updated_at, slug, des, genre_id, category_id, deleted_at, views_count, likes_count, avg_rating, ratings_count)
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseRowValues(block) {
    const rows = [];
    let i = 0;
    const len = block.length;
    while (i < len) {
        while (i < len && (block[i] === ' ' || block[i] === '\n' || block[i] === '\r' || block[i] === '\t' || block[i] === ',')) i++;
        if (i >= len) break;
        if (block[i] !== '(') { i++; continue; }
        i++;
        const fields = [];
        while (i < len && block[i] !== ')') {
            while (i < len && (block[i] === ' ' || block[i] === '\t')) i++;
            if (block[i] === ',') { i++; continue; }
            if (block[i] === ')') break;
            if (block[i] === "'") {
                i++;
                let val = '';
                while (i < len) {
                    if (block[i] === '\\') {
                        i++;
                        const esc = block[i];
                        if (esc === 'n') val += '\n';
                        else if (esc === 'r') val += '\r';
                        else if (esc === 't') val += '\t';
                        else if (esc === "'") val += "'";
                        else if (esc === '"') val += '"';
                        else if (esc === '\\') val += '\\';
                        else val += esc;
                        i++;
                    } else if (block[i] === "'" && block[i+1] === "'") {
                        val += "'"; i += 2;
                    } else if (block[i] === "'") {
                        i++; break;
                    } else {
                        val += block[i]; i++;
                    }
                }
                fields.push(val);
            } else if (block.substr(i, 4) === 'NULL') {
                fields.push(null); i += 4;
            } else {
                let val = '';
                while (i < len && block[i] !== ',' && block[i] !== ')' && block[i] !== ' ') { val += block[i]; i++; }
                fields.push(val);
            }
        }
        i++;
        if (fields.length > 0) rows.push(fields);
    }
    return rows;
}

function parseMySQLInsert(sql, tableName) {
    const pattern = new RegExp(
        `INSERT INTO \`${tableName}\`[^V]*VALUES\\s*([\\s\\S]+?)(?=;\\s*--|;\\s*$|;\\s*INSERT|;\\s*CREATE|;\\s*--\\s*-{20,}|$)`,
        'g'
    );
    const rows = [];
    let match;
    while ((match = pattern.exec(sql)) !== null) {
        rows.push(...parseRowValues(match[1].trim().replace(/;\s*$/, '')));
    }
    return rows;
}

async function main() {
    console.log('Reading SQL dump...');
    const sql = fs.readFileSync(path.join(__dirname, '..', 'odtjonaf_yarijoo.sql'), 'utf8');

    // schema: (id=0, title=1, author=2, published_at=3, price=4, cover=5, created_at=6, updated_at=7, slug=8, des=9, genre_id=10, category_id=11, deleted_at=12, views_count=13, ...)
    const mysqlStories = parseMySQLInsert(sql, 'stories');
    console.log(`Found ${mysqlStories.length} stories in dump`);

    // Filter: must have content (des), not deleted, meaningful title and content
    const validStories = mysqlStories.filter(row => {
        const title = row[1];
        const des = row[9];
        const deletedAt = row[12];

        // Skip deleted
        if (deletedAt && deletedAt !== 'NULL') return false;

        // Must have content
        if (!des || des.trim() === '' || des.trim() === 'NULL') return false;

        // Strip HTML to check real content length
        const textContent = des.replace(/<[^>]*>/g, '').trim();
        if (textContent.length < 100) return false;

        // Skip obvious test entries
        if (!title || title.length < 3) return false;
        const lowerTitle = title.toLowerCase();
        if (/^[a-z]{3,20}$/.test(lowerTitle) && !/[آ-ی]/.test(lowerTitle)) return false;
        if (/^[سشیری]+$/.test(title)) return false;

        return true;
    });

    console.log(`Valid stories after filtering: ${validStories.length}`);

    // Get admin user
    const adminUser = await prisma.user.findFirst({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true },
    });
    if (!adminUser) throw new Error('No admin user found!');

    // Get all existing stories (by title for dedup)
    const existingStories = await prisma.story.findMany({
        select: { id: true, title: true, content: true },
    });
    
    // Delete stories with empty/minimal content (the garbage ones imported before)
    const garbageIds = existingStories
        .filter(s => !s.content || s.content.replace(/<[^>]*>/g, '').trim().length < 100)
        .map(s => s.id);
    
    if (garbageIds.length > 0) {
        console.log(`Deleting ${garbageIds.length} garbage/test stories...`);
        await prisma.story.deleteMany({ where: { id: { in: garbageIds } } });
        console.log('  ✅ Deleted garbage stories');
    }

    // Rebuild existing set after cleanup
    const remainingStories = await prisma.story.findMany({ select: { title: true } });
    const existingTitles = new Set(remainingStories.map(s => s.title));
    console.log(`Remaining stories in DB: ${remainingStories.length}`);

    // Insert valid stories
    let inserted = 0;
    let skipped = 0;

    for (const row of validStories) {
        const title = row[1];
        const content = row[9];
        const cover = row[5]; // e.g. "Uploads/stories/xxx.jpg"
        const views = parseInt(row[13]) || 0;

        // Dedup by title
        if (title && existingTitles.has(title)) {
            skipped++;
            continue;
        }

        // Convert MySQL cover path to API path
        let mediaUrl = null;
        if (cover && cover !== 'NULL' && cover.trim() !== '') {
            // "Uploads/stories/xxx.jpg" -> "/uploads/stories/xxx.jpg"
            mediaUrl = '/' + cover.replace(/^\//, '').replace(/^Uploads/, 'uploads');
        }

        await prisma.story.create({
            data: {
                title: title || null,
                content,
                mediaUrl,
                authorId: adminUser.id,
                status: 'PUBLISHED',
                views,
            },
        });

        if (title) existingTitles.add(title);
        inserted++;
    }

    console.log(`\n✅ Inserted: ${inserted} stories`);
    console.log(`⏭️  Skipped (duplicate): ${skipped}`);

    const finalCount = await prisma.story.count();
    console.log(`\n📊 Total stories in DB: ${finalCount}`);

    // Show sample
    const sample = await prisma.story.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { title: true, views: true, mediaUrl: true },
    });
    console.log('\nSample stories:');
    sample.forEach(s => console.log(`  - "${s.title}" | views: ${s.views} | img: ${s.mediaUrl}`));

    await prisma.$disconnect();
}

main().catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
