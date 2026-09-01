import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class AppointmentReminderService {
    private readonly logger = new Logger(AppointmentReminderService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) { }

    /**
     * Runs every hour — finds appointments starting in the next 23–25 hour window
     * and sends an SMS reminder to the user if not already sent.
     */
    @Cron(CronExpression.EVERY_HOUR)
    async sendAppointmentReminders(): Promise<void> {
        const now = new Date();

        // Window: 23 hours from now → 25 hours from now (catches "~24h before")
        const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
        const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

        this.logger.log(
            `[AppointmentReminder] Checking appointments between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`,
        );

        const appointments = await this.prisma.appointment.findMany({
            where: {
                startTime: { gte: windowStart, lte: windowEnd },
                status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
                reminderSent: false,
            },
            include: {
                user: { select: { phone: true, fullName: true } },
                psychologist: {
                    include: { user: { select: { fullName: true } } },
                },
            },
        });

        this.logger.log(`[AppointmentReminder] Found ${appointments.length} appointment(s) to remind`);

        for (const appt of appointments) {
            try {
                const startLocal = appt.startTime.toLocaleTimeString('fa-IR', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const dateLocal = appt.startTime.toLocaleDateString('fa-IR');
                const psychName = appt.psychologist.user.fullName ?? 'روانشناس';
                const userName = appt.user.fullName ? ` ${appt.user.fullName} عزیز،` : '';

                const message =
                    `یاری‌جو — یادآوری نوبت\n` +
                    `${userName}\n` +
                    `نوبت مشاوره شما با ${psychName}\n` +
                    `فردا ${dateLocal} ساعت ${startLocal}\n` +
                    `برگزار می‌شود. منتظر شما هستیم.`;

                await this.sendSms(appt.user.phone, message);

                // Mark as reminded so we don't send again
                await this.prisma.appointment.update({
                    where: { id: appt.id },
                    data: { reminderSent: true },
                });

                this.logger.log(`[AppointmentReminder] Reminder sent for appointment ${appt.id}`);
            } catch (err) {
                this.logger.error(
                    `[AppointmentReminder] Failed for appointment ${appt.id}: ${(err as Error).message}`,
                );
            }
        }
    }

    /**
     * Also send an immediate SMS confirmation when an appointment is confirmed.
     * Called manually from AppointmentService after payment verification.
     */
    async sendConfirmationSms(appointmentId: string): Promise<void> {
        const appt = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                user: { select: { phone: true, fullName: true } },
                psychologist: {
                    include: { user: { select: { fullName: true } } },
                },
            },
        });

        if (!appt) return;

        const startLocal = appt.startTime.toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateLocal = appt.startTime.toLocaleDateString('fa-IR');
        const psychName = appt.psychologist.user.fullName ?? 'روانشناس';
        const userName = appt.user.fullName ? ` ${appt.user.fullName} عزیز،` : '';

        const message =
            `یاری‌جو — تأیید نوبت\n` +
            `${userName}\n` +
            `نوبت مشاوره شما با ${psychName}\n` +
            `تاریخ: ${dateLocal} ساعت: ${startLocal}\n` +
            `با موفقیت ثبت شد.`;

        await this.sendSms(appt.user.phone, message);
        this.logger.log(`[AppointmentReminder] Confirmation SMS sent for appointment ${appointmentId}`);
    }

    private async sendSms(phone: string, message: string): Promise<void> {
        const apiKey = this.config.get<string>('KAVENEGAR_API_KEY');
        if (!apiKey || apiKey === '' || apiKey === 'CHANGE_ME') {
            this.logger.log(`[AppointmentReminder] MOCK SMS → ${phone}: ${message.substring(0, 80)}`);
            return;
        }

        await axios
            .post(
                `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`,
                null,
                { params: { receptor: phone, message, sender: '10008663' } },
            )
            .catch((err: Error) => {
                this.logger.error(`[AppointmentReminder] SMS failed to ${phone}: ${err.message}`);
            });
    }
}
