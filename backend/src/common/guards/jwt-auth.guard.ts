import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — protects routes that require a valid JWT access token.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('protected')
 *   protectedRoute() { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
