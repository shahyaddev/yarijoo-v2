const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const books = await prisma.book.findMany({ take: 5, select: { id: true, title: true, slug: true, status: true } });
  console.log('Books count:', books.length);
  console.log('Books:', JSON.stringify(books, null, 2));
  
  const pages = await prisma.bookPage.findMany({ take: 5, select: { id: true, bookId: true, title: true, pageOrder: true } });
  console.log('BookPages count:', pages.length);
  console.log('BookPages:', JSON.stringify(pages, null, 2));
  
  const stories = await prisma.story.findMany({ take: 5, select: { id: true, title: true, status: true } });
  console.log('Stories count:', stories.length);
  console.log('Stories:', JSON.stringify(stories, null, 2));
  
  await prisma.$disconnect();
}
main().catch(console.error);
