import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from './otp.service';
import { AppConfig } from '../../config/configuration';
import { User } from '@prisma/client';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'notificationPrefs'>;
}

export interface JwtPayload {
    sub: string;
    phone: string;
    role: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly otpService: OtpService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService<AppConfig, true>,
    ) { }

    async sendOtp(phone: string): Promise<void> {
        return this.otpService.sendOtp(phone);
    }

    async verifyOtp(phone: string, code: string): Promise<TokenPair> {
        const isValid = await this.otpService.verifyOtp(phone, code);
        if (!isValid) {
            throw new UnauthorizedException('کد تأیید نامعتبر یا منقضی شده است.');
        }

        const normalised = this.otpService.normalizePhone(phone);

        // Upsert user
        const user = await this.prisma.user.upsert({
            where: { phone: normalised },
            update: { isVerified: true },
            create: {
                phone: normalised,
                isVerified: true,
            },
        });

        return this.issueTokens(user);
    }

    async issueTokens(user: User): Promise<TokenPair> {
        const payload: JwtPayload = {
            sub: user.id,
            phone: user.phone,
            role: user.role,
        };

        const jwtSecret = this.config.get('jwt.secret', { infer: true });
        const refreshSecret = this.config.get('jwt.refreshSecret', { infer: true });

        const accessToken = this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: '7d',
        });

        // Hash and store refresh token
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.prisma.refreshToken.create({
            data: {
                token: hashedToken,
                userId: user.id,
                expiresAt,
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { notificationPrefs: _np, ...safeUser } = user;

        return { accessToken, refreshToken, user: safeUser };
    }

    async refreshTokens(userId: string, refreshToken: string): Promise<TokenPair> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('کاربر یافت نشد.');
        }

        const storedTokens = await this.prisma.refreshToken.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() },
            },
        });

        let matchedTokenId: string | null = null;
        for (const stored of storedTokens) {
            const match = await bcrypt.compare(refreshToken, stored.token);
            if (match) {
                matchedTokenId = stored.id;
                break;
            }
        }

        if (!matchedTokenId) {
            throw new UnauthorizedException('توکن معتبر نیست.');
        }

        // Delete the used refresh token (rotation)
        await this.prisma.refreshToken.delete({ where: { id: matchedTokenId } });

        return this.issueTokens(user);
    }

    async logout(userId: string, refreshToken: string): Promise<void> {
        const storedTokens = await this.prisma.refreshToken.findMany({
            where: { userId },
        });

        for (const stored of storedTokens) {
            const match = await bcrypt.compare(refreshToken, stored.token);
            if (match) {
                await this.prisma.refreshToken.delete({ where: { id: stored.id } });
                return;
            }
        }
    }

    async getMe(userId: string): Promise<Omit<User, 'notificationPrefs'>> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('کاربر یافت نشد.');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { notificationPrefs: _np, ...safeUser } = user;
        return safeUser;
    }
}
