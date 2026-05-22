import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test', NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io' },
}));

const mockRecordVerifyEmailAttempt = vi.hoisted(() => vi.fn(() => ({ allowed: true })));
vi.mock('@/lib/auth/rate-limit', () => ({
  recordVerifyEmailAttempt: mockRecordVerifyEmailAttempt,
}));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// Minimal NextResponse stand-in: we only use NextResponse.redirect, and the
// production code attaches `.cookies.delete()` after construction, so the
// returned object needs a cookies bag.
vi.mock('next/server', () => {
  class Response {
    url: string;
    status: number;
    cookies: { delete: (name: string) => void; deleted: string[] };
    constructor(url: string, status = 307) {
      this.url = url;
      this.status = status;
      const deleted: string[] = [];
      this.cookies = {
        delete: (name: string) => {
          deleted.push(name);
        },
        deleted,
      };
    }
  }
  return {
    NextResponse: {
      redirect: (url: URL) => new Response(url.toString()),
    },
  };
});

const mockConsumeToken = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/tokens', () => ({ consumeEmailVerificationToken: mockConsumeToken }));

const mockUserUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/db', () => ({ db: { user: { update: mockUserUpdate } } }));

import { GET } from '@/app/api/auth/verify-email/route';

function buildRequest(url: string, ip = '127.0.0.1') {
  const headers = { get: (name: string) => (name === 'x-forwarded-for' ? ip : null) };
  return {
    nextUrl: new URL(url),
    headers,
  } as unknown as Parameters<typeof GET>[0];
}

beforeEach(() => {
  mockConsumeToken.mockReset();
  mockUserUpdate.mockReset();
  mockRecordVerifyEmailAttempt.mockReset();
  mockRecordVerifyEmailAttempt.mockReturnValue({ allowed: true });
});

describe('GET /api/auth/verify-email', () => {
  it('redirects to rate-limited error when the IP is rate-limited', async () => {
    mockRecordVerifyEmailAttempt.mockReturnValueOnce({ allowed: false });
    const res = (await GET(
      buildRequest(
        'https://app.sportvisa.io/api/auth/verify-email?token=abc&email=user@example.com',
      ),
    )) as unknown as { url: string };
    expect(res.url).toContain('/auth/signin?error=rate-limited');
    expect(mockConsumeToken).not.toHaveBeenCalled();
  });

  it('redirects to invalid-link error when the token is missing', async () => {
    const res = (await GET(
      buildRequest('https://app.sportvisa.io/api/auth/verify-email?email=user@example.com'),
    )) as unknown as { url: string };
    expect(res.url).toContain('/auth/signin?error=invalid-link');
    expect(mockConsumeToken).not.toHaveBeenCalled();
  });

  it('redirects to invalid-link error when the email is missing', async () => {
    const res = (await GET(
      buildRequest('https://app.sportvisa.io/api/auth/verify-email?token=abc'),
    )) as unknown as { url: string };
    expect(res.url).toContain('/auth/signin?error=invalid-link');
    expect(mockConsumeToken).not.toHaveBeenCalled();
  });

  it('redirects to link-expired when the token is rejected by the consumer', async () => {
    mockConsumeToken.mockResolvedValueOnce(false);
    const res = (await GET(
      buildRequest(
        'https://app.sportvisa.io/api/auth/verify-email?token=expired-token&email=user@example.com',
      ),
    )) as unknown as { url: string };
    expect(res.url).toContain('/auth/signin?error=link-expired');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('redirects to server-error when the consumer throws', async () => {
    mockConsumeToken.mockRejectedValueOnce(new Error('db down'));
    const res = (await GET(
      buildRequest(
        'https://app.sportvisa.io/api/auth/verify-email?token=abc&email=user@example.com',
      ),
    )) as unknown as { url: string };
    expect(res.url).toContain('/auth/signin?error=server-error');
  });

  it('marks the user verified, clears session cookies, and redirects to verified=1 on success', async () => {
    mockConsumeToken.mockResolvedValueOnce(true);
    mockUserUpdate.mockResolvedValueOnce({});

    const res = (await GET(
      buildRequest(
        'https://app.sportvisa.io/api/auth/verify-email?token=good&email=user@example.com',
      ),
    )) as unknown as { url: string; cookies: { deleted: string[] } };

    expect(mockUserUpdate).toHaveBeenCalledTimes(1);
    const updateArg = mockUserUpdate.mock.calls[0]![0];
    expect(updateArg.where).toEqual({ email: 'user@example.com' });
    expect(updateArg.data.emailVerified).toBeInstanceOf(Date);

    expect(res.url).toContain('/auth/signin?verified=1');
    // Both prod and dev cookie names must be cleared so the stale JWT is
    // not carried into the post-verification session.
    expect(res.cookies.deleted).toContain('authjs.session-token');
    expect(res.cookies.deleted).toContain('__Secure-authjs.session-token');
  });

  it('redirects to server-error when the DB update fails after token consumption', async () => {
    mockConsumeToken.mockResolvedValueOnce(true);
    mockUserUpdate.mockRejectedValueOnce(new Error('boom'));

    const res = (await GET(
      buildRequest(
        'https://app.sportvisa.io/api/auth/verify-email?token=good&email=user@example.com',
      ),
    )) as unknown as { url: string };
    expect(res.url).toContain('/auth/signin?error=server-error');
  });
});
