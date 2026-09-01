import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetBooksDto } from './dto/get-books.dto';

@Injectable()
export class BookService {
    constructor(private readonly prisma: PrismaService) { }

    async getBooks(dto: GetBooksDto) {
        const { categoryId, search, page = 1, limit = 12 } = dto;
        const skip = (page - 1) * limit;

        const where: Prisma.BookWhereInput = {
            status: ContentStatus.PUBLISHED,
        };

        if (categoryId) where.categoryId = categoryId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [books, total] = await Promise.all([
            this.prisma.book.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    author: true,
                    description: true,
                    coverImage: true,
                    isPremium: true,
                    price: true,
                    status: true,
                    categoryId: true,
                    category: { select: { id: true, name: true } },
                    _count: { select: { reviews: true } },
                },
            }),
            this.prisma.book.count({ where }),
        ]);

        return {
            books,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getBookBySlug(slug: string) {
        const book = await this.prisma.book.findUnique({
            where: { slug },
            include: {
                reviews: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { fullName: true, avatarUrl: true } },
                    },
                },
                category: { select: { id: true, name: true } },
            },
        });

        if (!book) throw new NotFoundException('کتاب یافت نشد');
        return book;
    }

    async readBookBySlug(slug: string) {
        const book = await this.prisma.book.findUnique({ where: { slug } });
        if (!book) throw new NotFoundException('کتاب یافت نشد');

        const pages = await this.prisma.$queryRaw<{ title: string; content: string; page_order: number }[]>`
            SELECT title, content, page_order 
            FROM book_pages 
            WHERE book_id = ${book.id} 
            ORDER BY page_order ASC
        `

        return {
            book: {
                id: book.id,
                slug: book.slug,
                title: book.title,
                author: book.author,
                coverImage: book.coverImage,
                isPremium: book.isPremium,
                price: book.price,
            },
            totalPages: pages.length,
            pages: pages.map((p, i) => ({
                index: i + 1,
                title: p.title,
                content: p.content,
            })),
        }
    }

    async readBook(userId: string, bookId: string, pageNum: number) {
        const book = await this.prisma.book.findUnique({ where: { id: bookId } });
        if (!book) throw new NotFoundException('کتاب یافت نشد');

        const FREE_PREVIEW_PAGES = 10;

        if (pageNum > FREE_PREVIEW_PAGES && book.isPremium) {
            const purchased = await this.prisma.orderItem.findFirst({
                where: { bookId, order: { userId, status: 'PAID' } },
            });
            if (!purchased) {
                throw new ForbiddenException('برای مطالعه این صفحه باید کتاب را خریداری کنید');
            }
        }

        // Get actual page from book_pages table
        const pages = await this.prisma.$queryRaw<{ id: string; title: string; content: string; page_order: number }[]>`
            SELECT id, title, content, page_order 
            FROM book_pages 
            WHERE book_id = ${bookId} 
            ORDER BY page_order ASC
        `

        if (pages.length === 0) {
            return {
                bookId,
                page: pageNum,
                totalPages: book.totalPages ?? 1,
                content: book.description ?? `<p>محتوای این کتاب در حال بارگذاری است.</p>`,
                title: book.title,
                isPreview: true,
                pages: [],
            }
        }

        return {
            bookId,
            book: { title: book.title, author: book.author, coverImage: book.coverImage },
            totalPages: pages.length,
            pages: pages.map((p, i) => ({
                index: i + 1,
                title: p.title,
                content: p.content,
            })),
        }
    }

    async saveProgress(userId: string, bookId: string, lastPage: number) {
        return this.prisma.userBookProgress.upsert({
            where: { userId_bookId: { userId, bookId } },
            update: { lastPage },
            create: { userId, bookId, lastPage },
        });
    }
}
