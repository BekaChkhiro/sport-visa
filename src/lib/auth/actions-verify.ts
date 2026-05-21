'use server';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { sendVerifyEmailEmail } from '@/lib/resend';

import { auth } from './index';
import { createEmailVerificationToken } from './tokens';

export type ResendVerificationState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string };

export async function resendVerificationEmailAction(): Promise<ResendVerificationState> {
  const session = await auth();

  if (!session?.user?.email) {
    return { status: 'error', message: 'Not authenticated' };
  }

  if (session.user.emailVerified) {
    return { status: 'error', message: 'Email already verified' };
  }

  const email = session.user.email;
  const name = session.user.name ?? email;

  try {
    const token = await createEmailVerificationToken(email);
    const verifyUrl =
      `${env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email` +
      `?token=${token}&email=${encodeURIComponent(email)}`;

    await sendVerifyEmailEmail(email, {
      recipientName: name,
      verifyUrl,
      expiresInHours: 24,
      appUrl: env.NEXT_PUBLIC_APP_URL,
    });
  } catch (err) {
    logger.error({ err, email }, 'resend_verification_email_failed');
    return { status: 'error', message: 'Failed to send email. Please try again.' };
  }

  return { status: 'success' };
}
