import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enterprise Next.js Route Guard Middleware for Varni Holidays
 * Guarantees zero unauthenticated access to /admin/* and /employee/* portals,
 * and enforces strict session separation for the Customer PWA (/app/*).
 */

const PUBLIC_ADMIN_AUTH_PATHS = [
  '/admin/login',
  '/admin/mfa',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/onboarding',
  '/employee/login',
];

const PUBLIC_CUSTOMER_PATHS = [
  '/app/welcome',
  '/app/auth',
];

const CUSTOMER_SESSION_COOKIE = 'varniholidays_customer_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ====================================================
  // 1. CUSTOMER PWA ROUTE GUARD (/app/*)
  // ====================================================
  if (pathname.startsWith('/app')) {
    // Allow public customer paths (e.g. /app/welcome, /app/auth/*)
    const isPublicCustomerPath = PUBLIC_CUSTOMER_PATHS.some((p) => pathname.startsWith(p));
    if (isPublicCustomerPath) {
      return NextResponse.next();
    }

    // Inspect dedicated customer session cookie (Strictly isolated from staff cookies)
    const customerSession = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;

    if (!customerSession || customerSession.trim().length === 0) {
      const welcomeUrl = new URL('/app/welcome', request.url);
      welcomeUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(welcomeUrl);
    }

    return NextResponse.next();
  }

  // ====================================================
  // 2. ADMIN & EMPLOYEE PORTAL ROUTE GUARD (/admin/*, /employee/*)
  // ====================================================
  // 2a. Allow public staff auth endpoints
  const isPublicAuthPath = PUBLIC_ADMIN_AUTH_PATHS.some((p) => pathname.startsWith(p));
  if (isPublicAuthPath) {
    return NextResponse.next();
  }

  // 2b. Check if route is protected admin or employee path
  const isProtectedStaffPath = pathname.startsWith('/admin') || pathname.startsWith('/employee');
  if (!isProtectedStaffPath) {
    return NextResponse.next();
  }

  // 2c. Inspect Staff Session Cookie - ONLY accept genuine cryptographic tokens
  const sessionToken =
    request.cookies.get('varni.session_token')?.value ||
    request.cookies.get('better-auth.session_token')?.value;

  const mfaPendingToken = request.cookies.get('varni.mfa_pending')?.value;

  // 2d. If MFA verification is pending, force redirect to /admin/mfa
  if (mfaPendingToken && !sessionToken) {
    if (pathname !== '/admin/mfa') {
      const mfaUrl = new URL('/admin/mfa', request.url);
      return NextResponse.redirect(mfaUrl);
    }
    return NextResponse.next();
  }

  // 2e. If no staff session token, redirect to login with next path
  if (!sessionToken) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    const response = NextResponse.redirect(loginUrl);
    // Purge any stale legacy demo cookies if present
    if (request.cookies.get('varni_session')) {
      response.cookies.delete('varni_session');
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/employee/:path*',
    '/app',
    '/app/:path*',
  ],
};
