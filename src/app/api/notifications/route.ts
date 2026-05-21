import { NextResponse } from 'next/server';

import { apiHandler } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { listNotifications, markAllNotificationsRead } from '@/lib/notifications';

export const runtime = 'nodejs';

// TODO(T3): Replace userId extraction with a real session lookup once
// NextAuth lands. For now the caller passes `userId` as a query param —
// matching the placeholder pattern used in /api/pusher/auth.

/** GET /api/notifications?userId=<id>[&limit=<n>] — list a user's notifications. */
export const GET = apiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') ?? '';
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 100) : 50;

  if (!userId) {
    return NextResponse.json({ notifications: [] }, { status: 200 });
  }

  const notifications = await listNotifications(userId, limit);
  logger.debug({ userId, count: notifications.length }, 'notifications_listed');

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

/** PATCH /api/notifications — mark all notifications read for a user. */
export const PATCH = apiHandler(async (request: Request) => {
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
    return NextResponse.json({ updated: 0 }, { status: 200 });
  }

  const updated = await markAllNotificationsRead(userId);
  logger.info({ userId, updated }, 'notifications_all_marked_read');

  return NextResponse.json({ updated }, { status: 200 });
});
