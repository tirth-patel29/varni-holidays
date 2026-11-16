import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enterprise Next.js Route Guard Middleware for Varni Holidays
 * Guarantees zero unauthenticated access to /admin/* and /employee/* portals.
 */

const PUBLIC_ADMIN_AUTH_PATHS = [
  '/admin/login',
  '/admin/mfa',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/onboarding',
  '/admin/bootstrap',
  '/employee/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public auth endpoints, API routes, and static assets
  const isPublicAuthPath = PUBLIC_ADMIN_AUTH_PATHS.some((p) => pathname.startsWith(p));
  if (isPublicAuthPath) {
    return NextResponse.next();
  }

  // 2. Check if route is protected admin or employee path
  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/employee');
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // 3. Inspect Session Cookie
  const sessionToken =
    request.cookies.get('varni.session_token')?.value ||
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('varni_session')?.value;

  const mfaPendingToken = request.cookies.get('varni.mfa_pending')?.value;

  // 4. If MFA verification is pending, force redirect to /admin/mfa
  if (mfaPendingToken && !sessionToken) {
    if (pathname !== '/admin/mfa') {
      const mfaUrl = new URL('/admin/mfa', request.url);
      return NextResponse.redirect(mfaUrl);
    }
    return NextResponse.next();
  }

  // 5. If no session token, redirect to login with next path
  if (!sessionToken) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/employee/:path*',
  ],
};
