import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test', NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io' },
}));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

import { ApiError } from '@/lib/api-error';
import { requireAdmin, requireAuthenticatedUser } from '@/lib/auth/require-user';

describe('requireAuthenticatedUser', () => {
  it('returns the session user when authenticated', async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: 'u1',
        email: 'a@b.com',
        role: 'FOOTBALLER',
        emailVerified: new Date('2026-01-01'),
      },
    });
    const user = await requireAuthenticatedUser();
    expect(user).toMatchObject({
      id: 'u1',
      email: 'a@b.com',
      role: 'FOOTBALLER',
    });
  });

  it('throws UNAUTHORIZED when there is no session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(requireAuthenticatedUser()).rejects.toMatchObject({
      name: 'ApiError',
      code: 'UNAUTHORIZED',
      status: 401,
    });
  });

  it('throws UNAUTHORIZED when the session has no user id', async () => {
    mockAuth.mockResolvedValueOnce({ user: {} });
    await expect(requireAuthenticatedUser()).rejects.toBeInstanceOf(ApiError);
  });
});

describe('requireAdmin', () => {
  it('returns the user when role is ADMIN', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'a1', email: 'admin@x.com', role: 'ADMIN', emailVerified: null },
    });
    const user = await requireAdmin();
    expect(user.role).toBe('ADMIN');
  });

  it('throws FORBIDDEN for a non-admin session', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'u1', email: 'u@x.com', role: 'FOOTBALLER', emailVerified: null },
    });
    await expect(requireAdmin()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: 403,
    });
  });

  it('throws UNAUTHORIZED when there is no session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(requireAdmin()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
