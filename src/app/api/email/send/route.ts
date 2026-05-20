import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiError, apiHandler } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { sendApplicationStatusEmail, sendNotificationEmail, sendWelcomeEmail } from '@/lib/resend';
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

const sendEmailSchema = z.discriminatedUnion('type', [
  welcomeSchema,
  applicationStatusSchema,
  notificationSchema,
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
  } else {
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
  }

  return NextResponse.json({ id: result.id }, { status: 200 });
});
