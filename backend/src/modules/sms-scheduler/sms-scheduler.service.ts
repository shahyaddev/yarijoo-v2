import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class SmsSchedulerService implements OnModuleDestroy {
    private readonly logger = new Logger(SmsSchedulerService.name);
    private pool: Pool;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {
        this.pool = new Pool({
            connectionString: this.config.get<string>('DATABASE_URL'),
        });
    }

    /** Run every hour — send pending daily SMS packages */
    @Cron(CronExpression.EVERY_HOUR)
    async sendDailySmsPackages(): Promise<void> {
        const currentHour = new Date().getHours();
        this.logger.log(`[SmsScheduler] Hour ${currentHour} — checking pending SMS...`);

        try {
            const { rows: subs } = await this.pool.query(`
                SELECT uss.id, uss.user_id, uss.package_id, uss.current_day,
                       sp.duration_days, sp.send_hour, sp.title
                FROM user_sms_subscriptions uss
                JOIN sms_packages sp ON sp.id = uss.package_id
                WHERE uss.is_active = true
                  AND (uss.next_send_at IS NULL OR uss.next_send_at <= NOW())
                  AND sp.send_hour = $1
                  AND uss.current_day <= sp.duration_days
            `, [currentHour]);

            this.logger.log(`[SmsScheduler] Processing ${subs.length} subscriptions`);

            for (const sub of subs) {
                await this.processSub(sub).catch(e =>
                    this.logger.error(`[SmsScheduler] sub ${sub.id}: ${(e as Error).message}`)
                );
            }
        } catch (e) {
            this.logger.error(`[SmsScheduler] ${(e as Error).message}`);
        }
    }

    private async processSub(sub: {
        id: string; user_id: string; package_id: string;
        current_day: number; duration_days: number; send_hour: number;
    }): Promise<void> {
        // Get message for current day
        const { rows: msgs } = await this.pool.query(
            `SELECT message FROM sms_package_messages WHERE package_id = $1 AND day_number = $2`,
            [sub.package_id, sub.current_day]
        );

        if (msgs.length > 0) {
            const user = await this.prisma.user.findUnique({
                where: { id: sub.user_id }, select: { phone: true }
            });
            if (user?.phone) {
                await this.sendSms(user.phone, msgs[0].message as string);
            }
        }

        const nextDay = sub.current_day + 1;
        const done = nextDay > sub.duration_days;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(sub.send_hour, 0, 0, 0);

        await this.pool.query(
            `UPDATE user_sms_subscriptions SET current_day=$1, next_send_at=$2, is_active=$3 WHERE id=$4`,
            [nextDay, done ? null : tomorrow.toISOString(), !done, sub.id]
        );
    }

    private async sendSms(phone: string, message: string): Promise<void> {
        const apiKey = this.config.get<string>('KAVENEGAR_API_KEY');
        if (!apiKey || apiKey === 'CHANGE_ME' || apiKey === '') {
            this.logger.log(`[SmsScheduler] MOCK → ${phone}: ${message.substring(0, 60)}`);
            return;
        }
        const axios = (await import('axios')).default;
        await axios.post(
            `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`,
            null,
            { params: { receptor: phone, message, sender: '10008663' } }
        ).catch(e => this.logger.error(`[SmsScheduler] SMS failed: ${(e as Error).message}`));
    }

    /** Called after a user purchases an SMS package */
    async subscribeUserToPackage(userId: string, packageId: string): Promise<void> {
        const { rows } = await this.pool.query(
            'SELECT send_hour FROM sms_packages WHERE id = $1', [packageId]
        );
        if (!rows.length) return;

        const sendHour = rows[0].send_hour as number;
        const firstSend = new Date();
        firstSend.setHours(sendHour, 0, 0, 0);
        if (firstSend <= new Date()) firstSend.setDate(firstSend.getDate() + 1);

        await this.pool.query(
            `INSERT INTO user_sms_subscriptions (user_id, package_id, current_day, is_active, next_send_at)
             VALUES ($1, $2, 1, true, $3) ON CONFLICT DO NOTHING`,
            [userId, packageId, firstSend.toISOString()]
        );
        this.logger.log(`[SmsScheduler] ${userId} subscribed to ${packageId}`);
    }

    async onModuleDestroy() {
        await this.pool.end().catch(() => { });
    }
}
