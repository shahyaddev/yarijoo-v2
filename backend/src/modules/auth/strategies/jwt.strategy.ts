import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';
import { JwtPayload } from '../auth.service';

export interface JwtUser {
    sub: string;
    phone: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService<AppConfig, true>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('jwt.secret', { infer: true }),
        });
    }

    validate(payload: JwtPayload): JwtUser {
        return {
            sub: payload.sub,
            phone: payload.phone,
            role: payload.role,
        };
    }
}
