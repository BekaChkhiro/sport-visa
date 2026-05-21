import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiError, apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import {
  sendAccountVerificationEmail,
  sendApplicationStatusEmail,
  sendPasswordResetEmail,
  sendServiceRequestEmail,
  sendWelcomeEmail,
} from '@/lib/resend';

export const runtime = 'nodejs';

const INTERNAL_KEY_HEADER = 'x-internal-key';

// Allowlisted, templated payloads only. The previous `notification` shape
// (caller-supplied subject + bodyHtml + bodyText) accepted arbitrary HTML and
// would have let any caller with access to this route fire phishing-grade
// emails from our domain. Removed deliberately — internal callers that need
// custom email content should use the lib helpers directly (server-only) or
// add a new templated type with a server-side schema.

const welcomeSchema = z.object({
  type: z.literal('welcome'),
  to: z.string().email(),
  name: z.string().min(1).max(200),
});

const applicationStatusSchema = z.object({
  type: z.literal('application_status'),
  to: z.string().email(),
  playerName: z.string().min(1).max(200),
  clubName: z.string().min(1).max(200),
  status: z.enum(['accepted', 'rejected', 'shortlisted']),
  message: z.string().max(2000).optional(),
});

const passwordResetSchema = z.object({
  type: z.literal('password_reset'),
  to: z.string().email(),
  recipientName: z.string().min(1).max(200),
  resetUrl: z.string().url(),
  expiresInHours: z.number().int().min(1).max(72),
});

const accountVerificationSchema = z.object({
  type: z.literal('account_verification'),
  to: z.string().email(),
  recipientName: z.string().min(1).max(200),
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().max(2000).optional(),
});

const serviceRequestSchema = z.object({
  type: z.literal('service_request'),
  to: z.string().email(),
  footballerName: z.string().min(1).max(200),
  serviceType: z.string().min(1).max(200),
  requestId: z.string().min(1).max(100),
  action: z.enum(['submitted', 'resolved']),
});

const sendEmailSchema = z.discriminatedUnion('type', [
  welcomeSchema,
  applicationStatusSchema,
  passwordResetSchema,
  accountVerificationSchema,
  serviceRequestSchema,
]);

/**
 * Authorize the caller as either:
 *   1. A trusted internal worker presenting `x-internal-key` matching
 *      env.EMAIL_INTERNAL_KEY (when configured), or
 *   2. An authenticated admin session.
 *
 * Throws ApiError on failure — the apiHandler maps it to a JSON envelope.
 */
async function authorizeEmailSender(request: Request): Promise<{ caller: string }> {
  const presentedKey = request.headers.get(INTERNAL_KEY_HEADER);
  const internalKey = env.EMAIL_INTERNAL_KEY;
  if (presentedKey && internalKey && presentedKey === internalKey) {
    return { caller: 'internal' };
  }

  const user = await requireAuthenticatedUser();
  if (user.role !== 'ADMIN') {
    throw new ApiError('FORBIDDEN', 'Admin role required to send email');
  }
  return { caller: `admin:${user.id}` };
}

export const POST = apiHandler(async (request: Request) => {
  const { caller } = await authorizeEmailSender(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError('BAD_REQUEST', 'Request body must be valid JSON');
  }

  const parsed = sendEmailSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('VALIDATION', 'Invalid email send request', {
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const payload = parsed.data;

  let result: { id: string };

  if (payload.type === 'welcome') {
    result = await sendWelcomeEmail(payload.to, { name: payload.name, appUrl });
    logger.info({ caller, to: payload.to, emailId: result.id }, 'email_welcome_sent');
  } else if (payload.type === 'application_status') {
    result = await sendApplicationStatusEmail(payload.to, {
      playerName: payload.playerName,
      clubName: payload.clubName,
      status: payload.status,
      message: payload.message,
      appUrl,
    });
    logger.info(
      { caller, to: payload.to, status: payload.status, emailId: result.id },
      'email_application_status_sent',
    );
  } else if (payload.type === 'password_reset') {
    result = await sendPasswordResetEmail(payload.to, {
      recipientName: payload.recipientName,
      resetUrl: payload.resetUrl,
      expiresInHours: payload.expiresInHours,
      appUrl,
    });
    logger.info({ caller, to: payload.to, emailId: result.id }, 'email_password_reset_sent');
  } else if (payload.type === 'account_verification') {
    result = await sendAccountVerificationEmail(payload.to, {
      recipientName: payload.recipientName,
      status: payload.status,
      rejectionReason: payload.rejectionReason,
      appUrl,
    });
    logger.info(
      { caller, to: payload.to, status: payload.status, emailId: result.id },
      'email_account_verification_sent',
    );
  } else {
    result = await sendServiceRequestEmail(payload.to, {
      footballerName: payload.footballerName,
      serviceType: payload.serviceType,
      requestId: payload.requestId,
      action: payload.action,
      appUrl,
    });
    logger.info(
      { caller, to: payload.to, action: payload.action, emailId: result.id },
      'email_service_request_sent',
    );
  }

  return NextResponse.json({ id: result.id }, { status: 200 });
});
