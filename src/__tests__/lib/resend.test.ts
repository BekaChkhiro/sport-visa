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
import { sendApplicationStatusEmail, sendNotificationEmail, sendWelcomeEmail } from '@/lib/resend';

const APP_URL = 'https://app.sportvisa.io';

describe('sendWelcomeEmail', () => {
  it('returns the email id on success', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'email-001' }, error: null });
    expect(
      await sendWelcomeEmail('player@example.com', { name: 'Alice', appUrl: APP_URL }),
    ).toEqual({ id: 'email-001' });
  });

  it('sends with subject "Welcome to Sport Visa"', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'email-002' }, error: null });
    await sendWelcomeEmail('player@example.com', { name: 'Bob', appUrl: APP_URL });
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Welcome to Sport Visa', to: 'player@example.com' }),
    );
  });

  it('throws ApiError when Resend returns an error', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: null, error: { message: 'rate limited' } });
    await expect(
      sendWelcomeEmail('a@b.com', { name: 'X', appUrl: APP_URL }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('sendApplicationStatusEmail', () => {
  const BASE = { playerName: 'Carlos', clubName: 'FC Test', appUrl: APP_URL };

  it('returns the email id on success', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'email-003' }, error: null });
    expect(
      await sendApplicationStatusEmail('carlos@example.com', { ...BASE, status: 'accepted' }),
    ).toEqual({ id: 'email-003' });
  });

  it.each([
    ['accepted', 'Accepted'],
    ['shortlisted', 'Shortlisted'],
  ])('subject contains "%s" label for status=%s', async (status, label) => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'email-x' }, error: null });
    await sendApplicationStatusEmail('a@b.com', {
      ...BASE,
      status: status as 'accepted' | 'shortlisted',
    });
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining(label) }),
    );
  });

  it('throws ApiError on Resend failure', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });
    await expect(
      sendApplicationStatusEmail('a@b.com', { ...BASE, status: 'rejected' }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('sendNotificationEmail', () => {
  it('returns the email id on success', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'email-006' }, error: null });
    expect(
      await sendNotificationEmail('user@example.com', {
        recipientName: 'Dana',
        subject: 'You have a message',
        bodyHtml: '<p>Hello</p>',
        bodyText: 'Hello',
        appUrl: APP_URL,
      }),
    ).toEqual({ id: 'email-006' });
  });

  it('uses the provided subject directly', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'email-007' }, error: null });
    await sendNotificationEmail('user@example.com', {
      recipientName: 'Eve',
      subject: 'Trial ending soon',
      bodyHtml: '<p>Heads up</p>',
      bodyText: 'Heads up',
      appUrl: APP_URL,
    });
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Trial ending soon' }),
    );
  });

  it('throws ApiError on Resend failure', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });
    await expect(
      sendNotificationEmail('a@b.com', {
        recipientName: 'X',
        subject: 'Sub',
        bodyHtml: '<p>x</p>',
        bodyText: 'x',
        appUrl: APP_URL,
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
