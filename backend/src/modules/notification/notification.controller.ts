import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { NotificationService } from './notification.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtUser } from '../auth/strategies/jwt.strategy'

/**
 * Provides notification endpoints under /api/v1/users/notifications.
 *
 * Note: UserController already registers routes at /users, but the notification
 * specific routes with badge headers and real-time badge updates live here,
 * powered by NotificationService (which includes Socket.io emissions).
 *
 * The routes are mounted at /notifications (mapped via app prefix /api/v1)
 * matching the spec requirement: GET /api/v1/users/notifications.
 * Since UserController owns the /users prefix, we keep a separate /notifications
 * controller so NotificationModule is self-contained and can be imported
 * by any module that needs to send notifications.
 */
@Controller('users/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    /**
     * GET /api/v1/users/notifications?page=N
     * Returns paginated notifications; unread count in X-Unread-Count header.
     */
    @Get()
    async getNotifications(
        @CurrentUser() user: JwtUser,
        @Query('page') page = '1',
        @Res({ passthrough: true }) reply: FastifyReply,
    ) {
        const result = await this.notificationService.getNotifications(
            user.sub,
            Number(page),
        )
        reply.header('X-Unread-Count', String(result.unreadCount))
        return result
    }

    /**
     * PATCH /api/v1/users/notifications/read
     * Mark ALL notifications as read; emits notification:badge via WebSocket.
     */
    @Patch('read')
    @HttpCode(HttpStatus.OK)
    markAllRead(@CurrentUser() user: JwtUser) {
        return this.notificationService.markAllRead(user.sub)
    }

    /**
     * PATCH /api/v1/users/notifications/:id/read
     * Mark a single notification as read; emits notification:badge via WebSocket.
     */
    @Patch(':id/read')
    @HttpCode(HttpStatus.OK)
    markOneRead(@CurrentUser() user: JwtUser, @Param('id') id: string) {
        return this.notificationService.markOneRead(user.sub, id)
    }
}
