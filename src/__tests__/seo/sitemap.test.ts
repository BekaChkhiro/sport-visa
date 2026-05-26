import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    clubProfile: {
      findMany: mockFindMany,
    },
  },
}));

import sitemap from '@/app/sitemap';

const BASE_URL = 'https://app.sportvisa.io';
const ORIGINAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = BASE_URL;
  mockFindMany.mockResolvedValue([]);
});

afterEach(() => {
  if (ORIGINAL_APP_URL === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = ORIGINAL_APP_URL;
  }
  mockFindMany.mockReset();
});

describe('sitemap — static routes', () => {
  it('includes the root URL', async () => {
    const result = await sitemap();
    expect(result.some((r) => r.url === BASE_URL)).toBe(true);
  });

  it('root URL has priority 1', async () => {
    const result = await sitemap();
    const root = result.find((r) => r.url === BASE_URL);
    expect(root?.priority).toBe(1);
  });

  it('root URL has weekly change frequency', async () => {
    const result = await sitemap();
    const root = result.find((r) => r.url === BASE_URL);
    expect(root?.changeFrequency).toBe('weekly');
  });

  it('includes /clubs directory URL', async () => {
    const result = await sitemap();
    expect(result.some((r) => r.url === `${BASE_URL}/clubs`)).toBe(true);
  });

  it('/clubs has priority 0.8', async () => {
    const result = await sitemap();
    const clubs = result.find((r) => r.url === `${BASE_URL}/clubs`);
    expect(clubs?.priority).toBe(0.8);
  });

  it('includes /auth/signin', async () => {
    const result = await sitemap();
    expect(result.some((r) => r.url === `${BASE_URL}/auth/signin`)).toBe(true);
  });

  it('includes /auth/signup', async () => {
    const result = await sitemap();
    expect(result.some((r) => r.url === `${BASE_URL}/auth/signup`)).toBe(true);
  });

  it('returns exactly 4 static routes when DB is empty', async () => {
    const result = await sitemap();
    expect(result).toHaveLength(4);
  });
});

describe('sitemap — club routes from database', () => {
  it('includes club detail URLs from DB', async () => {
    mockFindMany.mockResolvedValue([
      { id: 'club-1', updatedAt: new Date('2024-01-01') },
      { id: 'club-2', updatedAt: new Date('2024-02-01') },
    ]);
    const result = await sitemap();
    expect(result.some((r) => r.url === `${BASE_URL}/clubs/club-1`)).toBe(true);
    expect(result.some((r) => r.url === `${BASE_URL}/clubs/club-2`)).toBe(true);
  });

  it('club routes have priority 0.7', async () => {
    mockFindMany.mockResolvedValue([{ id: 'club-abc', updatedAt: new Date('2024-03-01') }]);
    const result = await sitemap();
    const clubRoute = result.find((r) => r.url === `${BASE_URL}/clubs/club-abc`);
    expect(clubRoute?.priority).toBe(0.7);
  });

  it('club routes have weekly change frequency', async () => {
    mockFindMany.mockResolvedValue([{ id: 'club-xyz', updatedAt: new Date('2024-04-01') }]);
    const result = await sitemap();
    const clubRoute = result.find((r) => r.url === `${BASE_URL}/clubs/club-xyz`);
    expect(clubRoute?.changeFrequency).toBe('weekly');
  });

  it('queries only verified clubs', async () => {
    mockFindMany.mockResolvedValue([]);
    await sitemap();
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { verificationStatus: 'VERIFIED' },
      }),
    );
  });

  it('total route count equals 4 static + number of clubs', async () => {
    mockFindMany.mockResolvedValue([
      { id: 'c1', updatedAt: new Date() },
      { id: 'c2', updatedAt: new Date() },
      { id: 'c3', updatedAt: new Date() },
    ]);
    const result = await sitemap();
    expect(result).toHaveLength(7);
  });
});

describe('sitemap — database failure', () => {
  it('returns only static routes when DB throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB unavailable'));
    const result = await sitemap();
    expect(result).toHaveLength(4);
  });

  it('static routes are intact after DB failure', async () => {
    mockFindMany.mockRejectedValue(new Error('DB unavailable'));
    const result = await sitemap();
    expect(result.some((r) => r.url === BASE_URL)).toBe(true);
    expect(result.some((r) => r.url === `${BASE_URL}/clubs`)).toBe(true);
  });
});

describe('sitemap — env fallback', () => {
  it('falls back to localhost:3000 when env var not set', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const result = await sitemap();
    expect(result.some((r) => r.url.startsWith('http://localhost:3000'))).toBe(true);
  });
});
