import {
    BadRequestException,
    Injectable,
    Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService<AppConfig, true>,
    ) { }

    /**
     * Normalise phone numbers to +98 format.
     * Accepts: 09xx, +989xx, 9xx
     */
    normalizePhone(phone: string): string {
        // Remove spaces
        const clean = phone.trim().replace(/\s/g, '');

        if (clean.startsWith('+98')) {
            return clean;
        }
        if (clean.startsWith('0')) {
            return '+98' + clean.slice(1);
        }
        if (clean.startsWith('98')) {
            return '+' + clean;
        }
        // bare 9xx
        return '+98' + clean;
    }

    /**
     * Send an OTP to the given phone number.
     * Enforces max 3 OTPs per 10 minutes per phone number.
     */
    async sendOtp(phone: string): Promise<void> {
        const normalised = this.normalizePhone(phone);

        // Rate-limit check: count OTPs in last 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentCount = await this.prisma.otpCode.count({
            where: {
                phone: normalised,
                createdAt: { gte: tenMinutesAgo },
            },
        });

        if (recentCount >= 3) {
            throw new BadRequestException(
                'تعداد درخواست‌های ارسال کد بیش از حد مجاز است. لطفاً ۱۰ دقیقه صبر کنید.',
            );
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this.prisma.otpCode.create({
            data: { phone: normalised, code, expiresAt },
        });

        await this.sendSms(normalised, code);
    }

    /**
     * Verify OTP. Returns true if valid, false otherwise.
     */
    async verifyOtp(phone: string, code: string): Promise<boolean> {
        const normalised = this.normalizePhone(phone);
        const now = new Date();

        const otp = await this.prisma.otpCode.findFirst({
            where: {
                phone: normalised,
                code,
                used: false,
                expiresAt: { gt: now },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otp) {
            return false;
        }

        await this.prisma.otpCode.update({
            where: { id: otp.id },
            data: { used: true },
        });

        return true;
    }

    /**
     * Cleanup expired and used OTP codes.
     * Runs every day at 3 AM to keep the otp_codes table lean.
     */
    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async cleanupExpiredOtps(): Promise<void> {
        const now = new Date();
        const result = await this.prisma.otpCode.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: now } },
                    { used: true },
                ],
            },
        });
        this.logger.log(`[OTP Cleanup] Deleted ${result.count} expired/used OTP records`);
    }

    /**
     * Send SMS via Kavenegar or fallback to console.
     */
    private async sendSms(phone: string, code: string): Promise<void> {
        const apiKey = this.config.get('kavenegar.apiKey', { infer: true });

        if (!apiKey || apiKey === '' || apiKey === 'CHANGE_ME') {
            this.logger.log(`[OTP] SMS to ${phone}: ${code}`);
            return;
        }

        try {
            const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;
            await axios.post(url, null, {
                params: {
                    receptor: phone,
                    message: `کد تأیید یاریجو: ${code}`,
                    sender: '10008663',
                },
            });
            this.logger.log(`[OTP] SMS sent to ${phone}`);
        } catch (err) {
            this.logger.error(`[OTP] Failed to send SMS to ${phone}: ${(err as Error).message}`);
            // Don't throw — code is saved in DB, user can retry
        }
    }
}
