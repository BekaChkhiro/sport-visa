import type { NotificationType } from '@prisma/client';

import { db } from './db';
import { channels, events, triggerEvent } from './pusher';

export type { NotificationType };

export type NotificationRow = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
};

export type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
};

/** Persist a notification and push it to the user's real-time channel. */
export async function createNotification(
  params: CreateNotificationParams,
): Promise<NotificationRow> {
  const notification = await db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
    },
  });

  // Fire-and-forget — Pusher failure is non-fatal; the row is already persisted.
  triggerEvent(channels.userNotifications(params.userId), events.NOTIFICATION, {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt.toISOString(),
  }).catch(() => undefined);

  return notification;
}

/** List a user's notifications, newest first. */
export async function listNotifications(userId: string, limit = 50): Promise<NotificationRow[]> {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Mark a single notification as read.
 * Scopes by userId to prevent one user from marking another's notifications.
 * Returns true if a row was updated.
 */
export async function markNotificationRead(id: string, userId: string): Promise<boolean> {
  const result = await db.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
  return result.count > 0;
}

/** Mark all of a user's unread notifications as read. Returns the count updated. */
export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return result.count;
}
