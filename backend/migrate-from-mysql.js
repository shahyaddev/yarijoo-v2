/**
 * Migration script: Extract book_pages and stories from MySQL dump
 * and insert into PostgreSQL (v2 database)
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── Parse MySQL INSERT VALUES ────────────────────────────────────────────────
function parseMySQLInsert(sql, tableName) {
    const pattern = new RegExp(
        `INSERT INTO \`${tableName}\`[^V]*VALUES\\s*([\\s\\S]+?)(?=;\\s*--|;\\s*\/\*|;\\s*$|;\\s*INSERT|;\\s*CREATE|;\\s*DROP|;\\s*ALTER|;\\s*--\\s*-{20,}|$)`,
        'g'
    );

    const rows = [];

    let match;
    while ((match = pattern.exec(sql)) !== null) {
        const valueBlock = match[1].trim().replace(/;\s*$/, '');
        const rowMatches = parseRowValues(valueBlock);
        rows.push(...rowMatches);
    }

    return rows;
}

function parseRowValues(block) {
    const rows = [];
    let i = 0;
    const len = block.length;

    while (i < len) {
        // Skip whitespace and commas between rows
        while (i < len && (block[i] === ' ' || block[i] === '\n' || block[i] === '\r' || block[i] === '\t' || block[i] === ',')) i++;
        if (i >= len) break;

        if (block[i] !== '(') { i++; continue; }

        // Parse one row
        i++; // skip '('
        const fields = [];
        while (i < len && block[i] !== ')') {
            // skip whitespace
            while (i < len && (block[i] === ' ' || block[i] === '\t')) i++;
            if (block[i] === ',') { i++; continue; }
            if (block[i] === ')') break;

            if (block[i] === "'") {
                // String value
                i++; // skip opening quote
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
                    } else if (block[i] === "'" && block[i + 1] === "'") {
                        val += "'";
                        i += 2;
                    } else if (block[i] === "'") {
                        i++; // skip closing quote
                        break;
                    } else {
                        val += block[i];
                        i++;
                    }
                }
                fields.push(val);
            } else if (block.substr(i, 4) === 'NULL') {
                fields.push(null);
                i += 4;
            } else {
                // Number or unquoted value
                let val = '';
                while (i < len && block[i] !== ',' && block[i] !== ')' && block[i] !== ' ') {
                    val += block[i];
                    i++;
                }
                fields.push(val);
            }
        }
        i++; // skip ')'
        if (fields.length > 0) rows.push(fields);
    }

    return rows;
}

async function main() {
    console.log('📂 Reading SQL dump...');
    const sqlPath = path.join(__dirname, '..', 'odtjonaf_yarijoo.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`✅ Loaded SQL dump (${(sql.length / 1024 / 1024).toFixed(1)} MB)`);

    // ─── Step 1: Parse books from MySQL dump ────────────────────────────────
    console.log('\n📚 Parsing books from MySQL dump...');
    // books: (id, title, author, published_at, price, cover, created_at, updated_at, slug, des, ...)
    const mysqlBooks = parseMySQLInsert(sql, 'books');
    console.log(`  Found ${mysqlBooks.length} books in dump`);

    // Build map: mysqlId -> { title, slug, author, des }
    const mysqlBookMap = new Map();
    for (const row of mysqlBooks) {
        const mysqlId = parseInt(row[0]);
        mysqlBookMap.set(mysqlId, {
            title: row[1],
            author: row[2],
            slug: row[8],
            des: row[9],
        });
    }

    // ─── Step 2: Get existing books from PostgreSQL ──────────────────────────
    console.log('\n🔗 Matching MySQL books with PostgreSQL books...');
    const pgBooks = await prisma.book.findMany({
        select: { id: true, title: true, slug: true },
    });
    console.log(`  Found ${pgBooks.length} books in PostgreSQL`);

    // Build match: mysqlId -> pgId
    // Match by normalizing slugs
    const normalizeSlug = (s) =>
        (s || '')
            .toLowerCase()
            .replace(/[_\-\s]+/g, '-')
            .replace(/^book-\d+-/i, '')
            .trim();

    const pgSlugMap = new Map();
    for (const pg of pgBooks) {
        pgSlugMap.set(normalizeSlug(pg.slug), pg.id);
        pgSlugMap.set(pg.title.trim().toLowerCase(), pg.id);
    }

    const mysqlToPgId = new Map();
    let matched = 0;
    for (const [mysqlId, book] of mysqlBookMap.entries()) {
        // Try normalized slug
        let pgId = pgSlugMap.get(normalizeSlug(book.slug));
        // Try title match
        if (!pgId) pgId = pgSlugMap.get(book.title.trim().toLowerCase());
        // Try original slug stripped of mysql id prefix like "دلبستگی"
        if (!pgId) {
            for (const pg of pgBooks) {
                if (pg.title.trim() === book.title.trim()) {
                    pgId = pg.id;
                    break;
                }
            }
        }

        if (pgId) {
            mysqlToPgId.set(mysqlId, pgId);
            matched++;
        } else {
            console.log(`  ⚠️  No match for MySQL book #${mysqlId}: "${book.title}" (slug: ${book.slug})`);
        }
    }
    console.log(`  Matched ${matched}/${mysqlBookMap.size} books`);

    // ─── Step 3: Parse book_pages from MySQL ────────────────────────────────
    console.log('\n📄 Parsing book_pages from MySQL dump...');
    // book_pages: (id, book_id, title, content, created_at, updated_at)
    const mysqlPages = parseMySQLInsert(sql, 'book_pages');
    console.log(`  Found ${mysqlPages.length} pages in dump`);

    // ─── Step 4: Check existing pages in PostgreSQL ──────────────────────────
    const existingPages = await prisma.bookPage.findMany({
        select: { bookId: true, title: true },
    });
    const existingSet = new Set(existingPages.map(p => `${p.bookId}::${p.title}`));
    console.log(`  Existing pages in PG: ${existingPages.length}`);

    // ─── Step 5: Group pages by book_id and insert ──────────────────────────
    console.log('\n📝 Inserting missing pages...');

    // Group pages by MySQL book_id
    const pagesByBook = new Map();
    for (const row of mysqlPages) {
        const mysqlBookId = parseInt(row[1]);
        if (!pagesByBook.has(mysqlBookId)) pagesByBook.set(mysqlBookId, []);
        pagesByBook.get(mysqlBookId).push({
            title: row[2],
            content: row[3],
        });
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const [mysqlBookId, pages] of pagesByBook.entries()) {
        const pgBookId = mysqlToPgId.get(mysqlBookId);
        if (!pgBookId) {
            console.log(`  ⚠️  Skipping pages for MySQL book #${mysqlBookId} (no PG match)`);
            continue;
        }

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const key = `${pgBookId}::${page.title}`;
            if (existingSet.has(key)) {
                skippedCount++;
                continue;
            }

            await prisma.bookPage.create({
                data: {
                    bookId: pgBookId,
                    title: page.title,
                    content: page.content,
                    pageOrder: i + 1,
                },
            });
            existingSet.add(key);
            insertedCount++;
        }
    }

    console.log(`  ✅ Inserted ${insertedCount} pages, skipped ${skippedCount} existing`);

    // ─── Step 6: Update totalPages on books ──────────────────────────────────
    console.log('\n🔢 Updating totalPages on books...');
    const booksWithPages = await prisma.bookPage.groupBy({
        by: ['bookId'],
        _count: { id: true },
    });

    for (const { bookId, _count } of booksWithPages) {
        await prisma.book.update({
            where: { id: bookId },
            data: { totalPages: _count.id },
        });
    }
    console.log(`  ✅ Updated totalPages for ${booksWithPages.length} books`);

    // ─── Step 7: Parse and migrate stories ───────────────────────────────────
    console.log('\n📖 Parsing stories from MySQL dump...');
    // stories: (id, title, des, cover, slug, author, published_at, created_at, updated_at, ...)
    const mysqlStories = parseMySQLInsert(sql, 'stories');
    console.log(`  Found ${mysqlStories.length} stories in dump`);

    if (mysqlStories.length > 0) {
        console.log('  Sample row fields count:', mysqlStories[0].length);
        console.log('  Sample row[0..4]:', mysqlStories[0].slice(0, 5));
    }

    // Check existing stories
    const existingStories = await prisma.story.count();
    console.log(`  Existing stories in PG: ${existingStories}`);

    // Get PG admin user id (for authorId)
    const adminUser = await prisma.user.findFirst({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true },
    });
    if (!adminUser) {
        console.log('  ⚠️  No admin user found, skipping story migration');
    } else {
        console.log(`  Using authorId: ${adminUser.id}`);

        // Get existing story titles for dedup
        const existingStoryTitles = new Set(
            (await prisma.story.findMany({ select: { title: true } }))
                .map(s => s.title)
        );

        let storiesInserted = 0;
        let storiesSkipped = 0;

        for (const row of mysqlStories) {
            // MySQL stories schema: id, title, des, cover, slug, author, published_at, created_at, updated_at, ...
            // Detect column order dynamically
            let title = null, content = '', mediaUrl = null;

            if (row.length >= 3) {
                title = row[1] || null;
                content = row[2] || '';
                mediaUrl = row[3] || null;
            }

            if (!content || content.trim() === '') {
                storiesSkipped++;
                continue;
            }

            if (title && existingStoryTitles.has(title)) {
                storiesSkipped++;
                continue;
            }

            await prisma.story.create({
                data: {
                    title: title || null,
                    content,
                    mediaUrl: mediaUrl || null,
                    authorId: adminUser.id,
                    status: 'PUBLISHED',
                    views: 0,
                },
            });

            if (title) existingStoryTitles.add(title);
            storiesInserted++;
        }

        console.log(`  ✅ Inserted ${storiesInserted} stories, skipped ${storiesSkipped}`);
    }

    // ─── Final Summary ────────────────────────────────────────────────────────
    console.log('\n📊 Final Summary:');
    const finalBooks = await prisma.book.count();
    const finalPages = await prisma.bookPage.count();
    const finalStories = await prisma.story.count();
    console.log(`  Books: ${finalBooks}`);
    console.log(`  BookPages: ${finalPages}`);
    console.log(`  Stories: ${finalStories}`);

    const booksWithPagesNow = await prisma.book.count({ where: { pages: { some: {} } } });
    console.log(`  Books WITH pages: ${booksWithPagesNow}`);

    await prisma.$disconnect();
    console.log('\n✅ Migration complete!');
}

main().catch(async (e) => {
    console.error('❌ Migration failed:', e);
    await prisma.$disconnect();
    process.exit(1);
});
