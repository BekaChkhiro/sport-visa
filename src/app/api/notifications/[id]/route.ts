import { NextResponse } from 'next/server';

import { ApiError, apiHandler } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { markNotificationRead } from '@/lib/notifications';

export const runtime = 'nodejs';

// TODO(T3): Replace userId extraction with a real session lookup.

/** PATCH /api/notifications/[id] — mark a single notification as read. */
export const PATCH = apiHandler(async (request: Request, ...args: unknown[]) => {
  const context = args[0] as { params: Promise<{ id: string }> };
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const userId =
    typeof body === 'object' && body !== null && 'userId' in body
      ? String((body as Record<string, unknown>).userId)
      : '';

  if (!userId) {
    throw new ApiError('BAD_REQUEST', 'userId is required');
  }

  const updated = await markNotificationRead(id, userId);

  if (!updated) {
    throw new ApiError('NOT_FOUND', 'Notification not found');
  }

  logger.debug({ id, userId }, 'notification_marked_read');

  return NextResponse.json({ id, read: true }, { status: 200 });
});
