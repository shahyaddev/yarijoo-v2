import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        ConfigModule,
        // Register without a default secret — each sign call passes its own secret
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [AuthService, OtpService, JwtStrategy, JwtRefreshStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
