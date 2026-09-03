const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Books without pages
  const nopages = await prisma.book.findMany({
    where: { pages: { none: {} } },
    select: { id: true, title: true, slug: true }
  });
  console.log('Books WITHOUT pages:', nopages.length);
  nopages.forEach(b => console.log(`  - "${b.title}" (${b.slug})`));

  // Books with pages stats
  const withPages = await prisma.book.findMany({
    where: { pages: { some: {} } },
    select: { id: true, title: true, totalPages: true, _count: { select: { pages: true } } }
  });
  console.log('\nBooks WITH pages:', withPages.length);
  withPages.forEach(b => console.log(`  - "${b.title}": ${b._count.pages} pages (totalPages=${b.totalPages})`));

  // Test API call - simulate readBookBySlug
  const book = await prisma.book.findFirst({ where: { pages: { some: {} } } });
  if (book) {
    console.log('\nTest - reading pages for:', book.title, '(slug:', book.slug, ')');
    const pages = await prisma.$queryRaw`
      SELECT title, content, page_order 
      FROM book_pages 
      WHERE book_id = ${book.id} 
      ORDER BY page_order ASC
    `;
    console.log('Pages returned:', pages.length);
    pages.slice(0, 3).forEach((p, i) => console.log(`  Page ${i+1}: "${p.title}" (${p.content.length} chars)`));
  }

  await prisma.$disconnect();
}
main().catch(console.error);
