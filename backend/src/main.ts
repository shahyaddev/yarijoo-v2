import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: process.env.NODE_ENV !== 'production' }),
    );

    // Register Fastify plugins
    await app.register(fastifyHelmet, {
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
    });

    await app.register(fastifyCors, {
        origin: [
            process.env.FRONTEND_URL ?? 'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3000',
            'http://localhost:3003',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    await app.register(fastifyCookie);

    // Register multipart support for file uploads (chat, admin media)
    await app.register(fastifyMultipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB
            files: 1,
        },
    });

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global response interceptor
    app.useGlobalInterceptors(new ResponseInterceptor());

    const port = parseInt(process.env.PORT ?? '3000', 10);
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Yarijoo API is running on: http://localhost:${port}/api/v1`);
}

bootstrap();
