/**
 * Typed configuration factory.
 *
 * Reads all environment variables defined in .env.example and exposes them
 * through NestJS ConfigService with full TypeScript typing.
 *
 * Usage:
 *   constructor(private config: ConfigService<AppConfig, true>) {}
 *   const secret = this.config.get('jwt.secret', { infer: true });
 */

export interface AppConfig {
    env: string;
    frontendUrl: string;
    backendUrl: string;
    port: number;

    database: {
        url: string;
    };

    redis: {
        url: string;
        password: string;
    };

    minio: {
        endpoint: string;
        accessKey: string;
        secretKey: string;
        bucket: string;
    };

    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };

    kavenegar: {
        apiKey: string;
    };

    zarinpal: {
        merchantId: string;
    };

    openai: {
        apiKey: string;
    };
}

export default (): AppConfig => ({
    env: process.env.NODE_ENV ?? 'development',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    backendUrl: process.env.BACKEND_URL ?? 'http://localhost:3000',
    port: parseInt(process.env.PORT ?? '3000', 10),

    database: {
        url:
            process.env.DATABASE_URL ??
            'postgresql://yarijoo:CHANGE_ME@localhost:5432/yarijoo',
    },

    redis: {
        url: process.env.REDIS_URL ?? 'redis://:CHANGE_ME@localhost:6379',
        password: process.env.REDIS_PASSWORD ?? '',
    },

    minio: {
        endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
        accessKey: process.env.MINIO_ACCESS_KEY ?? '',
        secretKey: process.env.MINIO_SECRET_KEY ?? '',
        bucket: process.env.MINIO_BUCKET ?? 'yarijoo-files',
    },

    jwt: {
        secret: process.env.JWT_SECRET ?? 'CHANGE_ME_STRONG_RANDOM_SECRET_MIN_32_CHARS',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
        refreshSecret:
            process.env.REFRESH_SECRET ??
            'CHANGE_ME_ANOTHER_STRONG_RANDOM_SECRET_MIN_32_CHARS',
        refreshExpiresIn: process.env.REFRESH_EXPIRES_IN ?? '7d',
    },

    kavenegar: {
        apiKey: process.env.KAVENEGAR_API_KEY ?? '',
    },

    zarinpal: {
        merchantId: process.env.ZARINPAL_MERCHANT_ID ?? '',
    },

    openai: {
        apiKey: process.env.OPENAI_API_KEY ?? '',
    },
});
