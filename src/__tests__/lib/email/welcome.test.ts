import { describe, expect, it } from 'vitest';

import { welcomeEmailHtml, welcomeEmailText } from '@/lib/email/templates/welcome';

describe('welcomeEmailHtml', () => {
  it('includes the greeting with the user name', () => {
    const html = welcomeEmailHtml({ name: 'Alice', appUrl: 'https://app.sportvisa.io' });
    expect(html).toContain('Hi Alice');
  });

  it('includes the onboarding link', () => {
    const html = welcomeEmailHtml({ name: 'Bob', appUrl: 'https://app.sportvisa.io' });
    expect(html).toContain('https://app.sportvisa.io/onboarding');
  });

  it('escapes HTML characters in name', () => {
    const html = welcomeEmailHtml({
      name: '<script>alert(1)</script>',
      appUrl: 'https://app.sportvisa.io',
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes HTML characters in appUrl', () => {
    const html = welcomeEmailHtml({
      name: 'Alice',
      appUrl: 'https://example.com?a=1&b=2',
    });
    expect(html).toContain('&amp;');
    expect(html).not.toContain('"https://example.com?a=1&b=2"');
  });
});

describe('welcomeEmailText', () => {
  it('includes the user name', () => {
    const text = welcomeEmailText({ name: 'Alice', appUrl: 'https://app.sportvisa.io' });
    expect(text).toContain('Alice');
  });

  it('includes the onboarding URL', () => {
    const text = welcomeEmailText({ name: 'Alice', appUrl: 'https://app.sportvisa.io' });
    expect(text).toContain('https://app.sportvisa.io/onboarding');
  });
});
