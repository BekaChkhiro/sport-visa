// Lightweight in-memory rate limiter for auth endpoints.
//
// Acceptance criterion T3.2: "Brute force is blocked after N attempts."
// We track failed-login attempts by both IP and email and apply whichever
// limit trips first. A successful login clears the email bucket so a
// legitimate user isn't punished for fat-fingering their password once.
//
// T3.9: Extended to cover signup, password-reset, resend-verify, and
// verify-email endpoints.
//
// In-memory is fine for MVP (single Railway instance). When we move to
// multi-region we'll swap this for Upstash Redis behind the same interface.

const WINDOW_15M = 15 * 60 * 1000;
const WINDOW_1H = 60 * 60 * 1000;

// Login
const MAX_LOGIN_PER_IP = 20;
const MAX_LOGIN_PER_EMAIL = 5;

// Signup: max 5 new accounts per IP per 15 min
const MAX_SIGNUP_PER_IP = 5;

// Password-reset request: max 3 per email and 10 per IP per 15 min
const MAX_RESET_PER_EMAIL = 3;
const MAX_RESET_PER_IP = 10;

// Resend verification email: max 3 per email per hour
const MAX_RESEND_VERIFY_PER_EMAIL = 3;

// Verify-email link follow: max 30 per IP per 15 min (token-based, lenient)
const MAX_VERIFY_EMAIL_PER_IP = 30;

type Bucket = { count: number; resetAt: number };

// Login buckets
const loginIpBuckets = new Map<string, Bucket>();
const loginEmailBuckets = new Map<string, Bucket>();

// Signup buckets
const signupIpBuckets = new Map<string, Bucket>();

// Password-reset buckets
const resetIpBuckets = new Map<string, Bucket>();
const resetEmailBuckets = new Map<string, Bucket>();

// Resend-verification buckets
const resendVerifyEmailBuckets = new Map<string, Bucket>();

// Verify-email route buckets
const verifyEmailIpBuckets = new Map<string, Bucket>();

function hit(map: Map<string, Bucket>, key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = map.get(key);
  if (!existing || existing.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) {
    return false;
  }
  existing.count += 1;
  return true;
}

export function recordLoginAttempt(ip: string, email: string): { allowed: boolean } {
  const ipAllowed = hit(loginIpBuckets, ip, MAX_LOGIN_PER_IP, WINDOW_15M);
  const emailAllowed = hit(loginEmailBuckets, email.toLowerCase(), MAX_LOGIN_PER_EMAIL, WINDOW_15M);
  return { allowed: ipAllowed && emailAllowed };
}

export function clearLoginAttempts(email: string): void {
  loginEmailBuckets.delete(email.toLowerCase());
}

export function recordSignupAttempt(ip: string): { allowed: boolean } {
  return { allowed: hit(signupIpBuckets, ip, MAX_SIGNUP_PER_IP, WINDOW_15M) };
}

export function recordPasswordResetAttempt(ip: string, email: string): { allowed: boolean } {
  const ipAllowed = hit(resetIpBuckets, ip, MAX_RESET_PER_IP, WINDOW_15M);
  const emailAllowed = hit(resetEmailBuckets, email.toLowerCase(), MAX_RESET_PER_EMAIL, WINDOW_15M);
  return { allowed: ipAllowed && emailAllowed };
}

export function recordResendVerificationAttempt(email: string): { allowed: boolean } {
  return {
    allowed: hit(
      resendVerifyEmailBuckets,
      email.toLowerCase(),
      MAX_RESEND_VERIFY_PER_EMAIL,
      WINDOW_1H,
    ),
  };
}

export function recordVerifyEmailAttempt(ip: string): { allowed: boolean } {
  return { allowed: hit(verifyEmailIpBuckets, ip, MAX_VERIFY_EMAIL_PER_IP, WINDOW_15M) };
}

// Test helper — never call from app code.
export function __resetRateLimitForTests(): void {
  loginIpBuckets.clear();
  loginEmailBuckets.clear();
  signupIpBuckets.clear();
  resetIpBuckets.clear();
  resetEmailBuckets.clear();
  resendVerifyEmailBuckets.clear();
  verifyEmailIpBuckets.clear();
}
