import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { MinioService } from './minio.service'

@Module({
    controllers: [UserController],
    providers: [UserService, MinioService],
    exports: [UserService, MinioService],
})
export class UserModule { }
