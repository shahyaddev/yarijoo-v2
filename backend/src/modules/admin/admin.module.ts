import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { UserModule } from '../user/user.module'
import { TicketModule } from '../ticket/ticket.module'
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
    imports: [UserModule, TicketModule, PrismaModule],
    controllers: [AdminController],
    providers: [AdminService, AuditInterceptor],
    exports: [AdminService],
})
export class AdminModule { }
