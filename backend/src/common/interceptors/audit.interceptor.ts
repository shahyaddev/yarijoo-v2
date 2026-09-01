import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';

interface AuthenticatedRequest extends FastifyRequest {
    user?: { sub: string; role: string };
}

/**
 * AuditInterceptor — records admin mutations to the audit_logs table.
 *
 * Logs POST/PUT/PATCH/DELETE requests on /admin/* routes.
 * Writes: adminId, action, entityType, entityId, ip, createdAt.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);

    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const { method, url, user, ip } = request;

        // Only audit mutating admin requests
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle();
        }
        if (!url.includes('/admin/')) {
            return next.handle();
        }
        if (!user?.sub) {
            return next.handle();
        }

        const adminId = user.sub;

        // Extract entity type and ID from URL path
        // e.g. /api/v1/admin/users/123 → entityType='users', entityId='123'
        const pathAfterAdmin = url
            .replace(/\?.*$/, '')       // strip query params
            .replace(/^.*\/admin\//, '') // strip prefix up to /admin/
        const parts = pathAfterAdmin.split('/')
        const entityType = parts[0] ?? 'unknown'
        const entityId = parts[1] ?? 'root'
        const action =
            method === 'POST' ? 'create' :
                method === 'PATCH' || method === 'PUT' ? 'update' :
                    'delete'

        return next.handle().pipe(
            tap(() => {
                this.prisma.auditLog
                    .create({
                        data: {
                            adminId,
                            action,
                            entityType,
                            entityId,
                            ip: ip ?? null,
                        },
                    })
                    .catch((err: unknown) => {
                        this.logger.warn(
                            `AuditLog write failed: ${err instanceof Error ? err.message : String(err)}`,
                        )
                    })
            }),
        );
    }
}
