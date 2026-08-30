import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || 'disciplr-default-jwt-secret-key-32-chars-long!'
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING)

const PROTECTED_ROUTES = [
  '/today',
  '/pod',
  '/habits',
  '/profile',
  '/settings',
  '/onboarding',
  '/dashboard',
]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  let isAuthenticated = false

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET)
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
  }

  const pathname = request.nextUrl.pathname

  // 1. Protected routes: redirect unauthenticated users to /login
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (!isAuthenticated && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    // Prevent browser bfcache of protected redirects
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    return response
  }

  // 2. Auth pages: redirect authenticated users to /today
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/today'
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()

  // For protected routes, disallow browser caching of authenticated content
  if (isProtectedRoute) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
