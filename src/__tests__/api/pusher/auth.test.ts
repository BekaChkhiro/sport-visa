import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io',
  },
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

const mockAuthenticateChannel = vi.hoisted(() => vi.fn());
const mockIsChannelAllowedForUser = vi.hoisted(() => vi.fn());
const mockRequireUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/pusher', () => ({
  authenticateChannel: mockAuthenticateChannel,
  isChannelAllowedForUser: mockIsChannelAllowedForUser,
}));

vi.mock('@/lib/auth/require-user', () => ({
  requireAuthenticatedUser: mockRequireUser,
}));

import { POST } from '@/app/api/pusher/auth/route';

const SESSION_USER = { id: 'user-1', email: 'a@b.com', role: 'FOOTBALLER', emailVerified: null };

function makeFormReq(socketId: string, channelName: string) {
  return new Request('http://localhost/api/pusher/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ socket_id: socketId, channel_name: channelName }).toString(),
  });
}

function makeJsonReq(body: unknown) {
  return new Request('http://localhost/api/pusher/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/pusher/auth', () => {
  beforeEach(() => {
    mockAuthenticateChannel.mockReset();
    mockIsChannelAllowedForUser.mockReset();
    mockRequireUser.mockReset();
  });

  it('returns 200 with auth token for a valid form-encoded request', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockIsChannelAllowedForUser.mockReturnValueOnce(true);
    mockAuthenticateChannel.mockReturnValueOnce('{"auth":"app-id:sig"}');
    const res = await POST(makeFormReq('123.456', 'private-user.user-1.notifications'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ auth: 'app-id:sig' });
    expect(mockAuthenticateChannel).toHaveBeenCalledWith(
      '123.456',
      'private-user.user-1.notifications',
      { user_id: 'user-1' },
    );
  });

  it('accepts JSON body as a fallback', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockIsChannelAllowedForUser.mockReturnValueOnce(true);
    mockAuthenticateChannel.mockReturnValueOnce('{"auth":"app-id:sig2"}');
    const res = await POST(
      makeJsonReq({ socket_id: '123.456', channel_name: 'private-user.user-1.notifications' }),
    );
    expect(res.status).toBe(200);
  });

  it('returns 401 when no session is present', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));
    const res = await POST(makeFormReq('123.456', 'private-user.user-1.notifications'));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('UNAUTHORIZED');
    expect(mockAuthenticateChannel).not.toHaveBeenCalled();
  });

  it('returns 403 when the caller is not allowed on the requested channel', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockIsChannelAllowedForUser.mockReturnValueOnce(false);
    const res = await POST(makeFormReq('123.456', 'private-user.someone-else.notifications'));
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('FORBIDDEN');
    expect(mockAuthenticateChannel).not.toHaveBeenCalled();
  });

  it('returns 400 when socket_id is missing', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const res = await POST(makeFormReq('', 'private-user.user-1.notifications'));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('BAD_REQUEST');
  });

  it('returns 400 when channel_name is missing', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const res = await POST(makeFormReq('123.456', ''));
    expect(res.status).toBe(400);
  });

  it('returns 500 when authenticateChannel throws', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockIsChannelAllowedForUser.mockReturnValueOnce(true);
    mockAuthenticateChannel.mockImplementationOnce(() => {
      throw new Error('Pusher misconfigured');
    });
    const res = await POST(makeFormReq('123.456', 'private-user.user-1.notifications'));
    expect(res.status).toBe(500);
  });
});
