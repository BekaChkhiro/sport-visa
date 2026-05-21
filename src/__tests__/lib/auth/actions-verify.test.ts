import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test', NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io' },
}));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/index', () => ({ auth: mockAuth }));

const mockSendVerify = vi.hoisted(() => vi.fn());
vi.mock('@/lib/resend', () => ({ sendVerifyEmailEmail: mockSendVerify }));

const mockCreateToken = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/tokens', () => ({ createEmailVerificationToken: mockCreateToken }));

import { resendVerificationEmailAction } from '@/lib/auth/actions-verify';

beforeEach(() => {
  mockAuth.mockReset();
  mockSendVerify.mockReset();
  mockCreateToken.mockReset();
});

describe('resendVerificationEmailAction', () => {
  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const out = await resendVerificationEmailAction();
    expect(out.status).toBe('error');
    expect(mockCreateToken).not.toHaveBeenCalled();
  });

  it('rejects users whose email is already verified', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { email: 'user@example.com', emailVerified: new Date() },
    });
    const out = await resendVerificationEmailAction();
    expect(out.status).toBe('error');
    expect(mockCreateToken).not.toHaveBeenCalled();
  });

  it('creates a fresh token and sends a verify email for an unverified user', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { email: 'user@example.com', name: 'User', emailVerified: null },
    });
    mockCreateToken.mockResolvedValueOnce('signed-token');
    mockSendVerify.mockResolvedValueOnce({});

    const out = await resendVerificationEmailAction();

    expect(out).toEqual({ status: 'success' });
    expect(mockSendVerify).toHaveBeenCalledTimes(1);
    const [, args] = mockSendVerify.mock.calls[0]!;
    expect(args.verifyUrl).toContain('/api/auth/verify-email?token=signed-token');
    expect(args.verifyUrl).toContain('email=user%40example.com');
  });

  it('reports an error when email delivery fails', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { email: 'user@example.com', name: 'User', emailVerified: null },
    });
    mockCreateToken.mockRejectedValueOnce(new Error('boom'));
    const out = await resendVerificationEmailAction();
    expect(out.status).toBe('error');
  });
});
