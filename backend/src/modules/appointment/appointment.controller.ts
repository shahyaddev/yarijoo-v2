import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { GetPsychologistsDto } from './dto/get-psychologists.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ReviewAppointmentDto } from './dto/review-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/strategies/jwt.strategy';

@Controller()
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    /**
     * GET /api/v1/psychologists
     * List verified, available psychologists with optional specialty filter,
     * sort by rating/price, and pagination.
     */
    @Get('psychologists')
    getPsychologists(@Query() dto: GetPsychologistsDto) {
        return this.appointmentService.getPsychologists(dto);
    }

    /**
     * GET /api/v1/psychologists/:id
     * Return full profile for a single psychologist including average rating.
     */
    @Get('psychologists/:id')
    getPsychologist(@Param('id') id: string) {
        return this.appointmentService.getPsychologistById(id);
    }

    /**
     * GET /api/v1/psychologists/:id/availability?date=YYYY-MM-DD
     * Compute free 30/60-min slots from weekly schedule minus booked appointments.
     */
    @Get('psychologists/:id/availability')
    getAvailability(
        @Param('id') id: string,
        @Query('date') date: string,
    ) {
        const targetDate =
            date || new Date().toISOString().slice(0, 10);
        return this.appointmentService.getAvailability(id, targetDate);
    }

    /**
     * POST /api/v1/appointments
     * Reserve a slot: checks for conflicts, creates the appointment, returns details.
     */
    @Post('appointments')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    createAppointment(
        @CurrentUser() user: JwtUser,
        @Body() dto: CreateAppointmentDto,
    ) {
        return this.appointmentService.createAppointment(user.sub, dto);
    }

    /**
     * GET /api/v1/appointments
     * Return the authenticated user's appointment history.
     */
    @Get('appointments')
    @UseGuards(JwtAuthGuard)
    getUserAppointments(@CurrentUser() user: JwtUser) {
        return this.appointmentService.getUserAppointments(user.sub);
    }

    /**
     * PATCH /api/v1/appointments/:id/cancel
     * Cancel an appointment; enforce 2-hour policy; flag refund eligibility.
     */
    @Patch('appointments/:id/cancel')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    cancelAppointment(
        @Param('id') id: string,
        @CurrentUser() user: JwtUser,
    ) {
        return this.appointmentService.cancelAppointment(user.sub, id);
    }

    /**
     * POST /api/v1/appointments/:id/review
     * Save a rating (1–5) and optional text review; update psychologist's avg rating.
     */
    @Post('appointments/:id/review')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    reviewAppointment(
        @Param('id') id: string,
        @CurrentUser() user: JwtUser,
        @Body() dto: ReviewAppointmentDto,
    ) {
        return this.appointmentService.reviewAppointment(user.sub, id, dto);
    }

    /**
     * GET /api/v1/appointments/callback
     * Zarinpal callback after payment for appointment booking.
     */
    @Get('appointments/callback')
    verifyAppointmentPayment(
        @Query('appointmentId') appointmentId: string,
        @Query('Authority') authority: string,
        @Query('Status') status: string,
    ) {
        return this.appointmentService.verifyAppointmentPayment(appointmentId, authority, status);
    }
}
