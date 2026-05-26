import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  env: {
    NODE_ENV: 'test' as string,
    RESEND_API_KEY: 're_test_key' as string | undefined,
    RESEND_FROM: 'noreply@sportvisa.io' as string | undefined,
  },
}));

vi.mock('@/lib/env', () => mockEnv);
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockEmailSend = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mockEmailSend } };
  }),
}));

import { submitContact } from '@/lib/contact/actions';

function makeFormData(overrides: Partial<Record<'name' | 'email' | 'message', string>> = {}) {
  const fd = new FormData();
  fd.append('name', overrides.name ?? 'გიორგი მამულაშვილი');
  fd.append('email', overrides.email ?? 'test@example.com');
  fd.append('message', overrides.message ?? 'გამარჯობა, მაქვს კითხვა პლატფორმის შესახებ.');
  return fd;
}

const PREV = { status: 'idle' as const };

describe('submitContact — validation', () => {
  it('returns validation error for name shorter than 2 chars', async () => {
    const result = await submitContact(PREV, makeFormData({ name: 'ა' }));
    expect(result.status).toBe('validation');
    if (result.status === 'validation') {
      expect(result.errors.name).toBeDefined();
    }
  });

  it('returns validation error for invalid email', async () => {
    const result = await submitContact(PREV, makeFormData({ email: 'not-an-email' }));
    expect(result.status).toBe('validation');
    if (result.status === 'validation') {
      expect(result.errors.email).toBeDefined();
    }
  });

  it('returns validation error for message shorter than 10 chars', async () => {
    const result = await submitContact(PREV, makeFormData({ message: 'hi' }));
    expect(result.status).toBe('validation');
    if (result.status === 'validation') {
      expect(result.errors.message).toBeDefined();
    }
  });

  it('returns validation error for message longer than 2000 chars', async () => {
    const result = await submitContact(PREV, makeFormData({ message: 'ა'.repeat(2001) }));
    expect(result.status).toBe('validation');
  });

  it('does not call Resend when validation fails', async () => {
    mockEmailSend.mockReset();
    await submitContact(PREV, makeFormData({ name: 'ა' }));
    expect(mockEmailSend).not.toHaveBeenCalled();
  });
});

describe('submitContact — email unconfigured', () => {
  beforeEach(() => {
    mockEmailSend.mockReset();
    mockEnv.env.RESEND_API_KEY = undefined;
    mockEnv.env.RESEND_FROM = undefined;
  });

  afterEach(() => {
    mockEnv.env.RESEND_API_KEY = 're_test_key';
    mockEnv.env.RESEND_FROM = 'noreply@sportvisa.io';
  });

  it('returns success without calling Resend when API key missing', async () => {
    const result = await submitContact(PREV, makeFormData());
    expect(result.status).toBe('success');
    expect(mockEmailSend).not.toHaveBeenCalled();
  });
});

describe('submitContact — email configured', () => {
  beforeEach(() => {
    mockEmailSend.mockReset();
    mockEnv.env.RESEND_API_KEY = 're_test_key';
    mockEnv.env.RESEND_FROM = 'noreply@sportvisa.io';
  });

  it('calls Resend with correct to address', async () => {
    mockEmailSend.mockResolvedValueOnce({});
    await submitContact(PREV, makeFormData());
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'noreply@sportvisa.io' }),
    );
  });

  it('uses sender email as replyTo', async () => {
    mockEmailSend.mockResolvedValueOnce({});
    await submitContact(PREV, makeFormData({ email: 'player@example.com' }));
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: 'player@example.com' }),
    );
  });

  it('includes sender name in subject', async () => {
    mockEmailSend.mockResolvedValueOnce({});
    await submitContact(PREV, makeFormData({ name: 'გიორგი' }));
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: '[Sport Visa] Contact: გიორგი' }),
    );
  });

  it('returns success after successful send', async () => {
    mockEmailSend.mockResolvedValueOnce({});
    const result = await submitContact(PREV, makeFormData());
    expect(result.status).toBe('success');
  });

  it('returns error status when Resend throws', async () => {
    mockEmailSend.mockRejectedValueOnce(new Error('network error'));
    const result = await submitContact(PREV, makeFormData());
    expect(result.status).toBe('error');
  });

  it('error message is in Georgian', async () => {
    mockEmailSend.mockRejectedValueOnce(new Error('network error'));
    const result = await submitContact(PREV, makeFormData());
    if (result.status === 'error') {
      expect(result.message).toContain('გაგზავნა ვერ მოხერხდა');
    }
  });
});
