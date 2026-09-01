import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TestModule } from './modules/test/test.module';
import { BlogModule } from './modules/blog/blog.module';
import { BookModule } from './modules/book/book.module';
import { StoryModule } from './modules/story/story.module';
import { ShopModule } from './modules/shop/shop.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CourseModule } from './modules/course/course.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { AdminModule } from './modules/admin/admin.module';
import { SearchModule } from './modules/search/search.module';
import { MigrationModule } from './modules/migration/migration.module';
import { SmsSchedulerModule } from './modules/sms-scheduler/sms-scheduler.module';
import configuration from './config/configuration';

@Module({
    imports: [
        // Load environment variables globally
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            envFilePath: ['.env'],
        }),

        // Rate limiting — 100 requests per minute per IP by default
        ThrottlerModule.forRoot([
            {
                name: 'default',
                ttl: 60_000,
                limit: 100,
            },
        ]),

        // Task scheduling — Cron jobs (OTP cleanup, subscription expiry, appointment reminders)
        ScheduleModule.forRoot(),

        // Prisma database module (global)
        PrismaModule,

        // Authentication module
        AuthModule,

        // User module (profile, bookmarks, notifications, data export)
        UserModule,

        // Test module (psychological tests, scoring, attempts)
        TestModule,

        // Blog module (posts, categories, comments)
        BlogModule,

        // Book module (books, reading, progress)
        BookModule,

        // Story module (micro-stories carousel)
        StoryModule,

        // Shop module (products, cart, orders, payments, discount codes)
        ShopModule,

        // Subscription module (plans, subscribe, cancel)
        SubscriptionModule,

        // Appointment module (psychologists, bookings, reviews)
        AppointmentModule,

        // Chat module (real-time messaging with Socket.io, AES-256 encryption)
        ChatModule,

        // Notification module (real-time in-app notifications via Socket.io)
        NotificationModule,

        // Course module (video courses, enrollment, lesson progress)
        CourseModule,

        // Ticket module (support tickets, messages, ratings)
        TicketModule,

        // Admin module (dashboard, user management, reports, settings)
        AdminModule,

        // Search module (full-text search + autocomplete with Redis caching)
        SearchModule,

        // Migration module (legacy MySQL data migration utilities)
        MigrationModule,

        // SMS Scheduler module (daily SMS delivery for subscribed packages)
        SmsSchedulerModule,
    ],
    controllers: [AppController],
})
export class AppModule { }
