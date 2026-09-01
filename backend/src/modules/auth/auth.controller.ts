import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtUser } from './strategies/jwt.strategy';
import { JwtRefreshUser } from './strategies/jwt-refresh.strategy';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /api/v1/auth/send-otp
     * Send a 6-digit OTP to the phone number.
     */
    @Post('send-otp')
    @HttpCode(HttpStatus.OK)
    async sendOtp(@Body() dto: SendOtpDto): Promise<{ message: string }> {
        await this.authService.sendOtp(dto.phone);
        return { message: 'کد تأیید ارسال شد' };
    }

    /**
     * POST /api/v1/auth/verify-otp
     * Verify OTP, create/find user, issue tokens.
     */
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(
        @Body() dto: VerifyOtpDto,
        @Res({ passthrough: true }) reply: FastifyReply,
    ): Promise<{ accessToken: string; user: object }> {
        const { accessToken, refreshToken, user } = await this.authService.verifyOtp(
            dto.phone,
            dto.code,
        );

        void reply.setCookie(REFRESH_COOKIE, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: REFRESH_COOKIE_PATH,
            maxAge: REFRESH_MAX_AGE,
        });

        return { accessToken, user };
    }

    /**
     * POST /api/v1/auth/refresh
     * Use the refresh token cookie to issue new token pair.
     */
    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @CurrentUser() user: JwtRefreshUser,
        @Res({ passthrough: true }) reply: FastifyReply,
    ): Promise<{ accessToken: string; user: object }> {
        const result = await this.authService.refreshTokens(user.sub, user.refreshToken);

        void reply.setCookie(REFRESH_COOKIE, result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: REFRESH_COOKIE_PATH,
            maxAge: REFRESH_MAX_AGE,
        });

        return { accessToken: result.accessToken, user: result.user };
    }

    /**
     * POST /api/v1/auth/logout
     * Invalidate the current refresh token and clear the cookie.
     */
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @CurrentUser() user: JwtUser,
        @Res({ passthrough: true }) reply: FastifyReply,
    ): Promise<{ message: string }> {
        // We don't have the refresh token here since JwtAuthGuard validates the access token,
        // so we look it up from the cookie via the raw request
        const req = reply.request as unknown as { cookies?: Record<string, string> };
        const refreshToken = req.cookies?.[REFRESH_COOKIE] ?? '';

        await this.authService.logout(user.sub, refreshToken);

        void reply.clearCookie(REFRESH_COOKIE, {
            path: REFRESH_COOKIE_PATH,
        });

        return { message: 'خروج موفق' };
    }

    /**
     * GET /api/v1/auth/me
     * Return the authenticated user's profile.
     */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@CurrentUser() user: JwtUser): Promise<object> {
        return this.authService.getMe(user.sub);
    }
}
