import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { NotificationGateway } from './notification.gateway'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification.controller'

@Module({
    imports: [
        // AuthModule exports JwtModule, which provides JwtService used by NotificationGateway
        AuthModule,
    ],
    providers: [NotificationGateway, NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule { }
