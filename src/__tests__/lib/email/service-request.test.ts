import { describe, expect, it } from 'vitest';

import {
  serviceRequestEmailHtml,
  serviceRequestEmailText,
} from '@/lib/email/templates/service-request';

const BASE = {
  footballerName: 'David',
  serviceType: 'კვება',
  requestId: 'SR-2026-0042',
  appUrl: 'https://app.sportvisa.io',
};

describe('serviceRequestEmailHtml — submitted', () => {
  const props = { ...BASE, action: 'submitted' as const };

  it('includes the footballer name', () => {
    expect(serviceRequestEmailHtml(props)).toContain('Hi David');
  });

  it('includes the service type', () => {
    expect(serviceRequestEmailHtml(props)).toContain('კვება');
  });

  it('includes the request ID', () => {
    expect(serviceRequestEmailHtml(props)).toContain('SR-2026-0042');
  });

  it('includes the "Request received" label', () => {
    expect(serviceRequestEmailHtml(props)).toContain('Request received');
  });

  it('includes a link to the dashboard', () => {
    expect(serviceRequestEmailHtml(props)).toContain('/dashboard');
  });
});

describe('serviceRequestEmailHtml — resolved', () => {
  const props = { ...BASE, action: 'resolved' as const };

  it('includes the "Request resolved" label', () => {
    expect(serviceRequestEmailHtml(props)).toContain('Request resolved');
  });

  it('includes the service type and request ID', () => {
    const html = serviceRequestEmailHtml(props);
    expect(html).toContain('კვება');
    expect(html).toContain('SR-2026-0042');
  });

  it('escapes HTML in serviceType', () => {
    const html = serviceRequestEmailHtml({
      ...props,
      serviceType: '<img src=x onerror=alert(1)>',
    });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });
});

describe('serviceRequestEmailText', () => {
  it('submitted: mentions 24–48 hours', () => {
    const text = serviceRequestEmailText({ ...BASE, action: 'submitted' });
    expect(text).toContain('24–48');
  });

  it('submitted: includes request ID', () => {
    const text = serviceRequestEmailText({ ...BASE, action: 'submitted' });
    expect(text).toContain('SR-2026-0042');
  });

  it('resolved: does not mention 24–48 hours', () => {
    const text = serviceRequestEmailText({ ...BASE, action: 'resolved' });
    expect(text).not.toContain('24–48');
  });

  it('resolved: includes dashboard URL', () => {
    const text = serviceRequestEmailText({ ...BASE, action: 'resolved' });
    expect(text).toContain(`${BASE.appUrl}/dashboard`);
  });
});
