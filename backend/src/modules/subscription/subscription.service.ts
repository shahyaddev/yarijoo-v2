import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../prisma/prisma.service'
import { SUBSCRIPTION_PLANS } from './plans.config'
import { SubscriptionLevel } from '@prisma/client'

@Injectable()
export class SubscriptionService {
    private readonly logger = new Logger(SubscriptionService.name)

    constructor(private prisma: PrismaService) { }

    getPlans() {
        return Object.values(SUBSCRIPTION_PLANS)
    }

    async getCurrentSubscription(userId: string) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { userId, isActive: true, endDate: { gt: new Date() } },
            orderBy: { endDate: 'desc' },
        })
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionLevel: true },
        })
        return {
            subscription,
            level: user?.subscriptionLevel ?? 'FREE',
            plans: SUBSCRIPTION_PLANS,
        }
    }

    async subscribe(userId: string, planLevel: string, period: 'monthly' | 'yearly') {
        const plan = SUBSCRIPTION_PLANS[planLevel as keyof typeof SUBSCRIPTION_PLANS]
        if (!plan) throw new NotFoundException('پلن یافت نشد')

        const durationDays = period === 'yearly' ? 365 : 30
        const startDate = new Date()
        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)

        // Deactivate current subscriptions
        await this.prisma.subscription.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false },
        })

        const subscription = await this.prisma.subscription.create({
            data: {
                userId,
                plan: planLevel as SubscriptionLevel,
                startDate,
                endDate,
                isActive: true,
            },
        })

        // Update user's subscription level
        await this.prisma.user.update({
            where: { id: userId },
            data: { subscriptionLevel: planLevel as SubscriptionLevel },
        })

        return subscription
    }

    async cancel(userId: string) {
        await this.prisma.subscription.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false },
        })
        await this.prisma.user.update({
            where: { id: userId },
            data: { subscriptionLevel: SubscriptionLevel.FREE },
        })
        return { message: 'اشتراک لغو شد' }
    }

    /**
     * Runs every day at 2 AM.
     * Finds active subscriptions that have expired and downgrades
     * the user's subscriptionLevel back to FREE.
     */
    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async expireSubscriptions(): Promise<void> {
        const now = new Date()

        // Find active subscriptions whose endDate has passed
        const expired = await this.prisma.subscription.findMany({
            where: {
                isActive: true,
                endDate: { lt: now },
            },
            select: { id: true, userId: true, plan: true },
        })

        if (expired.length === 0) {
            this.logger.log('[SubscriptionExpiry] No expired subscriptions found')
            return
        }

        this.logger.log(`[SubscriptionExpiry] Expiring ${expired.length} subscription(s)`)

        for (const sub of expired) {
            try {
                // Mark subscription as inactive
                await this.prisma.subscription.update({
                    where: { id: sub.id },
                    data: { isActive: false },
                })

                // Downgrade user only if they have no other active subscription
                const stillActive = await this.prisma.subscription.findFirst({
                    where: {
                        userId: sub.userId,
                        isActive: true,
                        endDate: { gt: now },
                    },
                })

                if (!stillActive) {
                    await this.prisma.user.update({
                        where: { id: sub.userId },
                        data: { subscriptionLevel: SubscriptionLevel.FREE },
                    })
                    this.logger.log(
                        `[SubscriptionExpiry] User ${sub.userId} downgraded to FREE (was ${sub.plan})`,
                    )
                }
            } catch (err) {
                this.logger.error(
                    `[SubscriptionExpiry] Failed for sub ${sub.id}: ${(err as Error).message}`,
                )
            }
        }
    }
}
