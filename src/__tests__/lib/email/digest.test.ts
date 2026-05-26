import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    RESEND_API_KEY: 're_test_key',
    RESEND_FROM: 'noreply@sportvisa.io',
    NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io',
  },
}));

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockEmailSend = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mockEmailSend } };
  }),
}));

import { ApiError } from '@/lib/api-error';
import { sendDigestEmail } from '@/lib/resend';
import {
  digestEmailHtml,
  digestEmailText,
  type DigestEmailProps,
} from '@/lib/email/templates/digest';

const APP_URL = 'https://app.sportvisa.io';

const SAMPLE_PROPS: DigestEmailProps = {
  recipientName: 'Giorgi',
  posts: [
    { clubName: 'FC Dinamo', postTitle: 'New Season Starts' },
    { clubName: 'FC Rubin', postTitle: 'Transfer Update' },
  ],
  appUrl: APP_URL,
};

// ── digestEmailHtml ───────────────────────────────────────────────────────────

describe('digestEmailHtml', () => {
  it('includes the recipient name', () => {
    const html = digestEmailHtml(SAMPLE_PROPS);
    expect(html).toContain('Giorgi');
  });

  it('includes each club name', () => {
    const html = digestEmailHtml(SAMPLE_PROPS);
    expect(html).toContain('FC Dinamo');
    expect(html).toContain('FC Rubin');
  });

  it('includes each post title', () => {
    const html = digestEmailHtml(SAMPLE_PROPS);
    expect(html).toContain('New Season Starts');
    expect(html).toContain('Transfer Update');
  });

  it('includes a link to the newsfeed', () => {
    const html = digestEmailHtml(SAMPLE_PROPS);
    expect(html).toContain(`${APP_URL}/dashboard/footballer`);
  });

  it('includes a manage-notifications link', () => {
    const html = digestEmailHtml(SAMPLE_PROPS);
    expect(html).toContain(`${APP_URL}/settings/notifications`);
  });

  it('escapes HTML in club name and post title', () => {
    const html = digestEmailHtml({
      ...SAMPLE_PROPS,
      posts: [{ clubName: '<script>alert(1)</script>', postTitle: '"xss"' }],
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

// ── digestEmailText ───────────────────────────────────────────────────────────

describe('digestEmailText', () => {
  it('includes the recipient name', () => {
    const text = digestEmailText(SAMPLE_PROPS);
    expect(text).toContain('Giorgi');
  });

  it('includes each club and post title', () => {
    const text = digestEmailText(SAMPLE_PROPS);
    expect(text).toContain('FC Dinamo');
    expect(text).toContain('New Season Starts');
    expect(text).toContain('FC Rubin');
    expect(text).toContain('Transfer Update');
  });

  it('includes a link to the newsfeed', () => {
    const text = digestEmailText(SAMPLE_PROPS);
    expect(text).toContain(`${APP_URL}/dashboard/footballer`);
  });
});

// ── sendDigestEmail ───────────────────────────────────────────────────────────

describe('sendDigestEmail', () => {
  it('returns email id on success', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'dg-1' }, error: null });
    const result = await sendDigestEmail('player@example.com', SAMPLE_PROPS);
    expect(result).toEqual({ id: 'dg-1' });
  });

  it('subject mentions post count', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'dg-2' }, error: null });
    await sendDigestEmail('player@example.com', SAMPLE_PROPS);
    const call = mockEmailSend.mock.calls.at(-1)?.[0] as { subject: string } | undefined;
    expect(call?.subject).toMatch(/2/);
  });

  it('uses singular "post" for count of 1', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: { id: 'dg-3' }, error: null });
    await sendDigestEmail('player@example.com', {
      ...SAMPLE_PROPS,
      posts: [{ clubName: 'FC X', postTitle: 'Title' }],
    });
    const call = mockEmailSend.mock.calls.at(-1)?.[0] as { subject: string } | undefined;
    expect(call?.subject).toMatch(/1 new post\b/);
  });

  it('throws ApiError on Resend failure', async () => {
    mockEmailSend.mockResolvedValueOnce({ data: null, error: { message: 'bad' } });
    await expect(sendDigestEmail('x@b.com', SAMPLE_PROPS)).rejects.toBeInstanceOf(ApiError);
  });
});
