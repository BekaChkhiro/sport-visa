import { NextResponse } from 'next/server';

import { apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { logger } from '@/lib/logger';
import { listNotifications, markAllNotificationsRead } from '@/lib/notifications';

export const runtime = 'nodejs';

// `userId` is derived from the session, NOT from query/body. Any
// client-supplied userId is ignored — preventing a logged-in user from
// reading or mutating another user's notifications.

/** GET /api/notifications[?limit=<n>] — list the caller's notifications. */
export const GET = apiHandler(async (request: Request) => {
  const user = await requireAuthenticatedUser();

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 100) : 50;

  const notifications = await listNotifications(user.id, limit);
  logger.debug({ userId: user.id, count: notifications.length }, 'notifications_listed');

  return NextResponse.json(
    {
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
    },
    { status: 200 },
  );
});

/** PATCH /api/notifications — mark all of the caller's notifications read. */
export const PATCH = apiHandler(async () => {
  const user = await requireAuthenticatedUser();

  const updated = await markAllNotificationsRead(user.id);
  logger.info({ userId: user.id, updated }, 'notifications_all_marked_read');

  return NextResponse.json({ updated }, { status: 200 });
});
