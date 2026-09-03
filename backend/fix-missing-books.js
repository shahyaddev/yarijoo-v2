/**
 * Fix the 3 books that didn't get matched:
 * 1. "شفقت خود" - MySQL #17, PG slug: book-17-شفقت-خود
 * 2. "همه چیز دربارهی یائسگی" - MySQL #34, PG slug: book-34-همه-چیز-دربارهی-یائسگی
 * 3. "انسان در جستجوی معنا" (man-search-for-meaning) - duplicate, MySQL might be #38
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

    // Parse all books to see what IDs exist
    const mysqlBooks = parseMySQLInsert(sql, 'books');
    console.log('\nAll MySQL books:');
    mysqlBooks.forEach(row => {
        console.log(`  #${row[0]}: "${row[1]}" (slug: ${row[8]})`);
    });

    const mysqlPages = parseMySQLInsert(sql, 'book_pages');
    // Group by book_id
    const pagesByBookId = new Map();
    for (const row of mysqlPages) {
        const bid = parseInt(row[1]);
        if (!pagesByBookId.has(bid)) pagesByBookId.set(bid, []);
        pagesByBookId.get(bid).push({ title: row[2], content: row[3] });
    }

    // The 3 unmatched PG books
    const unmatchedPG = await prisma.book.findMany({
        where: { pages: { none: {} } },
        select: { id: true, title: true, slug: true }
    });
    console.log('\nPG books without pages:', unmatchedPG.map(b => b.title));

    // Manual mapping based on title similarity
    // MySQL #17 "شفقت خود: شیوهای اثباتشده برای مهربان بودن با خود" -> PG "شفقت خود"
    // MySQL #34 "همه چیز دربارهی یائسگی: فصل جدیدی از زندگی" -> PG "همه چیز دربارهی یائسگی"
    // MySQL #38 "انسان در جستجوی معنا" -> PG "انسان در جستجوی معنا" (man-search-for-meaning)

    const manualMappings = [
        { mysqlId: 17, pgTitle: 'شفقت خود' },
        { mysqlId: 34, pgTitle: 'همه چیز دربارهی یائسگی' },
        { mysqlId: 38, pgTitle: 'انسان در جستجوی معنا' },
    ];

    for (const { mysqlId, pgTitle } of manualMappings) {
        const pgBook = unmatchedPG.find(b => b.title === pgTitle || b.title.startsWith(pgTitle));
        if (!pgBook) {
            console.log(`\n⚠️  PG book not found for title: ${pgTitle}`);
            continue;
        }

        const pages = pagesByBookId.get(mysqlId);
        if (!pages || pages.length === 0) {
            console.log(`\n⚠️  No MySQL pages for book #${mysqlId}`);
            continue;
        }

        console.log(`\nInserting ${pages.length} pages for "${pgBook.title}" (MySQL #${mysqlId})`);
        for (let i = 0; i < pages.length; i++) {
            await prisma.bookPage.create({
                data: {
                    bookId: pgBook.id,
                    title: pages[i].title,
                    content: pages[i].content,
                    pageOrder: i + 1,
                }
            });
        }

        await prisma.book.update({
            where: { id: pgBook.id },
            data: { totalPages: pages.length }
        });
        console.log(`  ✅ Done - ${pages.length} pages`);
    }

    // Final check
    const total = await prisma.bookPage.count();
    const booksWithPages = await prisma.book.count({ where: { pages: { some: {} } } });
    console.log(`\n📊 Final: ${total} total pages, ${booksWithPages}/32 books with pages`);

    await prisma.$disconnect();
}

main().catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
