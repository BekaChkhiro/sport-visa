import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    PUSHER_APP_ID: 'app-id',
    PUSHER_KEY: 'key-123',
    PUSHER_SECRET: 'secret-456',
    PUSHER_CLUSTER: 'eu',
  },
}));

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockTrigger = vi.hoisted(() => vi.fn());
vi.mock('pusher', () => ({
  default: vi.fn(function () {
    return { trigger: mockTrigger, authorizeChannel: vi.fn() };
  }),
}));

const mockCreate = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());
const mockUpdateMany = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    notification: {
      create: mockCreate,
      findMany: mockFindMany,
      updateMany: mockUpdateMany,
    },
  },
}));

import {
  createNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/notifications';

const SAMPLE = {
  id: 'notif-1',
  userId: 'user-abc',
  type: 'GENERAL' as const,
  title: 'Hello',
  body: 'World',
  read: false,
  createdAt: new Date('2026-01-01T10:00:00Z'),
};

describe('createNotification', () => {
  it('persists the notification and returns the row', async () => {
    mockCreate.mockResolvedValueOnce(SAMPLE);
    mockTrigger.mockResolvedValueOnce({});

    const result = await createNotification({
      userId: 'user-abc',
      type: 'GENERAL',
      title: 'Hello',
      body: 'World',
    });

    expect(result).toEqual(SAMPLE);
    expect(mockCreate).toHaveBeenCalledWith({
      data: { userId: 'user-abc', type: 'GENERAL', title: 'Hello', body: 'World' },
    });
  });

  it('fires a Pusher trigger after persisting', async () => {
    mockCreate.mockResolvedValueOnce(SAMPLE);
    mockTrigger.mockResolvedValueOnce({});

    await createNotification({ userId: 'user-abc', type: 'GENERAL', title: 'T', body: 'B' });

    expect(mockTrigger).toHaveBeenCalledWith(
      'private-user.user-abc.notifications',
      'notification',
      expect.objectContaining({ id: 'notif-1', title: 'Hello' }),
    );
  });

  it('still returns the row when Pusher trigger fails', async () => {
    mockCreate.mockResolvedValueOnce(SAMPLE);
    mockTrigger.mockRejectedValueOnce(new Error('Pusher down'));

    // Should not throw
    const result = await createNotification({
      userId: 'user-abc',
      type: 'GENERAL',
      title: 'T',
      body: 'B',
    });
    expect(result).toEqual(SAMPLE);
  });
});

describe('listNotifications', () => {
  it('returns notifications ordered by createdAt desc', async () => {
    mockFindMany.mockResolvedValueOnce([SAMPLE]);
    const result = await listNotifications('user-abc');
    expect(result).toEqual([SAMPLE]);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-abc' },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('applies the limit', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await listNotifications('user-abc', 10);
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
  });

  it('defaults to limit 50', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await listNotifications('user-abc');
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 50 }));
  });
});

describe('markNotificationRead', () => {
  it('returns true when a row was updated', async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });
    expect(await markNotificationRead('notif-1', 'user-abc')).toBe(true);
  });

  it('returns false when no matching row exists', async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });
    expect(await markNotificationRead('notif-x', 'user-abc')).toBe(false);
  });

  it('scopes the update to both id and userId', async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });
    await markNotificationRead('notif-1', 'user-abc');
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'notif-1', userId: 'user-abc' },
      }),
    );
  });
});

describe('markAllNotificationsRead', () => {
  it('returns the count of updated rows', async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 5 });
    expect(await markAllNotificationsRead('user-abc')).toBe(5);
  });

  it('only updates unread notifications for the user', async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });
    await markAllNotificationsRead('user-abc');
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-abc', read: false },
        data: { read: true },
      }),
    );
  });
});
