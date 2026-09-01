import { Module } from '@nestjs/common'
import { CourseController } from './course.controller'
import { CourseService } from './course.service'
import { CertificateService } from './certificate.service'
import { UserModule } from '../user/user.module'
import { NotificationModule } from '../notification/notification.module'

@Module({
    imports: [
        // UserModule exports MinioService needed for presigned video URLs
        UserModule,
        // NotificationModule exports NotificationService for course-completion notifications
        NotificationModule,
    ],
    controllers: [CourseController],
    providers: [CourseService, CertificateService],
    exports: [CourseService],
})
export class CourseModule { }
