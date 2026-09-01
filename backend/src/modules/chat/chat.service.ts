import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import * as crypto from 'crypto'

const ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY?.padEnd(32, '0').slice(0, 32) ?? '0'.repeat(32)
const IV_LENGTH = 16

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    private encrypt(text: string): string {
        try {
            const iv = crypto.randomBytes(IV_LENGTH)
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
            let encrypted = cipher.update(text, 'utf8', 'hex')
            encrypted += cipher.final('hex')
            return iv.toString('hex') + ':' + encrypted
        } catch {
            return text
        }
    }

    private decrypt(encryptedText: string): string {
        try {
            if (!encryptedText.includes(':')) return encryptedText
            const [ivHex, encrypted] = encryptedText.split(':')
            const iv = Buffer.from(ivHex, 'hex')
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
            let decrypted = decipher.update(encrypted, 'hex', 'utf8')
            decrypted += decipher.final('utf8')
            return decrypted
        } catch {
            return encryptedText
        }
    }

    async getUserRooms(userId: string) {
        const memberships = await this.prisma.chatRoomMember.findMany({
            where: { userId },
            include: {
                room: {
                    include: {
                        members: {
                            include: {
                                user: { select: { id: true, fullName: true, avatarUrl: true } },
                            },
                        },
                        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        })

        return memberships.map(({ room }) => ({
            ...room,
            messages: room.messages.map((m) => ({ ...m, content: this.decrypt(m.content) })),
        }))
    }

    async getRoomMessages(userId: string, roomId: string, cursor?: string) {
        // Verify member access
        const member = await this.prisma.chatRoomMember.findUnique({
            where: { roomId_userId: { roomId, userId } },
        })
        if (!member) throw new ForbiddenException('شما عضو این چت‌روم نیستید')

        const messages = await this.prisma.chatMessage.findMany({
            where: {
                roomId,
                ...(cursor ? { id: { lt: cursor } } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 30,
        })

        return messages.map((m) => ({ ...m, content: this.decrypt(m.content) })).reverse()
    }

    async saveMessage(
        roomId: string,
        senderId: string,
        content: string,
        type = 'text',
        fileUrl?: string,
    ) {
        const encrypted = this.encrypt(content)
        return this.prisma.chatMessage.create({
            data: {
                roomId,
                senderId,
                content: encrypted,
                type,
                fileUrl: fileUrl ?? null,
                readBy: [],
            },
        })
    }

    async verifyRoomAccess(userId: string, roomId: string): Promise<boolean> {
        const member = await this.prisma.chatRoomMember.findUnique({
            where: { roomId_userId: { roomId, userId } },
        })
        return !!member
    }

    async markRead(roomId: string, userId: string, messageId: string) {
        const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } })
        if (!message) return
        if (!message.readBy.includes(userId)) {
            await this.prisma.chatMessage.update({
                where: { id: messageId },
                data: { readBy: { push: userId } },
            })
        }
    }
}
