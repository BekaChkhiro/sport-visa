import { describe, expect, it } from 'vitest';

import {
  accountVerificationEmailHtml,
  accountVerificationEmailText,
} from '@/lib/email/templates/account-verification';

const BASE = {
  recipientName: 'Carlos',
  appUrl: 'https://app.sportvisa.io',
};

describe('accountVerificationEmailHtml — approved', () => {
  const props = { ...BASE, status: 'approved' as const };

  it('includes the recipient name', () => {
    expect(accountVerificationEmailHtml(props)).toContain('Hi Carlos');
  });

  it('includes the Approved status label', () => {
    expect(accountVerificationEmailHtml(props)).toContain('Approved');
  });

  it('includes a link to the dashboard', () => {
    expect(accountVerificationEmailHtml(props)).toContain('/dashboard');
  });

  it('does not include the profile edit link', () => {
    expect(accountVerificationEmailHtml(props)).not.toContain('/profile/edit');
  });
});

describe('accountVerificationEmailHtml — rejected', () => {
  it('includes the Not approved status label', () => {
    expect(accountVerificationEmailHtml({ ...BASE, status: 'rejected' })).toContain('Not approved');
  });

  it('includes the rejection reason when provided', () => {
    const html = accountVerificationEmailHtml({
      ...BASE,
      status: 'rejected',
      rejectionReason: 'Missing profile photo',
    });
    expect(html).toContain('Missing profile photo');
  });

  it('omits the blockquote when no reason provided', () => {
    const html = accountVerificationEmailHtml({ ...BASE, status: 'rejected' });
    expect(html).not.toContain('blockquote');
  });

  it('includes a link to the profile edit page', () => {
    expect(accountVerificationEmailHtml({ ...BASE, status: 'rejected' })).toContain(
      '/profile/edit',
    );
  });

  it('escapes HTML in rejectionReason', () => {
    const html = accountVerificationEmailHtml({
      ...BASE,
      status: 'rejected',
      rejectionReason: '<b>bad</b>',
    });
    expect(html).not.toContain('<b>bad</b>');
    expect(html).toContain('&lt;b&gt;bad&lt;/b&gt;');
  });
});

describe('accountVerificationEmailText', () => {
  it('approved: contains dashboard URL', () => {
    const text = accountVerificationEmailText({ ...BASE, status: 'approved' });
    expect(text).toContain(`${BASE.appUrl}/dashboard`);
  });

  it('rejected: contains profile edit URL', () => {
    const text = accountVerificationEmailText({ ...BASE, status: 'rejected' });
    expect(text).toContain(`${BASE.appUrl}/profile/edit`);
  });

  it('rejected with reason: includes the reason', () => {
    const text = accountVerificationEmailText({
      ...BASE,
      status: 'rejected',
      rejectionReason: 'No photo',
    });
    expect(text).toContain('No photo');
  });
});
