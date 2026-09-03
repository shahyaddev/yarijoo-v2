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
    const sql = fs.readFileSync(path.join(__dirname, '..', 'odtjonaf_yarijoo.sql'), 'utf8');
    const mysqlPages = parseMySQLInsert(sql, 'book_pages');

    // Pages for MySQL book #34
    const pages34 = mysqlPages.filter(r => r[1] === '34');
    console.log(`MySQL book #34 has ${pages34.length} pages`);

    // Find PG book without pages
    const noPageBook = await prisma.book.findFirst({
        where: { pages: { none: {} } },
        select: { id: true, title: true, slug: true }
    });
    console.log('Last book without pages:', noPageBook);

    if (noPageBook && pages34.length > 0) {
        console.log(`Inserting ${pages34.length} pages for "${noPageBook.title}"`);
        for (let i = 0; i < pages34.length; i++) {
            await prisma.bookPage.create({
                data: {
                    bookId: noPageBook.id,
                    title: pages34[i][2],
                    content: pages34[i][3],
                    pageOrder: i + 1,
                }
            });
        }
        await prisma.book.update({
            where: { id: noPageBook.id },
            data: { totalPages: pages34.length }
        });
        console.log('✅ Done!');
    }

    const total = await prisma.bookPage.count();
    const booksWithPages = await prisma.book.count({ where: { pages: { some: {} } } });
    console.log(`\n📊 Final: ${total} total pages, ${booksWithPages}/32 books with pages`);
    await prisma.$disconnect();
}
main().catch(async e => { console.error(e); await prisma.$disconnect(); });
