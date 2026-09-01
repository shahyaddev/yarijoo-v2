import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

interface ErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
    timestamp: string;
    path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const reply = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        const statusCode =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message: string | string[];
        let error: string;

        if (exception instanceof HttpException) {
            const response = exception.getResponse();

            if (typeof response === 'string') {
                message = response;
                error = exception.message;
            } else if (typeof response === 'object' && response !== null) {
                const resp = response as Record<string, unknown>;
                message = (resp['message'] as string | string[]) ?? exception.message;
                error = (resp['error'] as string) ?? HttpStatus[statusCode];
            } else {
                message = exception.message;
                error = HttpStatus[statusCode] ?? 'Error';
            }
        } else if (exception instanceof Error) {
            message =
                process.env.NODE_ENV === 'production'
                    ? 'Internal server error'
                    : exception.message;
            error = 'Internal Server Error';
        } else {
            message = 'Internal server error';
            error = 'Internal Server Error';
        }

        const body: ErrorResponse = {
            statusCode,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        void reply.status(statusCode).send(body);
    }
}
