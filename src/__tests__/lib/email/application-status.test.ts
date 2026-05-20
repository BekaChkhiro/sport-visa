import { describe, expect, it } from 'vitest';

import {
  applicationStatusEmailHtml,
  applicationStatusEmailText,
} from '@/lib/email/templates/application-status';

const BASE = {
  playerName: 'Carlos',
  clubName: 'FC Example',
  appUrl: 'https://app.sportvisa.io',
};

describe('applicationStatusEmailHtml', () => {
  it('includes the player name', () => {
    const html = applicationStatusEmailHtml({ ...BASE, status: 'accepted' });
    expect(html).toContain('Hi Carlos');
  });

  it('includes the club name', () => {
    const html = applicationStatusEmailHtml({ ...BASE, status: 'accepted' });
    expect(html).toContain('FC Example');
  });

  it('shows the correct status label for accepted', () => {
    const html = applicationStatusEmailHtml({ ...BASE, status: 'accepted' });
    expect(html).toContain('Accepted');
  });

  it('shows the correct status label for rejected', () => {
    const html = applicationStatusEmailHtml({ ...BASE, status: 'rejected' });
    expect(html).toContain('Not progressed');
  });

  it('shows the correct status label for shortlisted', () => {
    const html = applicationStatusEmailHtml({ ...BASE, status: 'shortlisted' });
    expect(html).toContain('Shortlisted');
  });

  it('renders the optional message block when provided', () => {
    const html = applicationStatusEmailHtml({
      ...BASE,
      status: 'accepted',
      message: 'Great talent!',
    });
    expect(html).toContain('Great talent!');
  });

  it('omits the message block when not provided', () => {
    const html = applicationStatusEmailHtml({ ...BASE, status: 'accepted' });
    expect(html).not.toContain('blockquote');
  });

  it('escapes HTML in player name', () => {
    const html = applicationStatusEmailHtml({
      ...BASE,
      playerName: '<b>inject</b>',
      status: 'accepted',
    });
    expect(html).not.toContain('<b>inject</b>');
    expect(html).toContain('&lt;b&gt;inject&lt;/b&gt;');
  });
});

describe('applicationStatusEmailText', () => {
  it('includes the player name', () => {
    const text = applicationStatusEmailText({ ...BASE, status: 'shortlisted' });
    expect(text).toContain('Carlos');
  });

  it('includes the applications URL', () => {
    const text = applicationStatusEmailText({ ...BASE, status: 'accepted' });
    expect(text).toContain('https://app.sportvisa.io/applications');
  });

  it('includes the status label', () => {
    const text = applicationStatusEmailText({ ...BASE, status: 'rejected' });
    expect(text).toContain('Not progressed');
  });

  it('includes optional message when provided', () => {
    const text = applicationStatusEmailText({
      ...BASE,
      status: 'accepted',
      message: 'Well done',
    });
    expect(text).toContain('Well done');
  });
});
