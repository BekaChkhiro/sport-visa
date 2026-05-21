import { NextResponse, type NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { consumeEmailVerificationToken } from '@/lib/auth/tokens';

export const runtime = 'nodejs';

// Auth.js session-token cookie names. In production Next.js sets the
// __Secure- prefix; in development it uses the bare name. We clear both so
// the handler works in any environment.
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const base = env.NEXT_PUBLIC_APP_URL;

  if (!token || !email) {
    return NextResponse.redirect(new URL('/auth/signin?error=invalid-link', base));
  }

  let valid: boolean;
  try {
    valid = await consumeEmailVerificationToken(token, email);
  } catch (err) {
    logger.error({ err, email }, 'verify_email_token_check_failed');
    return NextResponse.redirect(new URL('/auth/signin?error=server-error', base));
  }

  if (!valid) {
    return NextResponse.redirect(new URL('/auth/signin?error=link-expired', base));
  }

  try {
    await db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
  } catch (err) {
    logger.error({ err, email }, 'verify_email_update_failed');
    return NextResponse.redirect(new URL('/auth/signin?error=server-error', base));
  }

  logger.info({ email }, 'email_verified');

  // Clear the session JWT so the next sign-in issues a fresh token that
  // carries emailVerified. Without this the browser's existing JWT still has
  // emailVerified=null and the middleware would keep redirecting to /verification-pending.
  const response = NextResponse.redirect(new URL('/auth/signin?verified=1', base));
  for (const name of SESSION_COOKIES) {
    response.cookies.delete(name);
  }
  return response;
}
