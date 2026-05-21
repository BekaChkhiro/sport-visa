import { beforeEach, describe, expect, it } from 'vitest';

import {
  __resetRateLimitForTests,
  clearLoginAttempts,
  recordLoginAttempt,
} from '@/lib/auth/rate-limit';

beforeEach(() => {
  __resetRateLimitForTests();
});

describe('recordLoginAttempt', () => {
  it('allows the first attempt', () => {
    expect(recordLoginAttempt('1.1.1.1', 'a@b.co').allowed).toBe(true);
  });

  it('blocks after 5 attempts on the same email', () => {
    // 5 attempts spread across 5 distinct IPs to isolate the email bucket.
    for (let i = 0; i < 5; i++) {
      expect(recordLoginAttempt(`10.0.0.${i}`, 'a@b.co').allowed).toBe(true);
    }
    expect(recordLoginAttempt('10.0.0.99', 'a@b.co').allowed).toBe(false);
  });

  it('blocks after 20 attempts from the same IP across emails', () => {
    for (let i = 0; i < 20; i++) {
      // Different emails so per-email cap doesn't fire first.
      expect(recordLoginAttempt('5.5.5.5', `user-${i}@b.co`).allowed).toBe(true);
    }
    expect(recordLoginAttempt('5.5.5.5', 'twentyfirst@b.co').allowed).toBe(false);
  });

  it('clearLoginAttempts resets only the email bucket', () => {
    for (let i = 0; i < 5; i++) {
      recordLoginAttempt(`10.0.0.${i}`, 'a@b.co');
    }
    expect(recordLoginAttempt('10.0.0.5', 'a@b.co').allowed).toBe(false);
    clearLoginAttempts('a@b.co');
    expect(recordLoginAttempt('10.0.0.5', 'a@b.co').allowed).toBe(true);
  });

  it('normalises email casing when bucketing', () => {
    for (let i = 0; i < 5; i++) {
      recordLoginAttempt(`10.0.0.${i}`, 'a@b.co');
    }
    expect(recordLoginAttempt('10.0.0.6', 'A@B.CO').allowed).toBe(false);
  });

  it('blocks the very next attempt after a sustained burst (T3.7 acceptance)', () => {
    // Simulate a brute-force scraper hammering the same email from one IP.
    let lastAllowed = true;
    for (let i = 0; i < 5; i++) {
      lastAllowed = recordLoginAttempt('203.0.113.7', 'burst@example.com').allowed;
    }
    expect(lastAllowed).toBe(true);

    // The 6th-and-beyond must all be denied — fail fast, not eventually.
    const after = Array.from(
      { length: 50 },
      () => recordLoginAttempt('203.0.113.7', 'burst@example.com').allowed,
    );
    expect(after.every((a) => a === false)).toBe(true);
  });

  it('isolates per-email buckets: blocking A does not block B', () => {
    for (let i = 0; i < 5; i++) {
      recordLoginAttempt(`172.20.${i}.1`, 'victim@example.com');
    }
    // Different email from a fresh IP is unaffected — limit is per-bucket,
    // not global.
    expect(recordLoginAttempt('172.20.99.1', 'bystander@example.com').allowed).toBe(true);
  });
});
