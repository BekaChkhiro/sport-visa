import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io',
    EMAIL_INTERNAL_KEY: 'super-secret-internal-key-16c',
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

const mockNotifFindMany = vi.hoisted(() => vi.fn());
vi.mock('@/lib/db', () => ({
  db: {
    notification: { findMany: mockNotifFindMany },
  },
}));

const mockSendDigest = vi.hoisted(() => vi.fn());
vi.mock('@/lib/resend', () => ({
  sendDigestEmail: mockSendDigest,
}));

const mockRequireUser = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/require-user', () => ({
  requireAuthenticatedUser: mockRequireUser,
}));

import { ApiError } from '@/lib/api-error';
import { POST } from '@/app/api/digest/send/route';

const INTERNAL_KEY = 'super-secret-internal-key-16c';

function makeRequest(options?: { key?: string; adminSession?: boolean }): Request {
  const headers = new Headers();
  if (options?.key) headers.set('x-internal-key', options.key);
  return new Request('http://localhost/api/digest/send', {
    method: 'POST',
    headers,
  });
}

const NOTIF_USER_A = {
  id: 'n1',
  userId: 'user-a',
  type: 'NEW_CLUB_POST',
  title: 'New post from FC Dinamo',
  body: 'New Season Starts',
  read: false,
  createdAt: new Date('2026-05-25T12:00:00Z'),
  user: { email: 'a@example.com', firstName: 'Ana', lastName: 'K' },
};

const NOTIF_USER_B = {
  id: 'n2',
  userId: 'user-b',
  type: 'NEW_CLUB_POST',
  title: 'New post from FC Rubin',
  body: 'Transfer Update',
  read: false,
  createdAt: new Date('2026-05-25T14:00:00Z'),
  user: { email: 'b@example.com', firstName: null, lastName: null },
};

beforeEach(() => {
  mockNotifFindMany.mockReset();
  mockSendDigest.mockReset();
  mockRequireUser.mockReset();
});

describe('POST /api/digest/send — auth', () => {
  it('accepts a valid x-internal-key', async () => {
    mockNotifFindMany.mockResolvedValueOnce([]);
    const res = await POST(makeRequest({ key: INTERNAL_KEY }));
    expect(res.status).toBe(200);
  });

  it('rejects a wrong x-internal-key', async () => {
    mockNotifFindMany.mockResolvedValueOnce([]);
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Auth required'));
    const res = await POST(makeRequest({ key: 'wrong-key' }));
    expect(res.status).toBe(401);
  });

  it('accepts an ADMIN session when no internal key is presented', async () => {
    mockRequireUser.mockResolvedValueOnce({ id: 'admin1', role: 'ADMIN', email: 'a@a.com' });
    mockNotifFindMany.mockResolvedValueOnce([]);
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });

  it('rejects a FOOTBALLER session', async () => {
    mockRequireUser.mockResolvedValueOnce({ id: 'fp1', role: 'FOOTBALLER', email: 'f@f.com' });
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
    expect(mockSendDigest).not.toHaveBeenCalled();
  });
});

describe('POST /api/digest/send — no notifications', () => {
  it('returns sent:0 when there are no unread posts', async () => {
    mockNotifFindMany.mockResolvedValueOnce([]);
    const res = await POST(makeRequest({ key: INTERNAL_KEY }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.sent).toBe(0);
    expect(body.skipped).toBe(0);
    expect(mockSendDigest).not.toHaveBeenCalled();
  });
});

describe('POST /api/digest/send — sends digests', () => {
  it('sends one digest per unique user', async () => {
    mockNotifFindMany.mockResolvedValueOnce([NOTIF_USER_A, NOTIF_USER_B]);
    mockSendDigest.mockResolvedValue({ id: 'email-ok' });

    const res = await POST(makeRequest({ key: INTERNAL_KEY }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sent).toBe(2);
    expect(body.skipped).toBe(0);
    expect(mockSendDigest).toHaveBeenCalledTimes(2);
  });

  it('groups multiple notifications for the same user into one digest', async () => {
    const secondNotif = {
      ...NOTIF_USER_A,
      id: 'n3',
      body: 'Another Post',
      title: 'New post from FC Dinamo',
    };
    mockNotifFindMany.mockResolvedValueOnce([NOTIF_USER_A, secondNotif]);
    mockSendDigest.mockResolvedValueOnce({ id: 'email-ok' });

    const res = await POST(makeRequest({ key: INTERNAL_KEY }));
    const body = await res.json();

    expect(body.sent).toBe(1);
    expect(mockSendDigest).toHaveBeenCalledTimes(1);
    const callPosts = (mockSendDigest.mock.calls[0] as [string, { posts: unknown[] }])[1].posts;
    expect(callPosts).toHaveLength(2);
  });

  it('extracts club name from notification title', async () => {
    mockNotifFindMany.mockResolvedValueOnce([NOTIF_USER_A]);
    mockSendDigest.mockResolvedValueOnce({ id: 'email-ok' });

    await POST(makeRequest({ key: INTERNAL_KEY }));

    type DigestCall = [
      string,
      { posts: Array<{ clubName: string; postTitle: string }>; recipientName: string },
    ];
    const digestProps = (mockSendDigest.mock.calls[0] as DigestCall)[1];
    expect(digestProps.posts[0]?.clubName).toBe('FC Dinamo');
    expect(digestProps.posts[0]?.postTitle).toBe('New Season Starts');
  });

  it('falls back to email username when firstName is null', async () => {
    mockNotifFindMany.mockResolvedValueOnce([NOTIF_USER_B]);
    mockSendDigest.mockResolvedValueOnce({ id: 'email-ok' });

    await POST(makeRequest({ key: INTERNAL_KEY }));

    const digestProps = (mockSendDigest.mock.calls[0] as [string, { recipientName: string }])[1];
    expect(typeof digestProps.recipientName).toBe('string');
    expect(digestProps.recipientName.length).toBeGreaterThan(0);
  });

  it('counts skipped when sendDigestEmail throws', async () => {
    mockNotifFindMany.mockResolvedValueOnce([NOTIF_USER_A, NOTIF_USER_B]);
    mockSendDigest
      .mockResolvedValueOnce({ id: 'ok' })
      .mockRejectedValueOnce(new Error('Resend down'));

    const res = await POST(makeRequest({ key: INTERNAL_KEY }));
    const body = await res.json();

    expect(body.sent + body.skipped).toBe(2);
  });

  it('queries only unread NEW_CLUB_POST notifications from the last 24h', async () => {
    mockNotifFindMany.mockResolvedValueOnce([]);

    await POST(makeRequest({ key: INTERNAL_KEY }));

    expect(mockNotifFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: 'NEW_CLUB_POST',
          read: false,
          createdAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      }),
    );
  });
});
