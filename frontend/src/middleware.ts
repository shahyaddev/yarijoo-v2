import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_PATTERNS = ['/dashboard', '/admin']

// Auth pages — redirect to dashboard if already logged in
const AUTH_PAGES = ['/auth/login', '/auth/register']

function getTokenFromRequest(request: NextRequest): string | undefined {
    // Check cookie first (set by the backend as HttpOnly)
    const cookieToken = request.cookies.get('access_token')?.value

    // Fallback: check Authorization header (used by some SSR requests)
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    return cookieToken ?? bearerToken
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = getTokenFromRequest(request)

    // ─── Protect dashboard and admin routes ───────────────────────
    const isProtected = PROTECTED_PATTERNS.some((pattern) => pathname.startsWith(pattern))

    if (isProtected && !token) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // ─── Admin-only protection ────────────────────────────────────
    if (pathname.startsWith('/admin')) {
        // Role check is also enforced server-side in route handlers,
        // but we can do a lightweight check via a custom header/cookie if set.
        // For now we just ensure authentication is present.
        if (!token) {
            const loginUrl = new URL('/auth/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // ─── Redirect authenticated users away from auth pages ────────
    const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page))
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public folder files (fonts, images, etc.)
         * - api routes handled by Next.js
         */
        '/((?!_next/static|_next/image|favicon.ico|fonts/|images/|icons/|api/).*)',
    ],
}
