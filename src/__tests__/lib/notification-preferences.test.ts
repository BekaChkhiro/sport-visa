import { describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockUpsert = vi.hoisted(() => vi.fn());
const mockFindUnique = vi.hoisted(() => vi.fn());
vi.mock('@/lib/db', () => ({
  db: {
    notificationPreference: {
      upsert: mockUpsert,
      findUnique: mockFindUnique,
    },
  },
}));

import {
  getEmailDigestEnabled,
  getOrCreatePreferences,
  updatePreferences,
} from '@/lib/notification-preferences';

const BASE_PREF = {
  id: 'pref-1',
  userId: 'user-abc',
  emailInstant: true,
  emailDigest: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('getOrCreatePreferences', () => {
  it('upserts with empty update when row exists', async () => {
    mockUpsert.mockResolvedValueOnce(BASE_PREF);
    const result = await getOrCreatePreferences('user-abc');
    expect(result).toEqual(BASE_PREF);
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { userId: 'user-abc' },
      create: { userId: 'user-abc' },
      update: {},
    });
  });
});

describe('updatePreferences', () => {
  it('passes the patch data to upsert', async () => {
    mockUpsert.mockResolvedValueOnce({ ...BASE_PREF, emailDigest: false });
    const result = await updatePreferences('user-abc', { emailDigest: false });
    expect(result.emailDigest).toBe(false);
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { userId: 'user-abc' },
      create: { userId: 'user-abc', emailDigest: false },
      update: { emailDigest: false },
    });
  });

  it('supports partial updates (emailInstant only)', async () => {
    mockUpsert.mockResolvedValueOnce({ ...BASE_PREF, emailInstant: false });
    await updatePreferences('user-abc', { emailInstant: false });
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { emailInstant: false } }),
    );
  });
});

describe('getEmailDigestEnabled', () => {
  it('returns true when no preference row exists', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    expect(await getEmailDigestEnabled('user-abc')).toBe(true);
  });

  it('returns the stored value when row exists', async () => {
    mockFindUnique.mockResolvedValueOnce({ emailDigest: false });
    expect(await getEmailDigestEnabled('user-abc')).toBe(false);
  });

  it('queries by userId with emailDigest select', async () => {
    mockFindUnique.mockResolvedValueOnce({ emailDigest: true });
    await getEmailDigestEnabled('user-abc');
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { userId: 'user-abc' },
      select: { emailDigest: true },
    });
  });
});
