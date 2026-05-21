import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test', NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io' },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({
      status: init?.status ?? 200,
      headers: new Headers(),
      json: async () => body,
    })),
  },
}));

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock('@/lib/request-context', () => ({
  generateRequestId: vi.fn(() => 'rid'),
  getRequestId: vi.fn(() => null),
  REQUEST_ID_HEADER: 'x-request-id',
  runWithRequestContext: vi.fn((_c: unknown, fn: () => unknown) => fn()),
}));

const mockList = vi.hoisted(() => vi.fn());
const mockMarkAll = vi.hoisted(() => vi.fn());

vi.mock('@/lib/notifications', () => ({
  listNotifications: mockList,
  markAllNotificationsRead: mockMarkAll,
  markNotificationRead: vi.fn(),
  createNotification: vi.fn(),
}));

import { GET, PATCH } from '@/app/api/notifications/route';

const SAMPLE_NOTIF = {
  id: 'n1',
  userId: 'u1',
  type: 'GENERAL',
  title: 'Hi',
  body: 'Body',
  read: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

describe('GET /api/notifications', () => {
  it('returns notifications for a valid userId', async () => {
    mockList.mockResolvedValueOnce([SAMPLE_NOTIF]);
    const req = new Request('http://localhost/api/notifications?userId=u1');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.notifications).toHaveLength(1);
    expect(body.notifications[0].id).toBe('n1');
  });

  it('returns empty array when userId is missing', async () => {
    const req = new Request('http://localhost/api/notifications');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.notifications).toEqual([]);
  });

  it('serialises createdAt as ISO string', async () => {
    mockList.mockResolvedValueOnce([SAMPLE_NOTIF]);
    const req = new Request('http://localhost/api/notifications?userId=u1');
    const res = await GET(req);
    const body = await res.json();
    expect(body.notifications[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('caps limit at 100', async () => {
    mockList.mockResolvedValueOnce([]);
    const req = new Request('http://localhost/api/notifications?userId=u1&limit=999');
    await GET(req);
    expect(mockList).toHaveBeenCalledWith('u1', 100);
  });
});

describe('PATCH /api/notifications (mark-all-read)', () => {
  it('returns updated count', async () => {
    mockMarkAll.mockResolvedValueOnce(3);
    const req = new Request('http://localhost/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u1' }),
    });
    const res = await PATCH(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.updated).toBe(3);
  });

  it('returns 0 when userId is missing', async () => {
    const req = new Request('http://localhost/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await PATCH(req);
    const body = await res.json();
    expect(body.updated).toBe(0);
  });
});
