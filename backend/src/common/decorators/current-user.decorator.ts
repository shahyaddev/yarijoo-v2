import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
    user: Record<string, unknown>;
}

/**
 * @CurrentUser decorator — injects the authenticated user object (or a specific
 * field from it) into a route handler parameter.
 *
 * Usage:
 *   // Inject the full user object
 *   @Get('me')
 *   getMe(@CurrentUser() user: User) { return user; }
 *
 *   // Inject a specific field
 *   @Get('me')
 *   getMe(@CurrentUser('id') userId: string) { return userId; }
 */
export const CurrentUser = createParamDecorator(
    (field: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        return field !== undefined ? user[field] : user;
    },
);
