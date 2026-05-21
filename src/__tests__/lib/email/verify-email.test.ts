import { describe, expect, it } from 'vitest';

import { verifyEmailHtml, verifyEmailText } from '@/lib/email/templates/verify-email';

const BASE = {
  recipientName: 'Ana',
  verifyUrl: 'https://app.sportvisa.io/api/auth/verify-email?token=abc123&email=ana%40test.ge',
  expiresInHours: 24,
  appUrl: 'https://app.sportvisa.io',
};

describe('verifyEmailHtml', () => {
  it('includes the recipient name', () => {
    expect(verifyEmailHtml(BASE)).toContain('Hi Ana');
  });

  it('includes a verify button pointing to the verify URL', () => {
    // The & separator in query strings is HTML-escaped to &amp; in the email body.
    const escaped = BASE.verifyUrl.replace(/&/g, '&amp;');
    expect(verifyEmailHtml(BASE)).toContain(escaped);
  });

  it('mentions the expiry hours', () => {
    expect(verifyEmailHtml(BASE)).toContain('24 hours');
  });

  it('uses "hour" (singular) for 1-hour expiry', () => {
    const html = verifyEmailHtml({ ...BASE, expiresInHours: 1 });
    expect(html).toContain('1 hour');
    expect(html).not.toContain('1 hours');
  });

  it('escapes HTML in recipientName', () => {
    const html = verifyEmailHtml({ ...BASE, recipientName: '<script>xss</script>' });
    expect(html).not.toContain('<script>xss</script>');
    expect(html).toContain('&lt;script&gt;xss&lt;/script&gt;');
  });

  it('includes a link to the app', () => {
    expect(verifyEmailHtml(BASE)).toContain(BASE.appUrl);
  });
});

describe('verifyEmailText', () => {
  it('includes the recipient name', () => {
    expect(verifyEmailText(BASE)).toContain('Hi Ana');
  });

  it('includes the verify URL', () => {
    expect(verifyEmailText(BASE)).toContain(BASE.verifyUrl);
  });

  it('includes the expiry hours', () => {
    expect(verifyEmailText(BASE)).toContain('24 hours');
  });

  it('includes the app URL', () => {
    expect(verifyEmailText(BASE)).toContain(BASE.appUrl);
  });
});
