import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * @Roles decorator — specify which user roles are allowed to access a route.
 *
 * Usage:
 *   @Roles('ADMIN', 'SUPER_ADMIN')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('admin-route')
 *   adminRoute() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
