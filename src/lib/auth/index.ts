import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

import { authConfig } from './config';
import { verifyPassword } from './password';
import { clearLoginAttempts, recordLoginAttempt } from './rate-limit';
import { signinSchema } from './schemas';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw, request) {
        const parsed = signinSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }
        const { email, password } = parsed.data;

        // x-forwarded-for is set by Railway/Vercel; fall back to a stable
        // placeholder so the rate limiter doesn't collapse all dev requests
        // into one bucket.
        const ip =
          request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          request?.headers?.get('x-real-ip') ||
          'unknown';

        const { allowed } = recordLoginAttempt(ip, email);
        if (!allowed) {
          logger.warn({ ip, email }, 'auth_rate_limited');
          // Returning null produces the same "Invalid credentials" UI as a
          // wrong password — we don't want to leak that the account exists.
          return null;
        }

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            passwordHash: true,
            role: true,
            status: true,
            emailVerified: true,
          },
        });

        if (!user || !user.passwordHash) {
          // Spend a hash cycle anyway to keep the timing channel closed.
          await verifyPassword(
            password,
            '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali',
          );
          return null;
        }

        if (user.status === 'BLOCKED') {
          return null;
        }

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) {
          return null;
        }

        clearLoginAttempts(email);

        return {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
});
