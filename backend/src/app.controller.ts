import { Controller, Get, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import * as https from 'https';
import * as http from 'http';

interface HealthResponse {
    status: string;
    timestamp: string;
}

@Controller()
export class AppController {
    @Get('health')
    health(): HealthResponse {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    /**
     * Image proxy: GET /api/v1/img-proxy/Uploads/blog/xxx.jpg
     * Fetches the image from api.yarijoo.ir and streams it back.
     * This avoids CORS and lets Next.js serve images without a live API key.
     */
    @Get('img-proxy/*')
    proxyImage(@Param('*') path: string, @Res() reply: FastifyReply): void {
        const remoteUrl = `https://api.yarijoo.ir/${path}`;
        const proto = remoteUrl.startsWith('https') ? https : http;

        proto.get(remoteUrl, (remoteRes) => {
            const contentType = remoteRes.headers['content-type'] ?? 'image/jpeg';
            reply.header('Content-Type', contentType);
            reply.header('Cache-Control', 'public, max-age=86400');
            reply.send(remoteRes);
        }).on('error', () => {
            reply.status(404).send({ error: 'image not found' });
        });
    }
}
