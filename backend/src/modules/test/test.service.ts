import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma, SubscriptionLevel, TestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoringService, ScoringResult } from './scoring.service';
import { GetTestsDto } from './dto/get-tests.dto';
import { SaveAnswersDto } from './dto/save-answers.dto';
import { CompleteTestDto } from './dto/complete-test.dto';

@Injectable()
export class TestService {
    constructor(
        private prisma: PrismaService,
        private scoring: ScoringService,
    ) { }

    async getTests(dto: GetTestsDto) {
        const { category, isPremium, search, page = 1, limit = 20 } = dto;
        const skip = (page - 1) * limit;

        const where: Prisma.TestWhereInput = { status: TestStatus.PUBLISHED };

        if (category) where.category = category;
        if (isPremium !== undefined) where.isPremium = isPremium;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [tests, total] = await Promise.all([
            this.prisma.test.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    category: true,
                    isPremium: true,
                    imageUrl: true,
                    duration: true,
                    status: true,
                    _count: { select: { questions: true, attempts: true } },
                },
            }),
            this.prisma.test.count({ where }),
        ]);

        return {
            tests,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getTestBySlug(slug: string) {
        const test = await this.prisma.test.findUnique({
            where: { slug },
            include: {
                questions: { orderBy: { order: 'asc' } },
                interpretations: true,
            },
        });
        if (!test) throw new NotFoundException('تست یافت نشد');
        return test;
    }

    async startTest(userId: string, testId: string) {
        const test = await this.prisma.test.findUnique({ where: { id: testId } });
        if (!test) throw new NotFoundException('تست یافت نشد');

        // Return existing in-progress attempt if exists
        const existing = await this.prisma.userTestAttempt.findFirst({
            where: { userId, testId, status: 'in_progress' },
        });
        if (existing) return existing;

        return this.prisma.userTestAttempt.create({
            data: {
                userId,
                testId,
                answers: {},
                score: {},
                status: 'in_progress',
            },
        });
    }

    async saveAnswers(userId: string, attemptId: string, dto: SaveAnswersDto) {
        const attempt = await this.prisma.userTestAttempt.findFirst({
            where: { id: attemptId, userId, status: 'in_progress' },
        });
        if (!attempt) throw new NotFoundException('تلاش یافت نشد');

        const merged = {
            ...(attempt.answers as Record<string, unknown>),
            ...(dto.answers as Record<string, unknown>),
        } as unknown as Prisma.InputJsonValue;

        return this.prisma.userTestAttempt.update({
            where: { id: attemptId },
            data: { answers: merged },
        });
    }

    async completeTest(
        userId: string,
        attemptId: string,
        dto: CompleteTestDto,
    ): Promise<{
        attempt: Awaited<ReturnType<PrismaService['userTestAttempt']['update']>>;
        score: ScoringResult;
        interpretation: {
            id: string;
            testId: string;
            scoreRangeMin: number;
            scoreRangeMax: number;
            subscaleKey: string | null;
            interpretationText: string;
            severity: string | null;
            recommendations: Prisma.JsonValue;
        } | null;
    }> {
        const attempt = await this.prisma.userTestAttempt.findFirst({
            where: { id: attemptId, userId },
            include: {
                test: {
                    include: { questions: true, interpretations: true },
                },
            },
        });
        if (!attempt) throw new NotFoundException('تلاش یافت نشد');
        if (attempt.status === 'completed') {
            throw new BadRequestException('این تست قبلاً تکمیل شده است');
        }

        const finalAnswers: Record<string, unknown> = {
            ...(attempt.answers as Record<string, unknown>),
            ...(dto.answers as Record<string, unknown>),
        };

        const score = this.scoring.calculate(
            attempt.test.scoringType,
            attempt.test.questions,
            finalAnswers,
            attempt.test.config,
        );

        // Find matching interpretation (overall, not subscale-specific)
        const interpretation =
            attempt.test.interpretations.find(
                (i) =>
                    score.total >= i.scoreRangeMin &&
                    score.total <= i.scoreRangeMax &&
                    !i.subscaleKey,
            ) ?? null;

        const scorePayload: Prisma.InputJsonValue = score as unknown as Prisma.InputJsonValue;

        const updated = await this.prisma.userTestAttempt.update({
            where: { id: attemptId },
            data: {
                answers: finalAnswers as unknown as Prisma.InputJsonValue,
                score: scorePayload,
                status: 'completed',
                completedAt: new Date(),
            },
        });

        return { attempt: updated, score, interpretation };
    }

    async getAttemptById(userId: string, attemptId: string) {
        const attempt = await this.prisma.userTestAttempt.findFirst({
            where: { id: attemptId, userId },
            include: {
                test: { include: { interpretations: true } },
            },
        });
        if (!attempt) throw new NotFoundException('تلاش یافت نشد');

        const score = attempt.score as { total?: number };
        const total = score.total ?? 0;

        const interpretation =
            attempt.test.interpretations.find(
                (i) =>
                    total >= i.scoreRangeMin &&
                    total <= i.scoreRangeMax &&
                    !i.subscaleKey,
            ) ?? null;

        return { attempt, interpretation };
    }

    async getUserAttempts(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [attempts, total] = await Promise.all([
            this.prisma.userTestAttempt.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { startedAt: 'desc' },
                include: {
                    test: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true,
                            imageUrl: true,
                        },
                    },
                },
            }),
            this.prisma.userTestAttempt.count({ where: { userId } }),
        ]);

        return {
            attempts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async checkPremiumAccess(userId: string, testId: string): Promise<void> {
        const test = await this.prisma.test.findUnique({
            where: { id: testId },
            select: { isPremium: true },
        });
        if (!test) throw new NotFoundException('تست یافت نشد');
        if (!test.isPremium) return;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionLevel: true },
        });
        if (!user || user.subscriptionLevel === SubscriptionLevel.FREE) {
            throw new ForbiddenException('این تست نیاز به اشتراک پریمیوم دارد');
        }
    }
}
