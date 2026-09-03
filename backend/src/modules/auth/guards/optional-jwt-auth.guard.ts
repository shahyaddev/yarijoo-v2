import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Same as JwtAuthGuard but never throws — if no/invalid token is present
 * req.user is simply left as undefined (null) so the handler can decide.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context)
    }

    // Override to suppress the 401 when no token is provided
    handleRequest<T>(_err: unknown, user: T): T {
        return user  // null/undefined → no error thrown
    }
}
