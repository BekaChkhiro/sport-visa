import { describe, expect, it, vi } from 'vitest';

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

vi.mock('@/lib/pusher', () => ({
  authenticateChannel: mockAuthenticateChannel,
}));

import { POST } from '@/app/api/pusher/auth/route';

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
  it('returns 200 with auth token for a valid form-encoded request', async () => {
    mockAuthenticateChannel.mockReturnValueOnce('{"auth":"app-id:sig"}');
    const res = await POST(makeFormReq('123.456', 'private-chat.a.b'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ auth: 'app-id:sig' });
  });

  it('accepts JSON body as a fallback', async () => {
    mockAuthenticateChannel.mockReturnValueOnce('{"auth":"app-id:sig2"}');
    const res = await POST(makeJsonReq({ socket_id: '123.456', channel_name: 'private-chat.a.b' }));
    expect(res.status).toBe(200);
  });

  it('returns 400 when socket_id is missing', async () => {
    const res = await POST(makeFormReq('', 'private-chat.a.b'));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('BAD_REQUEST');
  });

  it('returns 400 when channel_name is missing', async () => {
    const res = await POST(makeFormReq('123.456', ''));
    expect(res.status).toBe(400);
  });

  it('returns 500 when authenticateChannel throws', async () => {
    mockAuthenticateChannel.mockImplementationOnce(() => {
      throw new Error('Pusher misconfigured');
    });
    const res = await POST(makeFormReq('123.456', 'private-chat.a.b'));
    expect(res.status).toBe(500);
  });
});
