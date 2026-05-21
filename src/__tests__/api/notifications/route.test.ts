import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

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
const mockRequireUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/notifications', () => ({
  listNotifications: mockList,
  markAllNotificationsRead: mockMarkAll,
  markNotificationRead: vi.fn(),
  createNotification: vi.fn(),
}));

vi.mock('@/lib/auth/require-user', () => ({
  requireAuthenticatedUser: mockRequireUser,
}));

import { GET, PATCH } from '@/app/api/notifications/route';

const SESSION_USER = {
  id: 'session-user',
  email: 'a@b.com',
  role: 'FOOTBALLER',
  emailVerified: null,
};

const SAMPLE_NOTIF = {
  id: 'n1',
  userId: 'session-user',
  type: 'GENERAL',
  title: 'Hi',
  body: 'Body',
  read: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

beforeEach(() => {
  mockList.mockReset();
  mockMarkAll.mockReset();
  mockRequireUser.mockReset();
});

describe('GET /api/notifications', () => {
  it('returns notifications for the session user', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockList.mockResolvedValueOnce([SAMPLE_NOTIF]);
    const req = new Request('http://localhost/api/notifications');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.notifications).toHaveLength(1);
    expect(body.notifications[0].id).toBe('n1');
    expect(mockList).toHaveBeenCalledWith('session-user', 50);
  });

  it('ignores any client-supplied userId and uses the session user instead', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockList.mockResolvedValueOnce([]);
    const req = new Request('http://localhost/api/notifications?userId=victim');
    await GET(req);
    expect(mockList).toHaveBeenCalledWith('session-user', 50);
  });

  it('returns 401 for anonymous callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));
    const req = new Request('http://localhost/api/notifications');
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('UNAUTHORIZED');
    expect(mockList).not.toHaveBeenCalled();
  });

  it('serialises createdAt as ISO string', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockList.mockResolvedValueOnce([SAMPLE_NOTIF]);
    const req = new Request('http://localhost/api/notifications');
    const res = await GET(req);
    const body = await res.json();
    expect(body.notifications[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('caps limit at 100', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockList.mockResolvedValueOnce([]);
    const req = new Request('http://localhost/api/notifications?limit=999');
    await GET(req);
    expect(mockList).toHaveBeenCalledWith('session-user', 100);
  });
});

describe('PATCH /api/notifications (mark-all-read)', () => {
  it('returns updated count for the session user', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockMarkAll.mockResolvedValueOnce(3);
    const req = new Request('http://localhost/api/notifications', { method: 'PATCH' });
    const res = await PATCH(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.updated).toBe(3);
    expect(mockMarkAll).toHaveBeenCalledWith('session-user');
  });

  it('ignores client-supplied userId in the body', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockMarkAll.mockResolvedValueOnce(0);
    const req = new Request('http://localhost/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'victim' }),
    });
    await PATCH(req);
    expect(mockMarkAll).toHaveBeenCalledWith('session-user');
  });

  it('returns 401 for anonymous callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));
    const req = new Request('http://localhost/api/notifications', { method: 'PATCH' });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
    expect(mockMarkAll).not.toHaveBeenCalled();
  });
});
