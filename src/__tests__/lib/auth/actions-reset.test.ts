import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test', NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io' },
}));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockFindUnique = vi.hoisted(() => vi.fn());
const mockUserUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/db', () => ({
  db: { user: { findUnique: mockFindUnique, update: mockUserUpdate } },
}));

const mockHashPassword = vi.hoisted(() => vi.fn(async (p: string) => `hashed:${p}`));
vi.mock('@/lib/auth/password', () => ({ hashPassword: mockHashPassword }));

const mockSendReset = vi.hoisted(() => vi.fn());
vi.mock('@/lib/resend', () => ({ sendPasswordResetEmail: mockSendReset }));

const mockCreateResetToken = vi.hoisted(() => vi.fn());
const mockConsumeResetToken = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/tokens', () => ({
  createPasswordResetToken: mockCreateResetToken,
  consumePasswordResetToken: mockConsumeResetToken,
}));

const mockRecordPasswordResetAttempt = vi.hoisted(() => vi.fn(() => ({ allowed: true })));
vi.mock('@/lib/auth/rate-limit', () => ({
  recordPasswordResetAttempt: mockRecordPasswordResetAttempt,
}));

vi.mock('@/lib/auth/ip', () => ({
  getCallerIp: vi.fn(async () => '127.0.0.1'),
}));

import { requestPasswordResetAction, resetPasswordAction } from '@/lib/auth/actions-reset';

beforeEach(() => {
  mockFindUnique.mockReset();
  mockUserUpdate.mockReset();
  mockHashPassword.mockClear();
  mockSendReset.mockReset();
  mockCreateResetToken.mockReset();
  mockConsumeResetToken.mockReset();
  mockRecordPasswordResetAttempt.mockReset();
  mockRecordPasswordResetAttempt.mockReturnValue({ allowed: true });
});

function forgotForm(email: string | undefined): FormData {
  const fd = new FormData();
  if (email !== undefined) fd.set('email', email);
  return fd;
}

describe('requestPasswordResetAction — rate limiting', () => {
  it('returns success-shaped response when rate-limited (no email sent, no DB call)', async () => {
    mockRecordPasswordResetAttempt.mockReturnValueOnce({ allowed: false });
    const out = await requestPasswordResetAction(forgotForm('someone@example.com'));
    expect(out).toEqual({ status: 'success' });
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockSendReset).not.toHaveBeenCalled();
  });
});

describe('requestPasswordResetAction — user-enumeration safety', () => {
  it('returns the SAME success state for a known email and an unknown one', async () => {
    // Known user with a password.
    mockFindUnique.mockResolvedValueOnce({
      email: 'known@example.com',
      passwordHash: 'h',
      firstName: 'K',
      lastName: 'N',
    });
    mockCreateResetToken.mockResolvedValueOnce('tok-known');
    mockSendReset.mockResolvedValueOnce({});

    const known = await requestPasswordResetAction(forgotForm('known@example.com'));

    // Unknown user — null lookup.
    mockFindUnique.mockResolvedValueOnce(null);

    const unknown = await requestPasswordResetAction(forgotForm('ghost@example.com'));

    expect(known).toEqual({ status: 'success' });
    expect(unknown).toEqual({ status: 'success' });
    // Crucially: the email was only sent for the real account, but the
    // attacker-visible response is indistinguishable.
    expect(mockSendReset).toHaveBeenCalledTimes(1);
  });

  it('also reports success when the DB itself errors (no internal-state leak)', async () => {
    mockFindUnique.mockRejectedValueOnce(new Error('db down'));
    const out = await requestPasswordResetAction(forgotForm('user@example.com'));
    expect(out).toEqual({ status: 'success' });
    expect(mockSendReset).not.toHaveBeenCalled();
  });

  it('does not send reset emails to OAuth-only accounts (no passwordHash)', async () => {
    mockFindUnique.mockResolvedValueOnce({
      email: 'oauth@example.com',
      passwordHash: null,
      firstName: 'O',
      lastName: 'A',
    });
    const out = await requestPasswordResetAction(forgotForm('oauth@example.com'));
    expect(out).toEqual({ status: 'success' });
    expect(mockSendReset).not.toHaveBeenCalled();
  });

  it('still returns success when sending the reset email throws', async () => {
    mockFindUnique.mockResolvedValueOnce({
      email: 'user@example.com',
      passwordHash: 'h',
      firstName: 'A',
      lastName: 'B',
    });
    mockCreateResetToken.mockRejectedValueOnce(new Error('resend down'));

    const out = await requestPasswordResetAction(forgotForm('user@example.com'));
    expect(out).toEqual({ status: 'success' });
  });

  it('rejects an invalid email at the validation layer', async () => {
    const out = await requestPasswordResetAction(forgotForm('not-an-email'));
    expect(out.status).toBe('error');
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

function resetForm(
  overrides: Partial<Record<'token' | 'email' | 'password' | 'passwordConfirm', string>> = {},
): FormData {
  const fd = new FormData();
  const merged: Record<string, string> = {
    token: 'a'.repeat(32),
    email: 'user@example.com',
    password: 'NewPass1!',
    passwordConfirm: 'NewPass1!',
    ...overrides,
  };
  for (const [k, v] of Object.entries(merged)) {
    fd.set(k, v);
  }
  return fd;
}

describe('resetPasswordAction', () => {
  it('succeeds with a valid token and matching passwords', async () => {
    mockConsumeResetToken.mockResolvedValueOnce(true);
    mockFindUnique.mockResolvedValueOnce({
      email: 'user@example.com',
      passwordHash: 'old-hash',
    });
    mockUserUpdate.mockResolvedValueOnce({});

    const out = await resetPasswordAction(resetForm());

    expect(out).toEqual({ status: 'success' });
    expect(mockHashPassword).toHaveBeenCalledWith('NewPass1!');
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { passwordHash: 'hashed:NewPass1!' },
    });
  });

  it('rejects mismatched password / passwordConfirm', async () => {
    const out = await resetPasswordAction(resetForm({ passwordConfirm: 'Different1!' }));
    expect(out.status).toBe('error');
    expect(mockConsumeResetToken).not.toHaveBeenCalled();
  });

  it('returns an "expired or invalid" error when the token is rejected', async () => {
    mockConsumeResetToken.mockResolvedValueOnce(false);
    const out = await resetPasswordAction(resetForm());
    expect(out.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('errors out if the user no longer exists after token validation', async () => {
    mockConsumeResetToken.mockResolvedValueOnce(true);
    mockFindUnique.mockResolvedValueOnce(null);
    const out = await resetPasswordAction(resetForm());
    expect(out.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('errors out for OAuth-only accounts (no passwordHash to replace)', async () => {
    mockConsumeResetToken.mockResolvedValueOnce(true);
    mockFindUnique.mockResolvedValueOnce({ email: 'user@example.com', passwordHash: null });
    const out = await resetPasswordAction(resetForm());
    expect(out.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('returns a generic error when the DB update itself fails', async () => {
    mockConsumeResetToken.mockResolvedValueOnce(true);
    mockFindUnique.mockResolvedValueOnce({ email: 'user@example.com', passwordHash: 'h' });
    mockUserUpdate.mockRejectedValueOnce(new Error('db boom'));
    const out = await resetPasswordAction(resetForm());
    expect(out.status).toBe('error');
  });

  it('rejects a payload missing the token', async () => {
    const out = await resetPasswordAction(resetForm({ token: '' }));
    expect(out.status).toBe('error');
    expect(mockConsumeResetToken).not.toHaveBeenCalled();
  });
});
