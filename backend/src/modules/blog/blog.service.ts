import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ContentStatus, SubscriptionLevel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetBlogDto } from './dto/get-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class BlogService {
    constructor(private readonly prisma: PrismaService) { }

    async getPosts(dto: GetBlogDto, userId?: string) {
        const { categoryId, tag, search, page = 1, limit = 12 } = dto;
        const skip = (page - 1) * limit;

        const where: Prisma.BlogPostWhereInput = {
            status: ContentStatus.PUBLISHED,
        };

        if (categoryId) where.categoryId = categoryId;
        if (tag) where.tags = { has: tag };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [posts, total] = await Promise.all([
            this.prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    excerpt: true,
                    coverImage: true,
                    authorId: true,
                    categoryId: true,
                    views: true,
                    readTime: true,
                    tags: true,
                    isPremium: true,
                    publishedAt: true,
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                },
            }),
            this.prisma.blogPost.count({ where }),
        ]);

        return {
            posts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getPostBySlug(slug: string, subscriptionLevel?: string) {
        const post = await this.prisma.blogPost.findUnique({
            where: { slug },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                comments: {
                    where: { status: ContentStatus.PUBLISHED },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!post) throw new NotFoundException('مقاله یافت نشد');

        // Atomic view count increment
        await this.prisma.blogPost.update({
            where: { id: post.id },
            data: { views: { increment: 1 } },
        });

        // Premium gate — truncate content to first 200 words for FREE users
        if (post.isPremium && subscriptionLevel === SubscriptionLevel.FREE) {
            const words = post.content.split(' ').slice(0, 200).join(' ');
            return {
                ...post,
                content: words + '... [برای مشاهده متن کامل اشتراک تهیه کنید]',
                isContentTruncated: true,
            };
        }

        return { ...post, isContentTruncated: false };
    }

    async getCategories() {
        return this.prisma.category.findMany({
            where: { type: 'blog' },
            include: {
                children: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { name: 'asc' },
        });
    }

    async createComment(
        userId: string,
        postId: string,
        dto: CreateCommentDto,
    ) {
        // Verify post exists
        const post = await this.prisma.blogPost.findUnique({
            where: { id: postId },
        });
        if (!post) throw new NotFoundException('مقاله یافت نشد');

        return this.prisma.comment.create({
            data: {
                blogPostId: postId,
                userId,
                content: dto.content,
                status: ContentStatus.DRAFT, // pending approval
            },
        });
    }

    async approveComment(commentId: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment) throw new NotFoundException('کامنت یافت نشد');

        return this.prisma.comment.update({
            where: { id: commentId },
            data: { status: ContentStatus.PUBLISHED },
        });
    }
}
