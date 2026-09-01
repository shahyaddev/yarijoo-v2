import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestUser {
    role: string;
}

interface AuthenticatedRequest {
    user: RequestUser;
}

/**
 * RolesGuard — restricts access to routes decorated with @Roles().
 *
 * Must be used together with JwtAuthGuard so that request.user is populated.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('ADMIN', 'SUPER_ADMIN')
 *   @Get('admin-only')
 *   adminRoute() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no roles are required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

        if (!user || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                'You do not have permission to access this resource',
            );
        }

        return true;
    }
}
