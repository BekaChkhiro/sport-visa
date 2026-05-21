import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    RESEND_API_KEY: 're_test_key',
    RESEND_FROM: 'noreply@sportvisa.io',
    NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io',
  },
}));

vi.mock('next/server', () => ({ NextResponse: { json: vi.fn() } }));
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

const mockEmailSend = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mockEmailSend } };
  }),
}));

import { ApiError } from '@/lib/api-error';
import {
  sendAccountVerificationEmail,
  sendPasswordResetEmail,
  sendServiceRequestEmail,
} from '@/lib/resend';

const APP_URL = 'https://app.sportvisa.io';

describe('sendPasswordResetEmail', () => {
  it('returns email id on success', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'pr-1' }, error: null });
    const result = await sendPasswordResetEmail('user@example.com', {
      recipientName: 'Alice',
      resetUrl: 'https://app.sportvisa.io/auth/reset?token=abc',
      expiresInHours: 24,
      appUrl: APP_URL,
    });
    expect(result).toEqual({ id: 'pr-1' });
  });

  it('sends with a subject containing "password"', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'pr-2' }, error: null });
    await sendPasswordResetEmail('user@example.com', {
      recipientName: 'Alice',
      resetUrl: 'https://x.com',
      expiresInHours: 1,
      appUrl: APP_URL,
    });
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringMatching(/password/i) }),
    );
  });

  it('throws ApiError on Resend failure', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });
    await expect(
      sendPasswordResetEmail('x@b.com', {
        recipientName: 'X',
        resetUrl: 'https://x.com',
        expiresInHours: 1,
        appUrl: APP_URL,
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('sendAccountVerificationEmail', () => {
  it('sends approval email with "approved" in subject', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'av-1' }, error: null });
    await sendAccountVerificationEmail('user@example.com', {
      recipientName: 'Bob',
      status: 'approved',
      appUrl: APP_URL,
    });
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringMatching(/approved/i) }),
    );
  });

  it('sends rejection email without "approved" in subject', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'av-2' }, error: null });
    await sendAccountVerificationEmail('user@example.com', {
      recipientName: 'Bob',
      status: 'rejected',
      appUrl: APP_URL,
    });
    const lastCall = mockEmailSend.mock.calls.at(-1);
    const callArg = lastCall?.[0] as { subject: string } | undefined;
    expect(callArg?.subject).not.toMatch(/approved/i);
  });

  it('returns email id on success', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'av-3' }, error: null });
    const result = await sendAccountVerificationEmail('user@example.com', {
      recipientName: 'Bob',
      status: 'approved',
      appUrl: APP_URL,
    });
    expect(result).toEqual({ id: 'av-3' });
  });

  it('throws ApiError on failure', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });
    await expect(
      sendAccountVerificationEmail('x@b.com', {
        recipientName: 'X',
        status: 'approved',
        appUrl: APP_URL,
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('sendServiceRequestEmail', () => {
  it('returns email id on success', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'sr-1' }, error: null });
    const result = await sendServiceRequestEmail('player@example.com', {
      footballerName: 'Carlos',
      serviceType: 'კვება',
      requestId: 'SR-001',
      action: 'submitted',
      appUrl: APP_URL,
    });
    expect(result).toEqual({ id: 'sr-1' });
  });

  it('submitted: subject contains service type', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'sr-2' }, error: null });
    await sendServiceRequestEmail('player@example.com', {
      footballerName: 'Carlos',
      serviceType: 'Training',
      requestId: 'SR-002',
      action: 'submitted',
      appUrl: APP_URL,
    });
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining('Training') }),
    );
  });

  it('resolved: subject contains "resolved"', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'sr-3' }, error: null });
    await sendServiceRequestEmail('player@example.com', {
      footballerName: 'Carlos',
      serviceType: 'Training',
      requestId: 'SR-003',
      action: 'resolved',
      appUrl: APP_URL,
    });
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining('resolved') }),
    );
  });

  it('throws ApiError on failure', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });
    await expect(
      sendServiceRequestEmail('x@b.com', {
        footballerName: 'X',
        serviceType: 'Y',
        requestId: 'Z',
        action: 'submitted',
        appUrl: APP_URL,
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
