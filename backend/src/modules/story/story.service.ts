import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoryService {
    constructor(private prisma: PrismaService) { }

    async getStories(userId?: string, page = 1, limit = 20) {
        const now = new Date();
        const skip = (page - 1) * limit;

        const [stories, total] = await Promise.all([
            this.prisma.story.findMany({
                where: {
                    status: ContentStatus.PUBLISHED,
                    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.story.count({
                where: {
                    status: ContentStatus.PUBLISHED,
                    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
                },
            }),
        ]);

        if (!userId) {
            return { stories: stories.map((s) => ({ ...s, seen: false })), total, page, limit };
        }

        const seenStoryIds = await this.prisma.storyView.findMany({
            where: { userId },
            select: { storyId: true },
        });
        const seenSet = new Set(seenStoryIds.map((v) => v.storyId));
        const withSeen = stories.map((s) => ({ ...s, seen: seenSet.has(s.id) }));

        return {
            stories: [...withSeen.filter((s) => !s.seen), ...withSeen.filter((s) => s.seen)],
            total,
            page,
            limit,
        };
    }

    async recordView(userId: string, storyId: string) {
        await this.prisma.storyView.upsert({
            where: { storyId_userId: { storyId, userId } },
            update: {},
            create: { storyId, userId },
        });
        // Increment view count
        await this.prisma.story.update({
            where: { id: storyId },
            data: { views: { increment: 1 } },
        });
        return { success: true };
    }

    async createStory(data: {
        title?: string;
        content: string;
        mediaUrl?: string;
        authorId: string;
        expiresAt?: Date;
    }) {
        return this.prisma.story.create({
            data: {
                title: data.title,
                content: data.content,
                mediaUrl: data.mediaUrl,
                authorId: data.authorId,
                expiresAt: data.expiresAt,
                status: ContentStatus.PUBLISHED,
            },
        });
    }
}
