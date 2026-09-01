import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { AppConfig } from '../../../config/configuration';
import { JwtPayload } from '../auth.service';

export interface JwtRefreshUser {
    sub: string;
    phone: string;
    role: string;
    refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(config: ConfigService<AppConfig, true>) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: FastifyRequest) => {
                    // Try cookie first (Fastify stores cookies on req.cookies)
                    const cookies = (req as FastifyRequest & { cookies?: Record<string, string> }).cookies;
                    if (cookies?.refresh_token) {
                        return cookies.refresh_token;
                    }
                    // Fallback to bearer token
                    return ExtractJwt.fromAuthHeaderAsBearerToken()(req as never);
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: config.get('jwt.refreshSecret', { infer: true }),
            passReqToCallback: true,
        });
    }

    validate(req: FastifyRequest, payload: JwtPayload): JwtRefreshUser {
        const cookies = (req as FastifyRequest & { cookies?: Record<string, string> }).cookies;
        const refreshToken =
            cookies?.refresh_token ??
            (req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.slice(7)
                : '');

        return {
            sub: payload.sub,
            phone: payload.phone,
            role: payload.role,
            refreshToken,
        };
    }
}
