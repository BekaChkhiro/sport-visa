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

const mockRequireUser = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/require-user', () => ({
  requireAuthenticatedUser: mockRequireUser,
}));

const mockGetOrCreate = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/notification-preferences', () => ({
  getOrCreatePreferences: mockGetOrCreate,
  updatePreferences: mockUpdate,
}));

import { GET, PATCH } from '@/app/api/settings/notification-preferences/route';

const SESSION_USER = { id: 'user-1', email: 'a@b.com', role: 'FOOTBALLER' };
const DEFAULT_PREFS = {
  id: 'pref-1',
  userId: 'user-1',
  emailInstant: true,
  emailDigest: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  mockRequireUser.mockReset();
  mockGetOrCreate.mockReset();
  mockUpdate.mockReset();
});

describe('GET /api/settings/notification-preferences', () => {
  it('returns the user preferences', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockGetOrCreate.mockResolvedValueOnce(DEFAULT_PREFS);
    const req = new Request('http://localhost/api/settings/notification-preferences');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.emailInstant).toBe(true);
    expect(body.emailDigest).toBe(true);
  });

  it('returns 401 for unauthenticated callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Auth required'));
    const req = new Request('http://localhost/api/settings/notification-preferences');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('calls getOrCreatePreferences with the session userId', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockGetOrCreate.mockResolvedValueOnce(DEFAULT_PREFS);
    const req = new Request('http://localhost/api/settings/notification-preferences');
    await GET(req);
    expect(mockGetOrCreate).toHaveBeenCalledWith('user-1');
  });
});

describe('PATCH /api/settings/notification-preferences', () => {
  it('updates emailDigest to false', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockUpdate.mockResolvedValueOnce({ ...DEFAULT_PREFS, emailDigest: false });
    const req = new Request('http://localhost/api/settings/notification-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailDigest: false }),
    });
    const res = await PATCH(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.emailDigest).toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith('user-1', { emailDigest: false });
  });

  it('updates emailInstant independently', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockUpdate.mockResolvedValueOnce({ ...DEFAULT_PREFS, emailInstant: false });
    const req = new Request('http://localhost/api/settings/notification-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailInstant: false }),
    });
    const res = await PATCH(req);
    const body = await res.json();
    expect(body.emailInstant).toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith('user-1', { emailInstant: false });
  });

  it('returns 400 for empty body', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const req = new Request('http://localhost/api/settings/notification-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns 422 for non-boolean value', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const req = new Request('http://localhost/api/settings/notification-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailDigest: 'yes' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(422);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const req = new Request('http://localhost/api/settings/notification-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 for unauthenticated callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Auth required'));
    const req = new Request('http://localhost/api/settings/notification-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailDigest: false }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
