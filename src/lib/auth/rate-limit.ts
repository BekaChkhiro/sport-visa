// Lightweight in-memory rate limiter for auth endpoints.
//
// Acceptance criterion T3.2: "Brute force is blocked after N attempts."
// We track failed-login attempts by both IP and email and apply whichever
// limit trips first. A successful login clears the email bucket so a
// legitimate user isn't punished for fat-fingering their password once.
//
// In-memory is fine for MVP (single Railway instance). When we move to
// multi-region we'll swap this for Upstash Redis behind the same interface.

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_PER_IP = 20;
const MAX_PER_EMAIL = 5;

type Bucket = { count: number; resetAt: number };

const ipBuckets = new Map<string, Bucket>();
const emailBuckets = new Map<string, Bucket>();

function hit(map: Map<string, Bucket>, key: string, limit: number): boolean {
  const now = Date.now();
  const existing = map.get(key);
  if (!existing || existing.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= limit) {
    return false;
  }
  existing.count += 1;
  return true;
}

export function recordLoginAttempt(ip: string, email: string): { allowed: boolean } {
  const ipAllowed = hit(ipBuckets, ip, MAX_PER_IP);
  const emailAllowed = hit(emailBuckets, email.toLowerCase(), MAX_PER_EMAIL);
  return { allowed: ipAllowed && emailAllowed };
}

export function clearLoginAttempts(email: string): void {
  emailBuckets.delete(email.toLowerCase());
}

// Test helper — never call from app code.
export function __resetRateLimitForTests(): void {
  ipBuckets.clear();
  emailBuckets.clear();
}
