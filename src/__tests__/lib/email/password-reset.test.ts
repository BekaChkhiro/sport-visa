import { describe, expect, it } from 'vitest';

import {
  passwordResetEmailHtml,
  passwordResetEmailText,
} from '@/lib/email/templates/password-reset';

const BASE = {
  recipientName: 'Alice',
  resetUrl: 'https://app.sportvisa.io/auth/reset?token=abc123',
  expiresInHours: 24,
  appUrl: 'https://app.sportvisa.io',
};

describe('passwordResetEmailHtml', () => {
  it('includes the recipient name', () => {
    expect(passwordResetEmailHtml(BASE)).toContain('Hi Alice');
  });

  it('includes the reset URL as an href', () => {
    expect(passwordResetEmailHtml(BASE)).toContain(BASE.resetUrl);
  });

  it('includes the expiry duration', () => {
    expect(passwordResetEmailHtml(BASE)).toContain('24 hours');
  });

  it('uses singular "hour" when expiresInHours is 1', () => {
    expect(passwordResetEmailHtml({ ...BASE, expiresInHours: 1 })).toContain('1 hour');
    expect(passwordResetEmailHtml({ ...BASE, expiresInHours: 1 })).not.toContain('1 hours');
  });

  it('escapes HTML in recipientName', () => {
    const html = passwordResetEmailHtml({ ...BASE, recipientName: '<script>xss</script>' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes HTML in resetUrl', () => {
    const html = passwordResetEmailHtml({ ...BASE, resetUrl: 'https://x.com?a=1&b=2' });
    expect(html).toContain('&amp;');
  });
});

describe('passwordResetEmailText', () => {
  it('includes the recipient name', () => {
    expect(passwordResetEmailText(BASE)).toContain('Alice');
  });

  it('includes the reset URL', () => {
    expect(passwordResetEmailText(BASE)).toContain(BASE.resetUrl);
  });

  it('includes the expiry', () => {
    expect(passwordResetEmailText(BASE)).toContain('24 hours');
  });

  it('includes the app URL', () => {
    expect(passwordResetEmailText(BASE)).toContain(BASE.appUrl);
  });
});
