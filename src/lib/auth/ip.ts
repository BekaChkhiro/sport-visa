import { headers } from 'next/headers';

// Returns the caller's IP address from standard proxy headers.
// For use in Server Actions where the raw request object is unavailable.
export async function getCallerIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
}
