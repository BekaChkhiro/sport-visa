import { describe, expect, it } from 'vitest';

import { roleDashboardPath } from '@/lib/auth/roles';

describe('roleDashboardPath', () => {
  it('routes ADMIN to /admin', () => {
    expect(roleDashboardPath('ADMIN')).toBe('/admin');
  });

  it('routes CLUB to /dashboard/club', () => {
    expect(roleDashboardPath('CLUB')).toBe('/dashboard/club');
  });

  it('routes FOOTBALLER to /dashboard/footballer', () => {
    expect(roleDashboardPath('FOOTBALLER')).toBe('/dashboard/footballer');
  });

  it('falls back to the footballer dashboard for any unknown role string', () => {
    // Defensive default — a malformed JWT must still land somewhere safe.
    expect(roleDashboardPath('')).toBe('/dashboard/footballer');
    expect(roleDashboardPath('GHOST')).toBe('/dashboard/footballer');
  });
});
