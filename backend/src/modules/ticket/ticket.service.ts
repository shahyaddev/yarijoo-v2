import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { TicketStatus, TicketPriority } from '@prisma/client'
import { NotificationService } from '../notification/notification.service'

@Injectable()
export class TicketService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
    ) { }

    /**
     * Generate a human-readable ticket number like TKT-2024-0001.
     * This is a computed value returned to the caller; it is not stored
     * in the database since the schema has no ticketNumber column.
     */
    private async generateTicketNumber(): Promise<string> {
        const year = new Date().getFullYear()
        const count = await this.prisma.ticket.count()
        return `TKT-${year}-${String(count + 1).padStart(4, '0')}`
    }

    async createTicket(
        userId: string,
        subject: string,
        content: string,
        priority: TicketPriority = TicketPriority.MEDIUM,
    ) {
        const ticketNumber = await this.generateTicketNumber()

        const ticket = await this.prisma.ticket.create({
            data: {
                userId,
                subject,
                status: TicketStatus.OPEN,
                priority,
                messages: {
                    create: { senderId: userId, content, isAdmin: false },
                },
            },
            include: { messages: true },
        })

        return { ...ticket, ticketNumber }
    }

    async getUserTickets(userId: string) {
        return this.prisma.ticket.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                _count: { select: { messages: true } },
            },
        })
    }

    async getTicketById(userId: string, ticketId: string) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { id: ticketId, userId },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
            },
        })
        if (!ticket) throw new NotFoundException('تیکت یافت نشد')
        return ticket
    }

    async addMessage(
        userId: string,
        ticketId: string,
        content: string,
        isAdmin = false,
    ) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { id: ticketId },
            select: { id: true, userId: true, status: true },
        })
        if (!ticket) throw new NotFoundException('تیکت یافت نشد')

        const message = await this.prisma.ticketMessage.create({
            data: { ticketId, senderId: userId, content, isAdmin },
        })

        // Update ticket status based on who replied
        const newStatus = isAdmin
            ? TicketStatus.WAITING_FOR_USER
            : TicketStatus.IN_PROGRESS

        await this.prisma.ticket.update({
            where: { id: ticketId },
            data: { status: newStatus, updatedAt: new Date() },
        })

        // Notify the user when admin replies
        if (isAdmin) {
            await this.notificationService.notify(
                ticket.userId,
                'ticket_reply',
                'پاسخ جدید به تیکت شما',
                content.slice(0, 100),
                { ticketId },
            )
        }

        return message
    }

    async closeTicket(userId: string, ticketId: string) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { id: ticketId, userId },
        })
        if (!ticket) throw new NotFoundException('تیکت یافت نشد')

        await this.prisma.ticket.update({
            where: { id: ticketId },
            data: { status: TicketStatus.CLOSED },
        })

        return { message: 'تیکت بسته شد' }
    }

    async rateTicket(userId: string, ticketId: string, rating: number) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { id: ticketId, userId },
        })
        if (!ticket) throw new NotFoundException('تیکت یافت نشد')

        await this.prisma.ticket.update({
            where: { id: ticketId },
            data: { rating, status: TicketStatus.RESOLVED },
        })

        return { message: 'امتیاز ثبت شد' }
    }
}
