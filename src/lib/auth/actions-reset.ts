'use server';

import { logger } from '@/lib/logger';

import { forgotPasswordSchema } from './schemas';

export type RequestPasswordResetState =
  | { status: 'success' }
  | { status: 'error'; message: string };

// T3.2 stops here — full reset (token issuance + Resend email + reset page)
// lands in T3.4. We accept the form and return the same generic response
// regardless of whether the address exists, so the flow appears working to
// the user and we never leak account existence to a scraper.
export async function requestPasswordResetAction(
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'შეიყვანე სწორი ელ. ფოსტა',
    };
  }

  // Intentional no-op for MVP. T3.4 will replace this with token creation +
  // email send. The log line gives us visibility while the feature is dark.
  logger.info({ email: parsed.data.email }, 'password_reset_requested_stub');

  return { status: 'success' };
}
