import { beforeEach, describe, expect, it } from 'vitest';

import {
  __resetRateLimitForTests,
  clearLoginAttempts,
  recordLoginAttempt,
  recordSignupAttempt,
  recordPasswordResetAttempt,
  recordResendVerificationAttempt,
  recordVerifyEmailAttempt,
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

describe('recordSignupAttempt', () => {
  it('allows the first 5 attempts from the same IP', () => {
    for (let i = 0; i < 5; i++) {
      expect(recordSignupAttempt('2.2.2.2').allowed).toBe(true);
    }
  });

  it('blocks the 6th attempt from the same IP', () => {
    for (let i = 0; i < 5; i++) {
      recordSignupAttempt('3.3.3.3');
    }
    expect(recordSignupAttempt('3.3.3.3').allowed).toBe(false);
  });

  it('isolates buckets by IP: one IP blocked does not affect another', () => {
    for (let i = 0; i < 5; i++) {
      recordSignupAttempt('4.4.4.4');
    }
    expect(recordSignupAttempt('5.5.5.5').allowed).toBe(true);
  });
});

describe('recordPasswordResetAttempt', () => {
  it('allows the first 3 attempts per email', () => {
    for (let i = 0; i < 3; i++) {
      expect(recordPasswordResetAttempt(`10.0.${i}.1`, 'reset@example.com').allowed).toBe(true);
    }
  });

  it('blocks the 4th attempt per email', () => {
    for (let i = 0; i < 3; i++) {
      recordPasswordResetAttempt(`10.0.${i}.1`, 'blocked@example.com');
    }
    expect(recordPasswordResetAttempt('10.0.99.1', 'blocked@example.com').allowed).toBe(false);
  });

  it('blocks after 10 attempts from the same IP across emails', () => {
    for (let i = 0; i < 10; i++) {
      expect(recordPasswordResetAttempt('6.6.6.6', `user-${i}@example.com`).allowed).toBe(true);
    }
    expect(recordPasswordResetAttempt('6.6.6.6', 'eleventh@example.com').allowed).toBe(false);
  });

  it('normalises email casing', () => {
    for (let i = 0; i < 3; i++) {
      recordPasswordResetAttempt(`10.1.${i}.1`, 'Case@Example.COM');
    }
    expect(recordPasswordResetAttempt('10.1.99.1', 'case@example.com').allowed).toBe(false);
  });
});

describe('recordResendVerificationAttempt', () => {
  it('allows the first 3 attempts per email', () => {
    for (let i = 0; i < 3; i++) {
      expect(recordResendVerificationAttempt('verify@example.com').allowed).toBe(true);
    }
  });

  it('blocks the 4th attempt per email within the hour', () => {
    for (let i = 0; i < 3; i++) {
      recordResendVerificationAttempt('toomany@example.com');
    }
    expect(recordResendVerificationAttempt('toomany@example.com').allowed).toBe(false);
  });

  it('isolates by email: one email blocked does not affect another', () => {
    for (let i = 0; i < 3; i++) {
      recordResendVerificationAttempt('spammer@example.com');
    }
    expect(recordResendVerificationAttempt('clean@example.com').allowed).toBe(true);
  });
});

describe('recordVerifyEmailAttempt', () => {
  it('allows 30 attempts from the same IP', () => {
    for (let i = 0; i < 30; i++) {
      expect(recordVerifyEmailAttempt('7.7.7.7').allowed).toBe(true);
    }
  });

  it('blocks the 31st attempt from the same IP', () => {
    for (let i = 0; i < 30; i++) {
      recordVerifyEmailAttempt('8.8.8.8');
    }
    expect(recordVerifyEmailAttempt('8.8.8.8').allowed).toBe(false);
  });

  it('isolates by IP', () => {
    for (let i = 0; i < 30; i++) {
      recordVerifyEmailAttempt('9.9.9.9');
    }
    expect(recordVerifyEmailAttempt('1.2.3.4').allowed).toBe(true);
  });
});
