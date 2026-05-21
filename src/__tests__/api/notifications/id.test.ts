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

const mockMarkRead = vi.hoisted(() => vi.fn());
const mockRequireUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/notifications', () => ({
  markNotificationRead: mockMarkRead,
  listNotifications: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  createNotification: vi.fn(),
}));

vi.mock('@/lib/auth/require-user', () => ({
  requireAuthenticatedUser: mockRequireUser,
}));

import { PATCH } from '@/app/api/notifications/[id]/route';

const SESSION_USER = {
  id: 'session-user',
  email: 'a@b.com',
  role: 'FOOTBALLER',
  emailVerified: null,
};

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeReq(id: string) {
  return new Request(`http://localhost/api/notifications/${id}`, { method: 'PATCH' });
}

describe('PATCH /api/notifications/[id]', () => {
  beforeEach(() => {
    mockMarkRead.mockReset();
    mockRequireUser.mockReset();
  });

  it('marks the notification as read using the session user', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockMarkRead.mockResolvedValueOnce(true);
    const res = await PATCH(makeReq('n1'), makeContext('n1'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({ id: 'n1', read: true });
    expect(mockMarkRead).toHaveBeenCalledWith('n1', 'session-user');
  });

  it('returns 404 when the notification belongs to another user (cross-user)', async () => {
    // updateMany on (id, userId) returns count=0 for someone else's row.
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockMarkRead.mockResolvedValueOnce(false);
    const res = await PATCH(makeReq('belongs-to-victim'), makeContext('belongs-to-victim'));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('NOT_FOUND');
  });

  it('returns 404 when the notification is not found', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockMarkRead.mockResolvedValueOnce(false);
    const res = await PATCH(makeReq('missing'), makeContext('missing'));
    expect(res.status).toBe(404);
  });

  it('returns 401 for anonymous callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));
    const res = await PATCH(makeReq('n1'), makeContext('n1'));
    expect(res.status).toBe(401);
    expect(mockMarkRead).not.toHaveBeenCalled();
  });
});
