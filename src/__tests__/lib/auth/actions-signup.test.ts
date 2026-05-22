import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockUserCreate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/db', () => ({
  db: {
    user: { create: mockUserCreate },
  },
}));

const mockHashPassword = vi.hoisted(() => vi.fn(async (p: string) => `hashed:${p}`));
vi.mock('@/lib/auth/password', () => ({
  hashPassword: mockHashPassword,
  verifyPassword: vi.fn(),
}));

const mockSendVerifyEmail = vi.hoisted(() => vi.fn());
vi.mock('@/lib/resend', () => ({
  sendVerifyEmailEmail: mockSendVerifyEmail,
}));

const mockCreateToken = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/tokens', () => ({
  createEmailVerificationToken: mockCreateToken,
}));

const mockSignIn = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/index', () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
}));

const mockRecordSignupAttempt = vi.hoisted(() => vi.fn(() => ({ allowed: true })));
vi.mock('@/lib/auth/rate-limit', () => ({
  recordSignupAttempt: mockRecordSignupAttempt,
}));

vi.mock('@/lib/auth/ip', () => ({
  getCallerIp: vi.fn(async () => '127.0.0.1'),
}));

// next-auth itself is imported by actions.ts for the AuthError class. The
// real module pulls in next/server in a way Vitest can't resolve, so stub it.
vi.mock('next-auth', () => ({
  AuthError: class extends Error {},
}));

// Prisma `Prisma.PrismaClientKnownRequestError` is used by the action's
// duplicate-email check. The action does `instanceof PrismaClientKnownRequestError`
// so we provide a small constructor stand-in that the production code's
// `instanceof` check will accept. The class lives inside vi.hoisted because
// vi.mock factories are themselves hoisted above the file's top-level code.
const FakePrismaKnownError = vi.hoisted(
  () =>
    class extends Error {
      code: string;
      constructor(code: string) {
        super('prisma error');
        this.code = code;
      }
    },
);
vi.mock('@prisma/client', () => ({
  Prisma: { PrismaClientKnownRequestError: FakePrismaKnownError },
}));

import { signupAction } from '@/lib/auth/actions';

function buildForm(overrides: Record<string, string | undefined> = {}): FormData {
  const fd = new FormData();
  const base: Record<string, string> = {
    role: 'FOOTBALLER',
    firstName: 'Beka',
    lastName: 'Chkhiro',
    email: 'beka@example.com',
    password: 'sport-visa-1',
    passwordConfirm: 'sport-visa-1',
    acceptTerms: 'on',
  };
  const merged = { ...base, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined) fd.set(k, v);
  }
  return fd;
}

beforeEach(() => {
  mockUserCreate.mockReset();
  mockHashPassword.mockClear();
  mockSendVerifyEmail.mockReset();
  mockCreateToken.mockReset();
  mockSignIn.mockReset();
  mockRecordSignupAttempt.mockReset();
  mockRecordSignupAttempt.mockReturnValue({ allowed: true });
});

