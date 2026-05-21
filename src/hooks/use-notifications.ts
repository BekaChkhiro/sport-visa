'use client';

import { useCallback, useEffect, useState } from 'react';

import { usePusherChannel, usePusherEvent } from '@/hooks/use-pusher-channel';
import { channels, events } from '@/lib/pusher';

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

type PusherNotificationPayload = Omit<NotificationItem, 'read'>;

/**
 * Fetches a user's notifications on mount, then keeps the list live via
 * Pusher. Provides helpers to mark individual or all notifications as read.
 *
 * Pass `null` to skip fetching (e.g. when the user is not yet authenticated).
 */
export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = (await res.json()) as { notifications: NotificationItem[] };
        setNotifications(data.notifications);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to the user's private Pusher channel for real-time delivery.
  const channelName = userId ? channels.userNotifications(userId) : null;
  const channel = usePusherChannel(channelName);

  usePusherEvent<PusherNotificationPayload>(channel, events.NOTIFICATION, (payload) => {
    setNotifications((prev) => [{ ...payload, read: false }, ...prev]);
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(
    async (id: string) => {
      if (!userId) return;
      const res = await fetch(`/api/notifications/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    },
    [userId],
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh: fetchNotifications,
  };
}
