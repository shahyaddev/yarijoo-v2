/**
 * Migrate book descriptions from MySQL dump (column: des) to PostgreSQL
 * MySQL books schema: (id, title, author, published_at, price, cover, created_at, updated_at, slug, des, ...)
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseRowValues(block) {
    const rows = [];
    let i = 0, len = block.length;
    while (i < len) {
        while (i < len && ' \n\r\t,'.includes(block[i])) i++;
        if (i >= len) break;
        if (block[i] !== '(') { i++; continue; }
        i++;
        const fields = [];
        while (i < len && block[i] !== ')') {
            while (i < len && ' \t'.includes(block[i])) i++;
            if (block[i] === ',') { i++; continue; }
            if (block[i] === ')') break;
            if (block[i] === "'") {
                i++;
                let val = '';
                while (i < len) {
                    if (block[i] === '\\') {
                        i++;
                        const e = block[i];
                        val += e === 'n' ? '\n' : e === 'r' ? '\r' : e === 't' ? '\t' : e;
                        i++;
                    } else if (block[i] === "'" && block[i+1] === "'") {
                        val += "'"; i += 2;
                    } else if (block[i] === "'") {
                        i++; break;
                    } else {
                        val += block[i++];
                    }
                }
                fields.push(val);
            } else if (block.substr(i, 4) === 'NULL') {
                fields.push(null); i += 4;
            } else {
                let val = '';
                while (i < len && block[i] !== ',' && block[i] !== ')' && block[i] !== ' ') val += block[i++];
                fields.push(val);
            }
        }
        i++;
        if (fields.length > 0) rows.push(fields);
    }
    return rows;
}

function parseMySQLInsert(sql, tableName) {
    const re = new RegExp(`INSERT INTO \`${tableName}\`[^V]*VALUES\\s*([\\s\\S]+?)(?=;\\s*--|;\\s*$|;\\s*INSERT|;\\s*CREATE|;\\s*--\\s*-{20,}|$)`, 'g');
    const rows = [];
    let m;
    while ((m = re.exec(sql)) !== null) rows.push(...parseRowValues(m[1].trim().replace(/;\s*$/, '')));
    return rows;
}

async function main() {
    console.log('Reading SQL dump...');
    const sql = fs.readFileSync(path.join(__dirname, '..', 'odtjonaf_yarijoo.sql'), 'utf8');

    // schema: id=0, title=1, author=2, published_at=3, price=4, cover=5, created_at=6, updated_at=7, slug=8, des=9
    const mysqlBooks = parseMySQLInsert(sql, 'books');
    console.log(`Found ${mysqlBooks.length} books in dump`);

    // Build map: title → des
    const mysqlDesMap = new Map();
    for (const row of mysqlBooks) {
        const title = row[1];
        const des = row[9];
        if (title && des && des.trim().length > 50) {
            mysqlDesMap.set(title.trim(), des);
        }
    }
    console.log(`Books with real description in dump: ${mysqlDesMap.size}`);

    // Get all PG books
    const pgBooks = await prisma.book.findMany({
        select: { id: true, title: true, slug: true, description: true },
    });

    let updated = 0, skipped = 0;

    for (const pgBook of pgBooks) {
        // Only update books with short/missing description
        const currentDesc = pgBook.description?.replace(/<[^>]+>/g, '').trim() ?? '';
        if (currentDesc.length >= 100) {
            skipped++;
            continue;
        }

        // Try exact title match
        let newDes = mysqlDesMap.get(pgBook.title.trim());

        // Try partial match (PG slug might have "book-11-" prefix, MySQL has bare title)
        if (!newDes) {
            for (const [mysqlTitle, des] of mysqlDesMap.entries()) {
                if (pgBook.title.includes(mysqlTitle) || mysqlTitle.includes(pgBook.title)) {
                    newDes = des;
                    break;
                }
            }
        }

        if (!newDes) {
            console.log(`  ⚠️  No description found for: "${pgBook.title}"`);
            skipped++;
            continue;
        }

        await prisma.book.update({
            where: { id: pgBook.id },
            data: { description: newDes },
        });

        const textLen = newDes.replace(/<[^>]+>/g, '').length;
        console.log(`  ✅ "${pgBook.title}" — ${textLen} chars`);
        updated++;
    }

    console.log(`\n📊 Updated: ${updated} | Skipped (already had desc): ${skipped}`);
    await prisma.$disconnect();
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
