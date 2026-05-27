import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth/config';
import { roleDashboardPath } from '@/lib/auth/roles';

// Edge-safe auth derived from the stripped-down config (no Prisma / bcrypt).
// This decodes the JWT from the session cookie without a DB round-trip.
const { auth } = NextAuth(authConfig);

const REQUEST_ID_HEADER = 'x-request-id';

// Routes that require an authenticated, email-verified session.
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/onboarding', '/profile', '/chat', '/clubs'];

// Auth-only routes — authenticated + verified users are redirected away.
const AUTH_PREFIXES = ['/auth/'];

export default auth((request) => {
  const incomingId = request.headers.get(REQUEST_ID_HEADER);
  const requestId = incomingId && incomingId.length > 0 ? incomingId : crypto.randomUUID();

  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set(REQUEST_ID_HEADER, requestId);

  const session = request.auth;
  const { pathname } = request.nextUrl;
  const user = session?.user;

  const isApiRoute = pathname.startsWith('/api/');
  const isVerificationPending = pathname.startsWith('/verification-pending');

  // 1. Unverified email guard — redirect everywhere except landing, api, and
  //    the pending page itself so the verification flow can complete.
  if (user && !user.emailVerified && pathname !== '/' && !isApiRoute && !isVerificationPending) {
    // Allow auth routes so users can sign out or see the auth pages while
    // their email is pending — only block app routes.
    if (!AUTH_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/verification-pending', request.url));
    }
  }

  // 2. Unauthenticated users trying to reach protected routes → sign in.
  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // All remaining checks require a verified session.
  if (!user?.emailVerified) {
    return NextResponse.next({ request: { headers: forwardedHeaders } });
  }

  const role = user.role as string;
  const dashboard = roleDashboardPath(role);

  // 3. Verified users on the landing page or auth pages → their dashboard.
  if (pathname === '/' || AUTH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // 4. /dashboard base → role-specific dashboard.
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // 5. Role guards — wrong dashboard sends you to the right one.
  if (pathname.startsWith('/dashboard/footballer') && role !== 'FOOTBALLER') {
    return NextResponse.redirect(new URL(dashboard, request.url));
  }
  if (pathname.startsWith('/dashboard/club') && role !== 'CLUB') {
    return NextResponse.redirect(new URL(dashboard, request.url));
  }
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  const response = NextResponse.next({
    request: { headers: forwardedHeaders },
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets; everything else passes through.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)',
  ],
};
