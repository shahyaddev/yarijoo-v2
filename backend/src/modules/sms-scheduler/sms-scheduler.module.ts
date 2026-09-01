import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SmsSchedulerService } from './sms-scheduler.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [ScheduleModule.forRoot(), PrismaModule],
    providers: [SmsSchedulerService],
    exports: [SmsSchedulerService],
})
export class SmsSchedulerModule { }
