import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io',
    EMAIL_INTERNAL_KEY: 'super-secret-internal-key-1234',
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

const mockSendWelcome = vi.hoisted(() => vi.fn());
const mockSendApplicationStatus = vi.hoisted(() => vi.fn());
const mockRequireUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/resend', () => ({
  sendWelcomeEmail: mockSendWelcome,
  sendApplicationStatusEmail: mockSendApplicationStatus,
  sendPasswordResetEmail: vi.fn(),
  sendAccountVerificationEmail: vi.fn(),
  sendServiceRequestEmail: vi.fn(),
}));

vi.mock('@/lib/auth/require-user', () => ({
  requireAuthenticatedUser: mockRequireUser,
}));

import { POST } from '@/app/api/email/send/route';

const ADMIN_USER = { id: 'admin-1', email: 'admin@x.com', role: 'ADMIN', emailVerified: null };
const FOOTBALLER_USER = {
  id: 'user-1',
  email: 'user@x.com',
  role: 'FOOTBALLER',
  emailVerified: null,
};

function makeReq(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('POST /api/email/send', () => {
  beforeEach(() => {
    mockSendWelcome.mockReset();
    mockSendApplicationStatus.mockReset();
    mockRequireUser.mockReset();
  });

  it('sends a welcome email for an ADMIN session', async () => {
    mockRequireUser.mockResolvedValueOnce(ADMIN_USER);
    mockSendWelcome.mockResolvedValueOnce({ id: 'email-w1' });
    const res = await POST(makeReq({ type: 'welcome', to: 'alice@example.com', name: 'Alice' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'email-w1' });
  });

  it('accepts a valid internal key without an admin session', async () => {
    mockSendApplicationStatus.mockResolvedValueOnce({ id: 'email-a1' });
    const res = await POST(
      makeReq(
        {
          type: 'application_status',
          to: 'carlos@example.com',
          playerName: 'Carlos',
          clubName: 'FC Test',
          status: 'accepted',
        },
        { 'x-internal-key': 'super-secret-internal-key-1234' },
      ),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'email-a1' });
    expect(mockRequireUser).not.toHaveBeenCalled();
  });

  it('returns 401 for anonymous callers (no key, no session)', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));
    const res = await POST(makeReq({ type: 'welcome', to: 'a@b.com', name: 'A' }));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('UNAUTHORIZED');
    expect(mockSendWelcome).not.toHaveBeenCalled();
  });

  it('returns 403 when the session user is not an admin', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);
    const res = await POST(makeReq({ type: 'welcome', to: 'a@b.com', name: 'A' }));
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('FORBIDDEN');
    expect(mockSendWelcome).not.toHaveBeenCalled();
  });

  it('returns 403 when an invalid internal key is presented without an admin session', async () => {
    mockRequireUser.mockResolvedValueOnce(FOOTBALLER_USER);
    const res = await POST(
      makeReq({ type: 'welcome', to: 'a@b.com', name: 'A' }, { 'x-internal-key': 'wrong-key' }),
    );
    expect(res.status).toBe(403);
    expect(mockSendWelcome).not.toHaveBeenCalled();
  });

  it('rejects the free-form notification type (caller-supplied bodyHtml/subject)', async () => {
    mockRequireUser.mockResolvedValueOnce(ADMIN_USER);
    const res = await POST(
      makeReq({
        type: 'notification',
        to: 'dana@example.com',
        recipientName: 'Dana',
        subject: 'Phishing payload',
        bodyHtml: '<a href="http://evil.example">click</a>',
        bodyText: 'Click here',
      }),
    );
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe('VALIDATION');
  });

  it('returns 422 for an unrecognised email type', async () => {
    mockRequireUser.mockResolvedValueOnce(ADMIN_USER);
    const res = await POST(makeReq({ type: 'newsletter', to: 'x@example.com' }));
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe('VALIDATION');
  });

  it('returns 422 when required fields are missing from welcome', async () => {
    mockRequireUser.mockResolvedValueOnce(ADMIN_USER);
    const res = await POST(makeReq({ type: 'welcome', to: 'x@example.com' }));
    expect(res.status).toBe(422);
  });

  it('returns 422 for an invalid email address', async () => {
    mockRequireUser.mockResolvedValueOnce(ADMIN_USER);
    const res = await POST(makeReq({ type: 'welcome', to: 'not-an-email', name: 'X' }));
    expect(res.status).toBe(422);
  });

  it('returns 400 for a non-JSON body', async () => {
    mockRequireUser.mockResolvedValueOnce(ADMIN_USER);
    const req = new Request('http://localhost/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when the email service throws', async () => {
    mockRequireUser.mockResolvedValueOnce(ADMIN_USER);
    mockSendWelcome.mockRejectedValueOnce(new Error('Resend down'));
    const res = await POST(makeReq({ type: 'welcome', to: 'a@b.com', name: 'A' }));
    expect(res.status).toBe(500);
  });
});
