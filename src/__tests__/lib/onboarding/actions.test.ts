import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({ env: { NODE_ENV: 'test' } }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

const mockFpFindUnique = vi.hoisted(() => vi.fn());
const mockFpCreate = vi.hoisted(() => vi.fn());
const mockCpFindUnique = vi.hoisted(() => vi.fn());
const mockCpCreate = vi.hoisted(() => vi.fn());
const mockUserFindUnique = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    footballerProfile: { findUnique: mockFpFindUnique, create: mockFpCreate },
    clubProfile: { findUnique: mockCpFindUnique, create: mockCpCreate },
    user: { findUnique: mockUserFindUnique },
  },
}));

vi.mock('@prisma/client', () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, opts: { code: string; clientVersion: string }) {
      super(message);
      this.name = 'PrismaClientKnownRequestError';
      this.code = opts.code;
    }
  }
  return { Prisma: { PrismaClientKnownRequestError } };
});

import { Prisma } from '@prisma/client';

import { saveClubProfile, saveFootballerProfile } from '@/lib/onboarding/actions';

beforeEach(() => {
  mockAuth.mockReset();
  mockFpFindUnique.mockReset();
  mockFpCreate.mockReset();
  mockCpFindUnique.mockReset();
  mockCpCreate.mockReset();
  mockUserFindUnique.mockReset();
});

const baseFootballer = {
  dateOfBirth: '2000-01-15',
  nationality: 'GE',
  city: 'Tbilisi',
  country: 'GE',
  positions: ['CM'],
  dominantFoot: 'RIGHT',
  height: 180,
  weight: 75,
};

describe('saveFootballerProfile — auth & role guards', () => {
  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const out = await saveFootballerProfile(baseFootballer);
    expect(out.status).toBe('error');
    expect(mockFpCreate).not.toHaveBeenCalled();
  });

  it('rejects CLUB users trying to save a footballer profile (role mismatch)', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'CLUB' } });
    const out = await saveFootballerProfile(baseFootballer);
    expect(out.status).toBe('error');
    expect(mockFpCreate).not.toHaveBeenCalled();
  });
});

describe('saveFootballerProfile — happy path & idempotency', () => {
  it('creates the profile using firstName/lastName from the User row', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    mockFpFindUnique.mockResolvedValueOnce(null);
    mockUserFindUnique.mockResolvedValueOnce({ firstName: 'Beka', lastName: 'Chkhiro' });
    mockFpCreate.mockResolvedValueOnce({ id: 'fp1' });

    const out = await saveFootballerProfile(baseFootballer);

    expect(out).toEqual({ status: 'success' });
    expect(mockFpCreate).toHaveBeenCalledTimes(1);
    const data = mockFpCreate.mock.calls[0]![0].data;
    expect(data).toMatchObject({
      userId: 'u1',
      firstName: 'Beka',
      lastName: 'Chkhiro',
      nationality: 'GE',
      city: 'Tbilisi',
      country: 'GE',
      positions: ['CM'],
      dominantFoot: 'RIGHT',
      height: 180,
      weight: 75,
    });
    expect(data.dateOfBirth).toBeInstanceOf(Date);
  });

  it('is idempotent — returns success and skips create when a profile already exists', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    mockFpFindUnique.mockResolvedValueOnce({ id: 'existing' });

    const out = await saveFootballerProfile(baseFootballer);

    expect(out).toEqual({ status: 'success' });
    expect(mockFpCreate).not.toHaveBeenCalled();
  });

  it('reports a DB failure as a generic error', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    mockFpFindUnique.mockResolvedValueOnce(null);
    mockUserFindUnique.mockResolvedValueOnce({ firstName: 'X', lastName: 'Y' });
    mockFpCreate.mockRejectedValueOnce(new Error('db down'));

    const out = await saveFootballerProfile(baseFootballer);
    expect(out.status).toBe('error');
  });

  it('treats a P2002 unique-constraint error as idempotent success (concurrent create race)', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    mockFpFindUnique.mockResolvedValueOnce(null);
    mockUserFindUnique.mockResolvedValueOnce({ firstName: 'X', lastName: 'Y' });
    mockFpCreate.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
      }),
    );

    const out = await saveFootballerProfile(baseFootballer);
    expect(out).toEqual({ status: 'success' });
  });
});

