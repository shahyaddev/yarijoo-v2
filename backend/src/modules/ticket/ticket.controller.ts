import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common'
import { TicketService } from './ticket.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { AddMessageDto } from './dto/add-message.dto'
import { RateTicketDto } from './dto/rate-ticket.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtUser } from '../auth/strategies/jwt.strategy'
import { TicketPriority } from '@prisma/client'

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
    constructor(private readonly ticketService: TicketService) { }

    /**
     * POST /api/v1/tickets
     * Create a new support ticket with an initial message.
     */
    @Post()
    createTicket(@CurrentUser() user: JwtUser, @Body() dto: CreateTicketDto) {
        const priority = (dto.priority as TicketPriority | undefined) ?? TicketPriority.MEDIUM
        return this.ticketService.createTicket(user.sub, dto.subject, dto.content, priority)
    }

    /**
     * GET /api/v1/tickets
     * List the authenticated user's own tickets.
     */
    @Get()
    getTickets(@CurrentUser() user: JwtUser) {
        return this.ticketService.getUserTickets(user.sub)
    }

    /**
     * GET /api/v1/tickets/:id
     * Get a single ticket with its full message thread.
     */
    @Get(':id')
    getTicket(@Param('id') id: string, @CurrentUser() user: JwtUser) {
        return this.ticketService.getTicketById(user.sub, id)
    }

    /**
     * POST /api/v1/tickets/:id/messages
     * Append a user message to a ticket and notify the other party.
     */
    @Post(':id/messages')
    @HttpCode(HttpStatus.OK)
    addMessage(
        @Param('id') id: string,
        @CurrentUser() user: JwtUser,
        @Body() dto: AddMessageDto,
    ) {
        return this.ticketService.addMessage(user.sub, id, dto.content)
    }

    /**
     * PATCH /api/v1/tickets/:id/close
     * Close a ticket (user-initiated).
     */
    @Patch(':id/close')
    @HttpCode(HttpStatus.OK)
    closeTicket(@Param('id') id: string, @CurrentUser() user: JwtUser) {
        return this.ticketService.closeTicket(user.sub, id)
    }

    /**
     * POST /api/v1/tickets/:id/rate
     * Rate the support quality for a resolved/closed ticket.
     */
    @Post(':id/rate')
    @HttpCode(HttpStatus.OK)
    rateTicket(
        @Param('id') id: string,
        @CurrentUser() user: JwtUser,
        @Body() dto: RateTicketDto,
    ) {
        return this.ticketService.rateTicket(user.sub, id, dto.rating)
    }
}
