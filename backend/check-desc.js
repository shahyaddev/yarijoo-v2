const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const books = await p.book.findMany({
    select: { id: true, title: true, slug: true, description: true },
    orderBy: { createdAt: 'asc' },
    take: 32,
  });
  console.log('=== Book descriptions ===');
  books.forEach(b => {
    const raw = b.description || '';
    const text = raw.replace(/<[^>]+>/g, '').trim();
    console.log(`"${b.title}" | slug:${b.slug} | desc:${text.length} chars | preview: ${text.slice(0,80)}`);
  });
  const noDesc = books.filter(b => !b.description || b.description.replace(/<[^>]+>/g,'').trim().length < 50);
  console.log(`\n⚠️  Books with no/short description: ${noDesc.length}`);
  await p.$disconnect();
}
main().catch(console.error);