describe('saveFootballerProfile — validation', () => {
  it('returns field errors for missing required step-1 fields', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    const out = await saveFootballerProfile({ ...baseFootballer, city: '' });
    expect(out.status).toBe('error');
    if (out.status === 'error') {
      expect(out.fieldErrors?.city).toBeTruthy();
    }
    expect(mockFpCreate).not.toHaveBeenCalled();
  });

  it('rejects a height outside the [100, 250] bound', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    const out = await saveFootballerProfile({ ...baseFootballer, height: 50 });
    expect(out.status).toBe('error');
    if (out.status === 'error') {
      expect(out.fieldErrors?.height).toBeTruthy();
    }
  });

  it('rejects more than 2 positions', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    const out = await saveFootballerProfile({
      ...baseFootballer,
      positions: ['CM', 'AM', 'CF'],
    });
    expect(out.status).toBe('error');
    if (out.status === 'error') {
      expect(out.fieldErrors?.positions).toBeTruthy();
    }
  });

  it('rejects a future dateOfBirth', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    const out = await saveFootballerProfile({ ...baseFootballer, dateOfBirth: '2040-06-01' });
    expect(out.status).toBe('error');
    if (out.status === 'error') {
      expect(out.fieldErrors?.dateOfBirth).toBeTruthy();
    }
    expect(mockFpCreate).not.toHaveBeenCalled();
  });

  it('rejects a non-date string for dateOfBirth', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    const out = await saveFootballerProfile({ ...baseFootballer, dateOfBirth: 'not-a-date' });
    expect(out.status).toBe('error');
    if (out.status === 'error') {
      expect(out.fieldErrors?.dateOfBirth).toBeTruthy();
    }
    expect(mockFpCreate).not.toHaveBeenCalled();
  });

  it('rejects a nationality that is not a 2-letter ISO code', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    const out = await saveFootballerProfile({ ...baseFootballer, nationality: 'GEO' });
    expect(out.status).toBe('error');
    if (out.status === 'error') {
      expect(out.fieldErrors?.nationality).toBeTruthy();
    }
    expect(mockFpCreate).not.toHaveBeenCalled();
  });

  it('rejects a country that is not a 2-letter ISO code', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    const out = await saveFootballerProfile({ ...baseFootballer, country: 'GEO' });
    expect(out.status).toBe('error');
    if (out.status === 'error') {
      expect(out.fieldErrors?.country).toBeTruthy();
    }
    expect(mockFpCreate).not.toHaveBeenCalled();
  });
});

const baseClub = {
  name: 'FC Test',
  city: 'Tbilisi',
  country: 'GE',
};

describe('saveClubProfile — auth & role guards', () => {
  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const out = await saveClubProfile(baseClub);
    expect(out.status).toBe('error');
    expect(mockCpCreate).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users trying to save a club profile (role mismatch)', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', role: 'FOOTBALLER' } });
    const out = await saveClubProfile(baseClub);
    expect(out.status).toBe('error');
    expect(mockCpCreate).not.toHaveBeenCalled();
  });
});

describe('saveClubProfile — happy path & idempotency', () => {
  it('creates the club profile with normalized optional fields', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u2', role: 'CLUB' } });
    mockCpFindUnique.mockResolvedValueOnce(null);
    mockCpCreate.mockResolvedValueOnce({ id: 'cp1' });

    const out = await saveClubProfile({
      ...baseClub,
      foundedYear: 1990,
      stadiumName: 'Boris Paichadze',
      stadiumCapacity: 54000,
    });

    expect(out).toEqual({ status: 'success' });
    expect(mockCpCreate).toHaveBeenCalledTimes(1);
    const data = mockCpCreate.mock.calls[0]![0].data;
    expect(data).toMatchObject({
      userId: 'u2',
      name: 'FC Test',
      foundedYear: 1990,
      stadiumName: 'Boris Paichadze',
      stadiumCapacity: 54000,
      country: 'GE',
      city: 'Tbilisi',
    });
  });

  it('is idempotent — returns success and skips create when a profile already exists', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u2', role: 'CLUB' } });
    mockCpFindUnique.mockResolvedValueOnce({ id: 'existing' });

    const out = await saveClubProfile(baseClub);

    expect(out).toEqual({ status: 'success' });
    expect(mockCpCreate).not.toHaveBeenCalled();
  });

  it('rejects missing club name (the only required field)', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u2', role: 'CLUB' } });
    const out = await saveClubProfile({ ...baseClub, name: '' });
    expect(out.status).toBe('error');
    if (out.status === 'error') {
      expect(out.fieldErrors?.name).toBeTruthy();
    }
  });

  it('reports a DB failure as a generic error', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u2', role: 'CLUB' } });
    mockCpFindUnique.mockResolvedValueOnce(null);
    mockCpCreate.mockRejectedValueOnce(new Error('db down'));

    const out = await saveClubProfile(baseClub);
    expect(out.status).toBe('error');
  });

  it('treats a P2002 unique-constraint error as idempotent success (concurrent create race)', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u2', role: 'CLUB' } });
    mockCpFindUnique.mockResolvedValueOnce(null);
    mockCpCreate.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
      }),
    );

    const out = await saveClubProfile(baseClub);
    expect(out).toEqual({ status: 'success' });
  });

  it('rejects an officialWebsite that is not a valid URL', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u2', role: 'CLUB' } });
    const out = await saveClubProfile({ ...baseClub, officialWebsite: 'not-a-url' });
    expect(out.status).toBe('error');
    if (out.status === 'error') {
      expect(out.fieldErrors?.officialWebsite).toBeTruthy();
    }
    expect(mockCpCreate).not.toHaveBeenCalled();
  });

  it('accepts a valid https officialWebsite URL', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u2', role: 'CLUB' } });
    mockCpFindUnique.mockResolvedValueOnce(null);
    mockCpCreate.mockResolvedValueOnce({ id: 'cp2' });

    const out = await saveClubProfile({ ...baseClub, officialWebsite: 'https://fcdinamo.ge' });
    expect(out).toEqual({ status: 'success' });
    expect(mockCpCreate).toHaveBeenCalledTimes(1);
  });
});
