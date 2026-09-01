import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { NotificationGateway } from './notification.gateway'
import { Prisma } from '@prisma/client'

@Injectable()
export class NotificationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: NotificationGateway,
    ) { }

    /**
     * Create a notification in the database and emit it to the user via WebSocket.
     *
     * Satisfies Requirement 9.1 (in-app real-time delivery) and 9.3 (storage with
     * type, title, body, is_read, created_at).
     */
    async notify(
        userId: string,
        type: string,
        title: string,
        body: string,
        data?: Record<string, unknown>,
    ) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                body,
                data: (data ?? Prisma.JsonNull) as Prisma.InputJsonValue,
                isRead: false,
            },
        })

        // Emit real-time event to the user's personal socket room
        this.gateway.sendNotification(userId, {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: notification.data,
            createdAt: notification.createdAt,
        })

        return notification
    }

    /**
     * Paginated list of notifications for a user.
     * Returns unreadCount for use in response headers (X-Unread-Count).
     */
    async getNotifications(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit
        const [items, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ])

        return {
            items,
            total,
            unreadCount,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    }

    /**
     * Mark all unread notifications as read for a user.
     * Emits notification:badge with unreadCount=0 after the update.
     *
     * Satisfies Requirement 9.4 (mark as read within 500 ms).
     */
    async markAllRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        })

        this.gateway.sendBadgeUpdate(userId, 0)
        return { message: 'همه اعلان‌ها خوانده شدند' }
    }

    /**
     * Mark a single notification as read.
     * Emits notification:badge with the updated unreadCount after the update.
     *
     * Satisfies Requirement 9.4.
     */
    async markOneRead(userId: string, notificationId: string) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        })
        if (!notification) throw new NotFoundException('اعلان یافت نشد')

        if (!notification.isRead) {
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true },
            })
        }

        const unreadCount = await this.prisma.notification.count({
            where: { userId, isRead: false },
        })

        this.gateway.sendBadgeUpdate(userId, unreadCount)
        return { message: 'اعلان خوانده شد' }
    }
}
