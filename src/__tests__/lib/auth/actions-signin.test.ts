import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test', NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io' },
}));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock('@/lib/db', () => ({ db: { user: { create: vi.fn() } } }));
vi.mock('@/lib/auth/password', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));
vi.mock('@/lib/auth/tokens', () => ({
  createEmailVerificationToken: vi.fn(),
}));
vi.mock('@/lib/resend', () => ({ sendVerifyEmailEmail: vi.fn() }));

// Reuse the same FakeAuthError so the action's `instanceof AuthError`
// branch fires. Declared via vi.hoisted because vi.mock factories themselves
// hoist above top-level statements.
const FakeAuthError = vi.hoisted(
  () =>
    class extends Error {
      type = 'CredentialsSignin';
    },
);
vi.mock('next-auth', () => ({ AuthError: FakeAuthError }));

const mockSignIn = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/index', () => ({ signIn: mockSignIn, signOut: mockSignOut }));

import { signinAction, signOutAction } from '@/lib/auth/actions';

function buildForm(overrides: Partial<{ email: string; password: string }> = {}): FormData {
  const fd = new FormData();
  const merged = { email: 'a@b.co', password: 'sport-visa-1', ...overrides };
  if (merged.email !== undefined) fd.set('email', merged.email);
  if (merged.password !== undefined) fd.set('password', merged.password);
  return fd;
}

beforeEach(() => {
  mockSignIn.mockReset();
  mockSignOut.mockReset();
});

describe('signinAction', () => {
  it('returns success when credentials sign-in resolves', async () => {
    mockSignIn.mockResolvedValueOnce({});
    const result = await signinAction({ status: 'idle' }, buildForm());
    expect(result).toEqual({ status: 'success' });
    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'a@b.co',
      password: 'sport-visa-1',
      redirect: false,
    });
  });

  it('returns the generic error message on missing email', async () => {
    const result = await signinAction({ status: 'idle' }, buildForm({ email: '' }));
    expect(result.status).toBe('error');
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('returns the generic error message on missing password', async () => {
    const result = await signinAction({ status: 'idle' }, buildForm({ password: '' }));
    expect(result.status).toBe('error');
  });

  it('collapses an AuthError to the SAME message regardless of cause (enumeration safety)', async () => {
    mockSignIn.mockRejectedValueOnce(new FakeAuthError('CredentialsSignin'));
    const wrongPw = await signinAction({ status: 'idle' }, buildForm());

    mockSignIn.mockRejectedValueOnce(new FakeAuthError('Verification'));
    const unknownEmail = await signinAction(
      { status: 'idle' },
      buildForm({ email: 'noone@example.com' }),
    );

    expect(wrongPw.status).toBe('error');
    expect(unknownEmail.status).toBe('error');
    if (wrongPw.status === 'error' && unknownEmail.status === 'error') {
      // The whole point: an attacker probing for valid accounts gets one
      // message, not two distinguishable ones.
      expect(wrongPw.message).toBe(unknownEmail.message);
    }
  });

  it('rethrows non-AuthError exceptions (server bug, not user error)', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('boom'));
    await expect(signinAction({ status: 'idle' }, buildForm())).rejects.toThrow('boom');
  });
});

describe('signOutAction', () => {
  it('signs out and redirects to landing', async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    await signOutAction();
    expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: '/' });
  });
});
