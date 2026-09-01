import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { SUBSCRIPTION_PLANS } from '../subscription/plans.config'
import { SubscriptionLevel } from '@prisma/client'
import OpenAI from 'openai'
import { Queue } from 'bullmq'
import type { Prisma } from '@prisma/client'

// Per-attempt hard cap (prevents abuse even for premium users)
const MAX_AI_GENERATIONS_FREE = 0    // FREE plan: no AI analysis
const MAX_AI_GENERATIONS_PAID = 3    // SILVER / GOLD / PLATINUM per attempt
const AI_RETRY_QUEUE = 'ai-insight-retry'

export interface AiInsightResult {
    summary: string
    strengths: string[]
    concerns: string[]
    recommendations: string[]
    generatedAt: string
}

@Injectable()
export class AiAnalysisService {
    private readonly logger = new Logger(AiAnalysisService.name)
    private openai: OpenAI | null = null
    private retryQueue: Queue | null = null

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) {
        const apiKey = this.config.get<string>('OPENAI_API_KEY')
        if (apiKey && apiKey !== '' && apiKey !== 'CHANGE_ME') {
            this.openai = new OpenAI({ apiKey })
        }

        // Initialise BullMQ retry queue if Redis is configured
        const redisUrl = this.config.get<string>('REDIS_URL') ?? this.config.get<string>('REDIS_HOST')
        if (redisUrl) {
            try {
                const host = redisUrl.startsWith('redis://') ? new URL(redisUrl).hostname : redisUrl
                const portStr = redisUrl.startsWith('redis://') ? new URL(redisUrl).port : undefined
                const port = portStr ? Number(portStr) : 6379
                this.retryQueue = new Queue(AI_RETRY_QUEUE, {
                    connection: { host, port },
                })
                this.logger.log(`AI retry queue initialised (${host}:${port})`)
            } catch (err) {
                this.logger.warn('Could not initialise AI retry queue', err)
            }
        }
    }

    async generateInsight(userId: string, attemptId: string): Promise<AiInsightResult> {
        // ── 1. Load user subscription level ────────────────────────────────
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionLevel: true },
        })
        const level = (user?.subscriptionLevel ?? SubscriptionLevel.FREE) as keyof typeof SUBSCRIPTION_PLANS
        const plan = SUBSCRIPTION_PLANS[level] ?? SUBSCRIPTION_PLANS.FREE

        // Check if this plan allows AI analysis
        if (!plan.features.aiAnalysis) {
            throw new ForbiddenException(
                'تحلیل هوش مصنوعی فقط برای اشتراک‌های طلایی و پلاتینیوم در دسترس است. ' +
                'برای ارتقاء اشتراک به صفحه قیمت‌گذاری مراجعه کنید.',
            )
        }

        // ── 2. Load attempt ────────────────────────────────────────────────
        const attempt = await this.prisma.userTestAttempt.findFirst({
            where: { id: attemptId, userId },
            include: {
                test: {
                    select: {
                        title: true,
                        category: true,
                        interpretations: true,
                        scoringType: true,
                    },
                },
            },
        })

        if (!attempt) throw new NotFoundException('تلاش یافت نشد')
        if (attempt.status !== 'completed') {
            throw new BadRequestException('تست هنوز تکمیل نشده است')
        }

        // Per-attempt generation cap (only for paid plans since FREE is blocked above)
        const maxGenerations = level === SubscriptionLevel.FREE
            ? MAX_AI_GENERATIONS_FREE
            : MAX_AI_GENERATIONS_PAID

        if (attempt.aiGeneratedCount >= maxGenerations) {
            throw new BadRequestException(
                `حداکثر ${maxGenerations} بار تحلیل هوش مصنوعی برای این تلاش مجاز است`,
            )
        }

        const score = attempt.score as { total?: number; subscales?: Record<string, number> }

        // Find matching interpretation by total score only (no PII — scores only)
        const interpretation = attempt.test.interpretations.find(
            (i) =>
                (score.total ?? 0) >= i.scoreRangeMin &&
                (score.total ?? 0) <= i.scoreRangeMax &&
                !i.subscaleKey,
        )

        let result: AiInsightResult

        if (this.openai) {
            try {
                result = await this.callOpenAI(
                    attempt.test.title,
                    attempt.test.category,
                    score,
                    interpretation?.interpretationText,
                )
            } catch (err) {
                this.logger.error('OpenAI call failed, using static fallback and queuing retry', err)
                result = this.buildFallbackResult(interpretation?.interpretationText, attempt.test.category)
                // Queue async retry so the AI result can be updated later
                await this.enqueueRetry(attemptId, userId)
            }
        } else {
            this.logger.log('OpenAI not configured, using static fallback')
            result = this.buildFallbackResult(interpretation?.interpretationText, attempt.test.category)
        }

        // Persist result and increment usage counter atomically
        await this.prisma.userTestAttempt.update({
            where: { id: attemptId },
            data: {
                aiRecommendations: result as unknown as Prisma.InputJsonValue,
                aiGeneratedCount: { increment: 1 },
            },
        })

        return result
    }

    // ─── Private helpers ────────────────────────────────────────────────────────

    private async callOpenAI(
        testTitle: string,
        category: string,
        score: { total?: number; subscales?: Record<string, number> },
        interpretationText?: string,
    ): Promise<AiInsightResult> {
        const prompt = `
شما یک روانشناس متخصص هستید. نتیجه یک تست روانشناسی را تحلیل کنید.

**نام تست**: ${testTitle}
**دسته‌بندی**: ${category}
**نمره کل**: ${score.total ?? 0}
**خرده‌مقیاس‌ها**: ${JSON.stringify(score.subscales ?? {})}
**تفسیر استاندارد**: ${interpretationText ?? 'موجود نیست'}

تحلیل را به فارسی و در قالب JSON زیر ارائه دهید:
{
  "summary": "خلاصه تحلیل (2-3 جمله)",
  "strengths": ["نقطه قوت ۱", "نقطه قوت ۲"],
  "concerns": ["نگرانی ۱", "نگرانی ۲"],
  "recommendations": ["توصیه ۱", "توصیه ۲", "توصیه ۳"]
}

فقط JSON را برگردانید. هیچ اطلاعات شخصی در تحلیل ذکر نشود.
`.trim()

        const response = await this.openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            max_tokens: 800,
            temperature: 0.7,
        })

        const content = response.choices[0]?.message?.content ?? '{}'
        const parsed = JSON.parse(content) as Partial<AiInsightResult>

        return {
            summary: parsed.summary ?? 'تحلیل هوش مصنوعی در دسترس نیست',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
            generatedAt: new Date().toISOString(),
        }
    }

    private buildFallbackResult(interpretationText?: string, category?: string): AiInsightResult {
        return {
            summary:
                interpretationText ??
                `نتیجه تست در حوزه ${category ?? 'روانشناسی'} پردازش شد.`,
            strengths: ['آگاهی از وضعیت روانی خود', 'انگیزه برای بهبود'],
            concerns: ['برای تحلیل دقیق‌تر با متخصص مشورت کنید'],
            recommendations: [
                'نتایج این تست را با یک روانشناس متخصص در میان بگذارید',
                'تست‌های مکمل را نیز انجام دهید',
                'به طور منظم وضعیت خود را پایش کنید',
            ],
            generatedAt: new Date().toISOString(),
        }
    }

    /**
     * Push a job to BullMQ so a worker can retry the OpenAI call asynchronously.
     * The job payload only contains IDs — no PII.
     */
    private async enqueueRetry(attemptId: string, userId: string): Promise<void> {
        if (!this.retryQueue) {
            this.logger.warn('Retry queue not available; skipping async retry')
            return
        }
        try {
            await this.retryQueue.add(
                'retry-ai-insight',
                { attemptId, userId },
                {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 5000 },
                    removeOnComplete: true,
                    removeOnFail: 100,
                },
            )
            this.logger.log(`Queued AI retry job for attempt ${attemptId}`)
        } catch (err) {
            this.logger.error('Failed to enqueue AI retry job', err)
        }
    }
}
