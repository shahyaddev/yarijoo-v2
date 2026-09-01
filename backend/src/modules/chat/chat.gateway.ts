import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { ChatService } from './chat.service'
import { Logger } from '@nestjs/common'

interface AuthenticatedSocket extends Socket {
    userId?: string
    phone?: string
}

@WebSocketGateway({
    cors: { origin: '*', credentials: true },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server
    private readonly logger = new Logger(ChatGateway.name)

    constructor(
        private chatService: ChatService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            const token = client.handshake.auth?.token as string | undefined
            if (!token) {
                client.disconnect()
                return
            }

            const payload = this.jwtService.verify<{ sub: string; phone: string }>(token, {
                secret: this.config.get<string>('JWT_SECRET'),
            })
            client.userId = payload.sub
            client.phone = payload.phone

            // Join personal notification room
            await client.join(`user:${payload.sub}`)
            this.server.emit('user:presence', { userId: payload.sub, status: 'online' })
            this.logger.log(`Client connected: ${payload.sub}`)
        } catch {
            client.disconnect()
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        if (client.userId) {
            this.server.emit('user:presence', { userId: client.userId, status: 'offline' })
            this.logger.log(`Client disconnected: ${client.userId}`)
        }
    }

    @SubscribeMessage('chat:join')
    async handleJoin(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string },
    ) {
        if (!client.userId) return
        const hasAccess = await this.chatService.verifyRoomAccess(client.userId, data.roomId)
        if (!hasAccess) {
            return client.emit('error', { message: 'دسترسی غیرمجاز' })
        }
        await client.join(data.roomId)
        this.logger.log(`${client.userId} joined room ${data.roomId}`)
    }

    @SubscribeMessage('chat:leave')
    async handleLeave(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string },
    ) {
        await client.leave(data.roomId)
    }

    @SubscribeMessage('chat:send')
    async handleSend(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string; content: string; type?: string; fileUrl?: string },
    ) {
        if (!client.userId) return
        const hasAccess = await this.chatService.verifyRoomAccess(client.userId, data.roomId)
        if (!hasAccess) return

        const message = await this.chatService.saveMessage(
            data.roomId,
            client.userId,
            data.content,
            data.type ?? 'text',
            data.fileUrl,
        )

        // Emit unencrypted content to clients
        this.server.to(data.roomId).emit('chat:message', {
            id: message.id,
            roomId: message.roomId,
            senderId: message.senderId,
            content: data.content,
            type: message.type,
            fileUrl: message.fileUrl,
            createdAt: message.createdAt,
        })
    }

    @SubscribeMessage('chat:typing')
    handleTyping(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string; isTyping: boolean },
    ) {
        if (!client.userId) return
        client.to(data.roomId).emit('chat:typing', {
            roomId: data.roomId,
            userId: client.userId,
            isTyping: data.isTyping,
        })
    }

    @SubscribeMessage('chat:read')
    async handleRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string; messageId: string },
    ) {
        if (!client.userId) return
        await this.chatService.markRead(data.roomId, client.userId, data.messageId)
        client.to(data.roomId).emit('chat:read-receipt', {
            roomId: data.roomId,
            userId: client.userId,
            messageId: data.messageId,
        })
    }
}
