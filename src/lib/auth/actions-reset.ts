'use server';

import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { sendPasswordResetEmail } from '@/lib/resend';

import { getCallerIp } from './ip';
import { hashPassword } from './password';
import { recordPasswordResetAttempt } from './rate-limit';
import { forgotPasswordSchema, resetPasswordSchema } from './schemas';
import { consumePasswordResetToken, createPasswordResetToken } from './tokens';

export type RequestPasswordResetState =
  | { status: 'success' }
  | { status: 'error'; message: string };

export async function requestPasswordResetAction(
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { status: 'error', message: 'შეიყვანე სწორი ელ. ფოსტა' };
  }

  const { email } = parsed.data;

  const ip = await getCallerIp();
  const { allowed } = recordPasswordResetAttempt(ip, email);
  if (!allowed) {
    // Return success-shaped response to avoid leaking whether the address is known.
    return { status: 'success' };
  }

  // Fetch user silently — we return the same response whether the address
  // exists or not so callers cannot enumerate registered accounts.
  let recipientName = email;
  let shouldSend = false;
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (user?.passwordHash) {
      // Only email-/password accounts can reset via this flow.
      recipientName = [user.firstName, user.lastName].filter(Boolean).join(' ') || email;
      shouldSend = true;
    }
  } catch (err) {
    logger.error({ err, email }, 'password_reset_user_lookup_failed');
    // Return success anyway — the error is server-side, not user-facing.
    return { status: 'success' };
  }

  if (shouldSend) {
    try {
      const token = await createPasswordResetToken(email);
      const resetUrl =
        `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password` +
        `?token=${token}&email=${encodeURIComponent(email)}`;

      await sendPasswordResetEmail(email, {
        recipientName,
        resetUrl,
        expiresInHours: 24,
        appUrl: env.NEXT_PUBLIC_APP_URL,
      });

      logger.info({ email }, 'password_reset_email_sent');
    } catch (err) {
      logger.error({ err, email }, 'password_reset_email_failed');
      // Silently swallow — generic response hides server errors from scrapers.
    }
  } else {
    logger.info({ email }, 'password_reset_no_account');
  }

  return { status: 'success' };
}

export type ResetPasswordState = { status: 'success' } | { status: 'error'; message: string };

export async function resetPasswordAction(formData: FormData): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'შეცდომა';
    return { status: 'error', message: firstError };
  }

  const { token, email, password } = parsed.data;

  const valid = await consumePasswordResetToken(token, email);
  if (!valid) {
    return {
      status: 'error',
      message: 'ლინკი ვადაგასულია ან არასწორია. სცადე ახლიდან.',
    };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    // Token was valid but account is gone or is OAuth-only.
    logger.warn({ email }, 'password_reset_user_not_found_after_token');
    return {
      status: 'error',
      message: 'ანგარიში ვერ მოიძებნა. სცადე ახლიდან.',
    };
  }

  try {
    const passwordHash = await hashPassword(password);
    await db.user.update({ where: { email }, data: { passwordHash } });
    logger.info({ email }, 'password_reset_complete');
  } catch (err) {
    logger.error({ err, email }, 'password_reset_update_failed');
    return { status: 'error', message: 'სერვერის შეცდომა. სცადე თავიდან.' };
  }

  return { status: 'success' };
}
