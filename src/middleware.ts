import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth/config';

// Edge-safe auth derived from the stripped-down config (no Prisma / bcrypt).
// This decodes the JWT from the session cookie without a DB round-trip.
const { auth } = NextAuth(authConfig);

const REQUEST_ID_HEADER = 'x-request-id';

export default auth((request) => {
  const incomingId = request.headers.get(REQUEST_ID_HEADER);
  const requestId = incomingId && incomingId.length > 0 ? incomingId : crypto.randomUUID();

  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set(REQUEST_ID_HEADER, requestId);

  // Redirect authenticated users whose email is not yet verified to the
  // verification-pending page. Exempt: the pending page itself, all /api/*
  // routes (so the verify-email route handler can process the token), and the
  // root landing page.
  const session = request.auth;
  const { pathname } = request.nextUrl;

  if (
    session?.user &&
    !session.user.emailVerified &&
    pathname !== '/' &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/verification-pending')
  ) {
    return NextResponse.redirect(new URL('/verification-pending', request.url));
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
