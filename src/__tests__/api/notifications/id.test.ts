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

const mockMarkRead = vi.hoisted(() => vi.fn());

vi.mock('@/lib/notifications', () => ({
  markNotificationRead: mockMarkRead,
  listNotifications: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  createNotification: vi.fn(),
}));

import { PATCH } from '@/app/api/notifications/[id]/route';

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('PATCH /api/notifications/[id]', () => {
  it('marks the notification as read and returns 200', async () => {
    mockMarkRead.mockResolvedValueOnce(true);
    const req = new Request('http://localhost/api/notifications/n1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u1' }),
    });
    const res = await PATCH(req, makeContext('n1'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({ id: 'n1', read: true });
  });

  it('returns 404 when notification is not found', async () => {
    mockMarkRead.mockResolvedValueOnce(false);
    const req = new Request('http://localhost/api/notifications/missing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u1' }),
    });
    const res = await PATCH(req, makeContext('missing'));
    expect(res.status).toBe(404);
  });

  it('returns 400 when userId is missing', async () => {
    const req = new Request('http://localhost/api/notifications/n1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await PATCH(req, makeContext('n1'));
    expect(res.status).toBe(400);
  });
});
