const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const totalBooks = await prisma.book.count();
  const totalPages = await prisma.bookPage.count();
  const totalStories = await prisma.story.count();
  console.log('Total books:', totalBooks);
  console.log('Total book_pages:', totalPages);
  console.log('Total stories:', totalStories);
  
  // Check which books have pages
  const booksWithPages = await prisma.book.findMany({
    select: { id: true, title: true, slug: true, _count: { select: { pages: true } } },
    take: 20,
  });
  console.log('\nBooks with page counts:');
  booksWithPages.forEach(b => console.log(`  "${b.title}" (${b.slug}): ${b._count.pages} pages`));

  // Check specific book
  const book = await prisma.book.findFirst({ where: { slug: 'book-11-دلبستگی' } });
  if (book) {
    console.log('\nBook found:', book.id, book.title);
    const pages = await prisma.bookPage.findMany({ where: { bookId: book.id } });
    console.log('Pages for this book:', pages.length);
  }
  
  await prisma.$disconnect();
}
main().catch(console.error);
