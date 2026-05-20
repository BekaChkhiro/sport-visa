import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io',
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
const mockSendNotification = vi.hoisted(() => vi.fn());

vi.mock('@/lib/resend', () => ({
  sendWelcomeEmail: mockSendWelcome,
  sendApplicationStatusEmail: mockSendApplicationStatus,
  sendNotificationEmail: mockSendNotification,
}));

import { POST } from '@/app/api/email/send/route';

function makeReq(body: unknown) {
  return new Request('http://localhost/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/email/send', () => {
  it('sends a welcome email and returns the id', async () => {
    mockSendWelcome.mockResolvedValueOnce({ id: 'email-w1' });
    const res = await POST(makeReq({ type: 'welcome', to: 'alice@example.com', name: 'Alice' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'email-w1' });
  });

  it('sends an application_status email and returns the id', async () => {
    mockSendApplicationStatus.mockResolvedValueOnce({ id: 'email-a1' });
    const res = await POST(
      makeReq({
        type: 'application_status',
        to: 'carlos@example.com',
        playerName: 'Carlos',
        clubName: 'FC Test',
        status: 'accepted',
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'email-a1' });
  });

  it('sends a notification email and returns the id', async () => {
    mockSendNotification.mockResolvedValueOnce({ id: 'email-n1' });
    const res = await POST(
      makeReq({
        type: 'notification',
        to: 'dana@example.com',
        recipientName: 'Dana',
        subject: 'New match',
        bodyHtml: '<p>You have a match!</p>',
        bodyText: 'You have a match!',
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'email-n1' });
  });

  it('returns 422 for an unrecognised email type', async () => {
    const res = await POST(makeReq({ type: 'newsletter', to: 'x@example.com' }));
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe('VALIDATION');
  });

  it('returns 422 when required fields are missing from welcome', async () => {
    const res = await POST(makeReq({ type: 'welcome', to: 'x@example.com' }));
    expect(res.status).toBe(422);
  });

  it('returns 422 for an invalid email address', async () => {
    const res = await POST(makeReq({ type: 'welcome', to: 'not-an-email', name: 'X' }));
    expect(res.status).toBe(422);
  });

  it('returns 400 for a non-JSON body', async () => {
    const req = new Request('http://localhost/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when the email service throws', async () => {
    mockSendWelcome.mockRejectedValueOnce(new Error('Resend down'));
    const res = await POST(makeReq({ type: 'welcome', to: 'a@b.com', name: 'A' }));
    expect(res.status).toBe(500);
  });
});
