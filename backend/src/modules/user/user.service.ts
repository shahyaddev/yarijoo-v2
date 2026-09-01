import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { MinioService } from './minio.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { CreateBookmarkDto } from './dto/create-bookmark.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly minio: MinioService,
    ) { }

    // ── Profile ────────────────────────────────────────────────────────
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                role: true,
                subscriptionLevel: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        })
        if (!user) throw new NotFoundException('کاربر یافت نشد')
        return user
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        // Only update fields that exist in the User model
        const { bio: _bio, ...updateData } = dto
        return this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                phone: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                role: true,
                subscriptionLevel: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        })
    }

    // ── Avatar ─────────────────────────────────────────────────────────
    async getAvatarUploadUrl(userId: string): Promise<{ uploadUrl: string; objectName: string }> {
        const objectName = `avatars/${userId}/${randomUUID()}.jpg`
        const uploadUrl = await this.minio.getPresignedUploadUrl(objectName)
        return { uploadUrl, objectName }
    }

    async confirmAvatarUpload(userId: string, objectName: string) {
        const avatarUrl = this.minio.getPublicUrl(objectName)
        return this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
            select: { id: true, avatarUrl: true },
        })
    }

    // ── Bookmarks ──────────────────────────────────────────────────────
    async getBookmarks(userId: string) {
        return this.prisma.bookmark.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        })
    }

    async createBookmark(userId: string, dto: CreateBookmarkDto) {
        const existing = await this.prisma.bookmark.findUnique({
            where: { userId_type_targetId: { userId, type: dto.type, targetId: dto.targetId } },
        })
        if (existing) throw new ConflictException('نشانک قبلاً اضافه شده است')
        return this.prisma.bookmark.create({
            data: { userId, type: dto.type, targetId: dto.targetId },
        })
    }

    async deleteBookmark(userId: string, bookmarkId: string) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: { id: bookmarkId, userId },
        })
        if (!bookmark) throw new NotFoundException('نشانک یافت نشد')
        await this.prisma.bookmark.delete({ where: { id: bookmarkId } })
        return { message: 'نشانک حذف شد' }
    }

    // ── Notifications ──────────────────────────────────────────────────
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
        return { items, total, unreadCount, page, limit }
    }

    async markAllNotificationsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        })
        return { message: 'همه اعلان‌ها خوانده شدند' }
    }

    async markNotificationRead(userId: string, notificationId: string) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        })
        if (!notification) throw new NotFoundException('اعلان یافت نشد')
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        })
    }

    // ── Data Export ─────────────────────────────────────────────────────
    async exportUserData(userId: string) {
        const [user, testAttempts, orders, bookmarks, notifications] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, phone: true, email: true, fullName: true, createdAt: true },
            }),
            this.prisma.userTestAttempt.findMany({
                where: { userId },
                select: { testId: true, score: true, completedAt: true },
            }),
            this.prisma.order.findMany({
                where: { userId },
                select: { id: true, totalAmount: true, status: true, createdAt: true },
            }),
            this.prisma.bookmark.findMany({ where: { userId } }),
            this.prisma.notification.findMany({
                where: { userId },
                take: 100,
                orderBy: { createdAt: 'desc' },
            }),
        ])
        return { user, testAttempts, orders, bookmarks, notifications, exportedAt: new Date() }
    }

    // ── Account Deletion ────────────────────────────────────────────────
    async requestAccountDeletion(userId: string) {
        const deletedAt = new Date()
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                phone: `deleted_${userId}_${deletedAt.getTime()}`,
                email: null,
                fullName: null,
                avatarUrl: null,
                isVerified: false,
                isSuspended: true,
            },
        })
        return { message: 'درخواست حذف حساب ثبت شد. اطلاعات شخصی در ۳۰ روز آینده پاک خواهد شد.' }
    }
}
