import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { Prisma, AppointmentStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentService } from '../shop/payment.service';
import { AppointmentReminderService } from './appointment-reminder.service';
import { GetPsychologistsDto } from './dto/get-psychologists.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ReviewAppointmentDto } from './dto/review-appointment.dto';

@Injectable()
export class AppointmentService {
    private readonly logger = new Logger(AppointmentService.name);

    constructor(
        private prisma: PrismaService,
        private payment: PaymentService,
        private reminder: AppointmentReminderService,
        private config: ConfigService,
    ) { }

    async getPsychologists(dto: GetPsychologistsDto) {
        const { specialty, sort = 'rating', page = 1, limit = 12 } = dto;
        const skip = (page - 1) * limit;

        const where: Prisma.PsychologistProfileWhereInput = {
            isVerified: true,
            isAvailable: true,
        };

        if (specialty) {
            where.specialty = { has: specialty };
        }

        const orderBy: Prisma.PsychologistProfileOrderByWithRelationInput =
            sort === 'price' ? { hourlyRate: 'asc' } : { rating: 'desc' };

        const [psychologists, total] = await Promise.all([
            this.prisma.psychologistProfile.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
            }),
            this.prisma.psychologistProfile.count({ where }),
        ]);

        return {
            psychologists,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getPsychologistById(id: string) {
        const psychologist = await this.prisma.psychologistProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!psychologist) {
            throw new NotFoundException('روانشناس یافت نشد');
        }

        return psychologist;
    }

    async getAvailability(psychologistId: string, date: string) {
        const psychologist = await this.prisma.psychologistProfile.findUnique({
            where: { id: psychologistId },
            select: { availability: true },
        });

        if (!psychologist) {
            throw new NotFoundException('روانشناس یافت نشد');
        }

        const targetDate = new Date(date);
        const dayName = targetDate
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase();

        const weeklySchedule = psychologist.availability as Record<
            string,
            { slots: string[] }
        > | null;
        const daySlots: string[] = weeklySchedule?.[dayName]?.slots ?? [];

        // Get booked slots for this date
        const dayStart = new Date(date + 'T00:00:00.000Z');
        const dayEnd = new Date(date + 'T23:59:59.999Z');

        const bookedAppointments = await this.prisma.appointment.findMany({
            where: {
                psychologistId,
                startTime: { gte: dayStart, lte: dayEnd },
                status: {
                    in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
                },
            },
            select: { startTime: true, endTime: true },
        });

        const bookedSlots = new Set(
            bookedAppointments.map((a) =>
                a.startTime.toISOString().slice(11, 16),
            ),
        );

        const availableSlots = daySlots.filter((slot) => !bookedSlots.has(slot));

        return {
            date,
            psychologistId,
            availableSlots,
            bookedSlots: Array.from(bookedSlots),
        };
    }

    async createAppointment(userId: string, dto: CreateAppointmentDto) {
        const psychologist = await this.prisma.psychologistProfile.findUnique({
            where: { id: dto.psychologistId },
        });

        if (!psychologist) {
            throw new NotFoundException('روانشناس یافت نشد');
        }

        // Check for slot conflict (overlapping bookings)
        const existing = await this.prisma.appointment.findFirst({
            where: {
                psychologistId: dto.psychologistId,
                status: {
                    in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
                },
                AND: [
                    { startTime: { lt: new Date(dto.endTime) } },
                    { endTime: { gt: new Date(dto.startTime) } },
                ],
            },
        });

        if (existing) {
            throw new ConflictException('این زمان قبلاً رزرو شده است');
        }

        const amount = psychologist.hourlyRate ?? 0;

        const appointment = await this.prisma.appointment.create({
            data: {
                userId,
                psychologistId: dto.psychologistId,
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                status: AppointmentStatus.PENDING,
                paidAmount: amount,
            },
        });

        // If there is a price, initiate Zarinpal payment
        if (amount > 0) {
            const frontendUrl =
                this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
            const callbackUrl = `${frontendUrl}/appointments/callback?appointmentId=${appointment.id}`;

            try {
                const { authority, redirectUrl } = await this.payment.requestPayment(
                    amount,
                    `رزرو نوبت مشاوره — ${appointment.id.slice(0, 8)}`,
                    callbackUrl,
                );

                // Persist authority for verification later
                await this.prisma.appointment.update({
                    where: { id: appointment.id },
                    data: { zarinpalAuthority: authority },
                });

                return { appointment, redirectUrl, requiresPayment: true };
            } catch (err) {
                // Roll back the appointment on payment gateway failure
                await this.prisma.appointment.delete({ where: { id: appointment.id } });
                this.logger.error('Zarinpal request failed for appointment', err);
                throw new BadRequestException('خطا در اتصال به درگاه پرداخت. لطفاً دوباره تلاش کنید.');
            }
        }

        return { appointment, requiresPayment: false };
    }

    async verifyAppointmentPayment(appointmentId: string, authority: string, status: string) {
        const appointment = await this.prisma.appointment.findFirst({
            where: { id: appointmentId, zarinpalAuthority: authority },
        });

        if (!appointment) {
            throw new NotFoundException('نوبت یافت نشد');
        }

        if (status !== 'OK') {
            await this.prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: AppointmentStatus.CANCELLED },
            });
            return { success: false, message: 'پرداخت ناموفق بود. نوبت لغو شد.' };
        }

        const amount = appointment.paidAmount ?? 0;
        const { refId, success } = await this.payment.verifyPayment(authority, amount);

        if (!success) {
            await this.prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: AppointmentStatus.CANCELLED },
            });
            return { success: false, message: 'تأیید پرداخت ناموفق بود. نوبت لغو شد.' };
        }

        await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: AppointmentStatus.CONFIRMED,
                zarinpalRefId: String(refId),
            },
        });

        // Send confirmation SMS asynchronously (fire-and-forget)
        this.reminder.sendConfirmationSms(appointmentId).catch((err: Error) =>
            this.logger.warn(`Could not send confirmation SMS: ${err.message}`),
        );

        return { success: true, refId, appointmentId };
    }

    async cancelAppointment(userId: string, appointmentId: string) {
        const appointment = await this.prisma.appointment.findFirst({
            where: { id: appointmentId, userId },
        });

        if (!appointment) {
            throw new NotFoundException('نوبت یافت نشد');
        }

        if (appointment.status === AppointmentStatus.CANCELLED) {
            throw new BadRequestException('نوبت قبلاً لغو شده است');
        }

        // Enforce 2-hour cancellation policy
        const hoursUntil =
            (appointment.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
        const canRefund = hoursUntil >= 2;

        await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: AppointmentStatus.CANCELLED },
        });

        return {
            message: 'نوبت لغو شد',
            refundEligible: canRefund,
            refundMessage: canRefund
                ? 'مبلغ پرداختی ظرف ۳ روز کاری بازگشت داده می‌شود'
                : 'لغو کمتر از ۲ ساعت قبل — طبق قوانین بازگشت وجه انجام نمی‌شود',
        };
    }

    async reviewAppointment(
        userId: string,
        appointmentId: string,
        dto: ReviewAppointmentDto,
    ) {
        const appointment = await this.prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                userId,
                status: AppointmentStatus.COMPLETED,
            },
        });

        if (!appointment) {
            throw new NotFoundException('نوبت تکمیل‌شده یافت نشد');
        }

        await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { rating: dto.rating, review: dto.review },
        });

        // Recalculate and update psychologist's average rating
        const allRatings = await this.prisma.appointment.findMany({
            where: {
                psychologistId: appointment.psychologistId,
                rating: { not: null },
            },
            select: { rating: true },
        });

        const avg =
            allRatings.reduce((sum, a) => sum + (a.rating ?? 0), 0) /
            allRatings.length;

        await this.prisma.psychologistProfile.update({
            where: { id: appointment.psychologistId },
            data: {
                rating: Math.round(avg * 10) / 10,
                reviewCount: allRatings.length,
            },
        });

        return { message: 'نظر ثبت شد', rating: dto.rating };
    }

    async getUserAppointments(userId: string) {
        return this.prisma.appointment.findMany({
            where: { userId },
            orderBy: { startTime: 'desc' },
            include: {
                psychologist: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
    }
}
