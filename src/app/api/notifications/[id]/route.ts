import { NextResponse } from 'next/server';

import { ApiError, apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { logger } from '@/lib/logger';
import { markNotificationRead } from '@/lib/notifications';

export const runtime = 'nodejs';

/**
 * PATCH /api/notifications/[id] — mark a single notification as read.
 *
 * `userId` is taken from the session, never from the request body. The
 * underlying update query scopes by `userId`, so any attempt to mark another
 * user's notification simply returns 404 (no leakage of existence).
 */
export const PATCH = apiHandler(async (_request: Request, ...args: unknown[]) => {
  const user = await requireAuthenticatedUser();

  const context = args[0] as { params: Promise<{ id: string }> };
  const { id } = await context.params;

  const updated = await markNotificationRead(id, user.id);

  if (!updated) {
    throw new ApiError('NOT_FOUND', 'Notification not found');
  }

  logger.debug({ id, userId: user.id }, 'notification_marked_read');

  return NextResponse.json({ id, read: true }, { status: 200 });
});