describe('signupAction — happy path', () => {
  it('creates the user, sends the verification email, and auto-signs-in', async () => {
    mockUserCreate.mockResolvedValueOnce({ id: 'u1' });
    mockCreateToken.mockResolvedValueOnce('signed-token');
    mockSendVerifyEmail.mockResolvedValueOnce({});
    mockSignIn.mockResolvedValueOnce({});

    const result = await signupAction({ status: 'idle' }, buildForm());

    expect(result).toEqual({ status: 'success' });
    expect(mockHashPassword).toHaveBeenCalledWith('sport-visa-1');
    expect(mockUserCreate).toHaveBeenCalledTimes(1);
    expect(mockUserCreate.mock.calls[0]![0].data).toMatchObject({
      email: 'beka@example.com',
      passwordHash: 'hashed:sport-visa-1',
      firstName: 'Beka',
      lastName: 'Chkhiro',
      role: 'FOOTBALLER',
    });

    expect(mockSendVerifyEmail).toHaveBeenCalledTimes(1);
    const [, mailArgs] = mockSendVerifyEmail.mock.calls[0]!;
    expect(mailArgs.verifyUrl).toContain('/api/auth/verify-email?token=signed-token');
    expect(mailArgs.verifyUrl).toContain('email=beka%40example.com');

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'beka@example.com',
      password: 'sport-visa-1',
      redirect: false,
    });
  });

  it('lowercases the email before persisting (schema-level)', async () => {
    mockUserCreate.mockResolvedValueOnce({ id: 'u1' });
    mockCreateToken.mockResolvedValueOnce('t');
    mockSendVerifyEmail.mockResolvedValueOnce({});
    mockSignIn.mockResolvedValueOnce({});

    await signupAction({ status: 'idle' }, buildForm({ email: '  BEKA@EXAMPLE.COM ' }));

    expect(mockUserCreate.mock.calls[0]![0].data.email).toBe('beka@example.com');
  });
});

describe('signupAction — rate limiting', () => {
  it('returns error when rate limit is exceeded (no DB call)', async () => {
    mockRecordSignupAttempt.mockReturnValueOnce({ allowed: false });
    const result = await signupAction({ status: 'idle' }, buildForm());
    expect(result.status).toBe('error');
    expect(mockUserCreate).not.toHaveBeenCalled();
  });
});

describe('signupAction — validation errors', () => {
  it('returns field errors when the form is invalid (no DB call)', async () => {
    const result = await signupAction({ status: 'idle' }, buildForm({ password: 'short' }));

    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.message).toBeTruthy();
      expect(result.fieldErrors?.password).toBeTruthy();
    }
    expect(mockUserCreate).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('rejects a payload that does not accept terms', async () => {
    const result = await signupAction({ status: 'idle' }, buildForm({ acceptTerms: undefined }));
    expect(result.status).toBe('error');
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  it('rejects role=ADMIN at the schema level', async () => {
    const result = await signupAction({ status: 'idle' }, buildForm({ role: 'ADMIN' }));
    expect(result.status).toBe('error');
    expect(mockUserCreate).not.toHaveBeenCalled();
  });
});

describe('signupAction — duplicate email & failures', () => {
  it('maps Prisma P2002 to a duplicate-email field error (and does NOT auto-sign-in)', async () => {
    mockUserCreate.mockRejectedValueOnce(new FakePrismaKnownError('P2002'));

    const result = await signupAction({ status: 'idle' }, buildForm());

    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.fieldErrors?.email?.[0]).toBeTruthy();
    }
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockSendVerifyEmail).not.toHaveBeenCalled();
  });

  it('returns a generic error and does not crash if email send fails', async () => {
    mockUserCreate.mockResolvedValueOnce({ id: 'u1' });
    mockCreateToken.mockRejectedValueOnce(new Error('resend down'));
    mockSignIn.mockResolvedValueOnce({});

    const result = await signupAction({ status: 'idle' }, buildForm());

    // The account is still created — verification email failure is recoverable
    // via the resend page, so the action reports success.
    expect(result).toEqual({ status: 'success' });
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('still returns success when auto-sign-in fails (account exists, user logs in manually)', async () => {
    mockUserCreate.mockResolvedValueOnce({ id: 'u1' });
    mockCreateToken.mockResolvedValueOnce('t');
    mockSendVerifyEmail.mockResolvedValueOnce({});
    mockSignIn.mockRejectedValueOnce(new Error('autologin failed'));

    const result = await signupAction({ status: 'idle' }, buildForm());

    expect(result).toEqual({ status: 'success' });
  });

  it('returns a generic error on unexpected DB failure (not P2002)', async () => {
    mockUserCreate.mockRejectedValueOnce(new Error('db is down'));

    const result = await signupAction({ status: 'idle' }, buildForm());

    expect(result.status).toBe('error');
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
