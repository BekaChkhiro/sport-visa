import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiError, apiHandler } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import {
  sendAccountVerificationEmail,
  sendApplicationStatusEmail,
  sendNotificationEmail,
  sendPasswordResetEmail,
  sendServiceRequestEmail,
  sendWelcomeEmail,
} from '@/lib/resend';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

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

const notificationSchema = z.object({
  type: z.literal('notification'),
  to: z.string().email(),
  recipientName: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  bodyHtml: z.string().min(1).max(50000),
  bodyText: z.string().min(1).max(50000),
  ctaLabel: z.string().max(100).optional(),
  ctaUrl: z.string().url().optional(),
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
  notificationSchema,
  passwordResetSchema,
  accountVerificationSchema,
  serviceRequestSchema,
]);

export const POST = apiHandler(async (request: Request) => {
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
    logger.info({ to: payload.to, emailId: result.id }, 'email_welcome_sent');
  } else if (payload.type === 'application_status') {
    result = await sendApplicationStatusEmail(payload.to, {
      playerName: payload.playerName,
      clubName: payload.clubName,
      status: payload.status,
      message: payload.message,
      appUrl,
    });
    logger.info(
      { to: payload.to, status: payload.status, emailId: result.id },
      'email_application_status_sent',
    );
  } else if (payload.type === 'notification') {
    result = await sendNotificationEmail(payload.to, {
      recipientName: payload.recipientName,
      subject: payload.subject,
      bodyHtml: payload.bodyHtml,
      bodyText: payload.bodyText,
      ctaLabel: payload.ctaLabel,
      ctaUrl: payload.ctaUrl,
      appUrl,
    });
    logger.info(
      { to: payload.to, subject: payload.subject, emailId: result.id },
      'email_notification_sent',
    );
  } else if (payload.type === 'password_reset') {
    result = await sendPasswordResetEmail(payload.to, {
      recipientName: payload.recipientName,
      resetUrl: payload.resetUrl,
      expiresInHours: payload.expiresInHours,
      appUrl,
    });
    logger.info({ to: payload.to, emailId: result.id }, 'email_password_reset_sent');
  } else if (payload.type === 'account_verification') {
    result = await sendAccountVerificationEmail(payload.to, {
      recipientName: payload.recipientName,
      status: payload.status,
      rejectionReason: payload.rejectionReason,
      appUrl,
    });
    logger.info(
      { to: payload.to, status: payload.status, emailId: result.id },
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
      { to: payload.to, action: payload.action, emailId: result.id },
      'email_service_request_sent',
    );
  }

  return NextResponse.json({ id: result.id }, { status: 200 });
});
