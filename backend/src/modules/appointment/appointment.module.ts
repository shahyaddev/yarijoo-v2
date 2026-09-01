import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { AppointmentReminderService } from './appointment-reminder.service';
import { PaymentService } from '../shop/payment.service';

@Module({
    controllers: [AppointmentController],
    providers: [AppointmentService, AppointmentReminderService, PaymentService],
    exports: [AppointmentService],
})
export class AppointmentModule { }
