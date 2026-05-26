import { afterEach, describe, expect, it } from 'vitest';

const ORIGINAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  if (ORIGINAL_APP_URL === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = ORIGINAL_APP_URL;
  }
});

import robots from '@/app/robots';

type RobotsRule = {
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

function getFirstRule(): RobotsRule {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
  const rule = rules[0];
  if (!rule) throw new Error('No rules returned from robots()');
  return rule as RobotsRule;
}

function getDisallowed(rule: RobotsRule): string[] {
  if (!rule.disallow) return [];
  return Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
}

function getAllowed(rule: RobotsRule): string[] {
  if (!rule.allow) return [];
  return Array.isArray(rule.allow) ? rule.allow : [rule.allow];
}

describe('robots', () => {
  it('returns a rules array', () => {
    const result = robots();
    expect(Array.isArray(result.rules)).toBe(true);
  });

  it('has a single rule entry covering all user agents', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules).toHaveLength(1);
    expect((rules[0] as RobotsRule).userAgent).toBe('*');
  });

  it('allows the root path', () => {
    expect(getAllowed(getFirstRule())).toContain('/');
  });

  it('disallows /admin/', () => {
    expect(getDisallowed(getFirstRule())).toContain('/admin/');
  });

  it('disallows /api/', () => {
    expect(getDisallowed(getFirstRule())).toContain('/api/');
  });

  it('disallows /dashboard/', () => {
    expect(getDisallowed(getFirstRule())).toContain('/dashboard/');
  });

  it('disallows /profile/', () => {
    expect(getDisallowed(getFirstRule())).toContain('/profile/');
  });

  it('uses NEXT_PUBLIC_APP_URL env var for sitemap URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.sportvisa.io';
    const result = robots();
    expect(result.sitemap).toBe('https://app.sportvisa.io/sitemap.xml');
  });

  it('falls back to localhost:3000 when env var is not set', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const result = robots();
    expect(result.sitemap).toBe('http://localhost:3000/sitemap.xml');
  });

  it('sitemap URL ends with /sitemap.xml', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://sportvisa.ge';
    const result = robots();
    expect(String(result.sitemap)).toMatch(/\/sitemap\.xml$/);
  });
});
