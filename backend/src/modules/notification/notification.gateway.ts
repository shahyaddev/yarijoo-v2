import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'

interface AuthSocket extends Socket {
    userId?: string
}

/**
 * Notification gateway on the default namespace (/).
 * Each authenticated user joins the room `user:{userId}` on connect.
 * Emits:
 *   - notification:new  → new notification payload
 *   - notification:badge → { unreadCount }
 */
@WebSocketGateway({
    cors: { origin: '*', credentials: true },
})
export class NotificationGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server
    private readonly logger = new Logger(NotificationGateway.name)

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    async handleConnection(client: AuthSocket) {
        try {
            const token = client.handshake.auth?.token as string | undefined
            if (!token) {
                client.disconnect()
                return
            }

            const payload = this.jwtService.verify<{ sub: string }>(token, {
                secret: this.config.get<string>('JWT_SECRET'),
            })

            client.userId = payload.sub
            await client.join(`user:${payload.sub}`)
            this.logger.log(`Notification socket connected: ${payload.sub}`)
        } catch {
            client.disconnect()
        }
    }

    handleDisconnect(client: AuthSocket) {
        this.logger.debug(`Notification socket disconnected: ${client.userId ?? 'unknown'}`)
    }

    /**
     * Push a new notification to a specific user's room.
     */
    sendNotification(userId: string, notification: Record<string, unknown>) {
        this.server.to(`user:${userId}`).emit('notification:new', notification)
    }

    /**
     * Push an updated unread badge count to a specific user's room.
     */
    sendBadgeUpdate(userId: string, unreadCount: number) {
        this.server.to(`user:${userId}`).emit('notification:badge', { unreadCount })
    }
}
