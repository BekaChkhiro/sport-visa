import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

import { ApiError, apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { sendServiceRequestEmail } from '@/lib/resend';

export const runtime = 'nodejs';

export const GET = apiHandler(async () => {
  const user = await requireAuthenticatedUser();

  if (user.role !== 'FOOTBALLER') {
    throw new ApiError('FORBIDDEN', 'Only footballers can view service requests');
  }

  const requests = await db.serviceRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      requestCode: true,
      status: true,
      createdAt: true,
      startDate: true,
      endDate: true,
      notes: true,
      adminNote: true,
      contactPref: true,
      category: {
        select: { id: true, name: true, slug: true, icon: true },
      },
    },
  });

  return NextResponse.json({ requests });
});

const createSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD')
    .optional(),
  notes: z.string().max(500).optional(),
  contactPref: z.enum(['EMAIL', 'PHONE', 'CHAT']).default('EMAIL'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const POST = apiHandler(async (request: Request) => {
  const user = await requireAuthenticatedUser();

  if (user.role !== 'FOOTBALLER') {
    throw new ApiError('FORBIDDEN', 'Only footballers can submit service requests');
  }

  const body = (await request.json()) as unknown;
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('VALIDATION', 'Invalid request body', {
      details: parsed.error.flatten(),
    });
  }

  const { categoryId, startDate, endDate, notes, contactPref, metadata } = parsed.data;

  const category = await db.serviceCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true, isActive: true },
  });

  if (!category?.isActive) {
    throw new ApiError('NOT_FOUND', 'Service category not found');
  }

  const year = new Date().getFullYear();
  const yearPrefix = `SR-${year}-`;

  const serviceRequest = await db.$transaction(
    async (tx) => {
      const count = await tx.serviceRequest.count({
        where: { requestCode: { startsWith: yearPrefix } },
      });
      const requestCode = `${yearPrefix}${String(count + 1).padStart(4, '0')}`;

      return tx.serviceRequest.create({
        data: {
          requestCode,
          userId: user.id,
          categoryId,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          notes: notes ?? null,
          contactPref,
          ...(metadata !== undefined ? { metadata: metadata as Prisma.InputJsonValue } : {}),
          status: 'PENDING',
        },
        select: { id: true, requestCode: true, status: true },
      });
    },
    { isolationLevel: 'Serializable' },
  );

  logger.info(
    { requestCode: serviceRequest.requestCode, userId: user.id, categoryId },
    'service_request_created',
  );

  void sendNotifications(user.id, user.email, category.name, serviceRequest.requestCode);

  return NextResponse.json(
    {
      id: serviceRequest.id,
      requestCode: serviceRequest.requestCode,
      status: serviceRequest.status,
      categoryName: category.name,
    },
    { status: 201 },
  );
});

async function sendNotifications(
  userId: string,
  userEmail: string | null,
  categoryName: string,
  requestCode: string,
) {
  if (!userEmail) return;

  try {
    const profile = await db.footballerProfile.findUnique({
      where: { userId },
      select: { firstName: true, lastName: true },
    });
    const footballerName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : userEmail;

    const emailPayload = {
      footballerName,
      serviceType: categoryName,
      requestId: requestCode,
      action: 'submitted' as const,
      appUrl: env.NEXT_PUBLIC_APP_URL,
    };

    await sendServiceRequestEmail(userEmail, emailPayload);

    const admins = await db.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });

    await Promise.allSettled(
      admins
        .filter((a) => Boolean(a.email))
        .map((a) => sendServiceRequestEmail(a.email!, emailPayload)),
    );
  } catch (err) {
    logger.warn({ err, requestCode }, 'service_request_notification_failed');
  }
}
