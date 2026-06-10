import { beforeEach, describe, expect, it, vi } from 'vitest';

// Must mock @/lib/env and its dependents before any module that imports them
// (@/lib/r2 → @/lib/api-error → @/lib/logger → @/lib/env). Without this the
// env validation throws because DATABASE_URL is undefined in the test env.
vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
  childLogger: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() })),
}));
vi.mock('@/lib/r2', () => ({
  deleteObject: vi.fn().mockResolvedValue(undefined),
  uploadObject: vi.fn().mockResolvedValue(undefined),
  getSignedUploadUrl: vi.fn().mockResolvedValue('https://r2.example.com/signed'),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

const mockFpUpdate = vi.hoisted(() => vi.fn());
const mockFpFindUnique = vi.hoisted(() => vi.fn());
const mockCeCreate = vi.hoisted(() => vi.fn());
const mockCeFindUnique = vi.hoisted(() => vi.fn());
const mockCeUpdate = vi.hoisted(() => vi.fn());
const mockCeDelete = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    footballerProfile: {
      update: mockFpUpdate,
      findUnique: mockFpFindUnique,
    },
    careerEntry: {
      create: mockCeCreate,
      findUnique: mockCeFindUnique,
      update: mockCeUpdate,
      delete: mockCeDelete,
    },
  },
}));

import {
  updatePersonalInfo,
  updateSportInfo,
  addCareerEntry,
  updateCareerEntry,
  deleteCareerEntry,
  updateAgentInfo,
} from '@/lib/profile/actions';

const footballerSession = { user: { id: 'u1', role: 'FOOTBALLER' } };
const clubSession = { user: { id: 'u2', role: 'CLUB' } };

beforeEach(() => {
  mockAuth.mockReset();
  mockFpUpdate.mockReset();
  mockFpFindUnique.mockReset();
  mockCeCreate.mockReset();
  mockCeFindUnique.mockReset();
  mockCeUpdate.mockReset();
  mockCeDelete.mockReset();
});

// ── updatePersonalInfo ────────────────────────────────────────────────────────

const validPersonal = {
  firstName: 'გიორგი',
  lastName: 'მაგალითი',
  dateOfBirth: '2000-06-15',
  nationality: 'GE',
  city: 'Tbilisi',
  country: 'GE',
};

describe('updatePersonalInfo — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updatePersonalInfo(validPersonal);
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('rejects CLUB users', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await updatePersonalInfo(validPersonal);
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });
});

describe('updatePersonalInfo — happy path', () => {
  it('saves and returns success', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpUpdate.mockResolvedValueOnce({});
    const r = await updatePersonalInfo(validPersonal);
    expect(r.status).toBe('success');
    expect(mockFpUpdate).toHaveBeenCalledOnce();
    const data = mockFpUpdate.mock.calls[0]![0].data;
    expect(data).toMatchObject({
      firstName: 'გიორგი',
      lastName: 'მაგალითი',
      nationality: 'GE',
      city: 'Tbilisi',
      country: 'GE',
    });
    expect(data.dateOfBirth).toBeInstanceOf(Date);
  });

  it('stores null for blank optional fields', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpUpdate.mockResolvedValueOnce({});
    await updatePersonalInfo({ ...validPersonal, phone: '', bio: '' });
    const data = mockFpUpdate.mock.calls[0]![0].data;
    expect(data.phone).toBeNull();
    expect(data.bio).toBeNull();
  });
});

describe('updatePersonalInfo — validation', () => {
  it('returns fieldErrors for missing firstName', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updatePersonalInfo({ ...validPersonal, firstName: '' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.firstName).toBeTruthy();
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('returns fieldErrors for invalid nationality', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updatePersonalInfo({ ...validPersonal, nationality: 'GEO' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.nationality).toBeTruthy();
  });

  it('returns fieldErrors for invalid dateOfBirth', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updatePersonalInfo({ ...validPersonal, dateOfBirth: 'not-a-date' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.dateOfBirth).toBeTruthy();
  });
});

// ── updateSportInfo ───────────────────────────────────────────────────────────

const validSport = {
  positions: ['CM'],
  dominantFoot: 'RIGHT',
  height: 180,
  weight: 75,
};

describe('updateSportInfo — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateSportInfo(validSport);
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('rejects CLUB users', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await updateSportInfo(validSport);
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });
});

describe('updateSportInfo — happy path', () => {
  it('saves and returns success', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpUpdate.mockResolvedValueOnce({});
    const r = await updateSportInfo(validSport);
    expect(r.status).toBe('success');
    expect(mockFpUpdate).toHaveBeenCalledOnce();
    const data = mockFpUpdate.mock.calls[0]![0].data;
    expect(data).toMatchObject({
      positions: ['CM'],
      dominantFoot: 'RIGHT',
      height: 180,
      weight: 75,
    });
  });

  it('stores null for blank optional fields', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpUpdate.mockResolvedValueOnce({});
    await updateSportInfo({ ...validSport, currentClub: undefined, jerseyNumber: undefined });
    const data = mockFpUpdate.mock.calls[0]![0].data;
    expect(data.currentClub).toBeNull();
    expect(data.jerseyNumber).toBeNull();
  });
});

describe('updateSportInfo — validation', () => {
  it('returns fieldErrors for invalid height', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateSportInfo({ ...validSport, height: 50 });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.height).toBeTruthy();
  });

  it('returns fieldErrors for more than 2 positions', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateSportInfo({ ...validSport, positions: ['CM', 'AM', 'CF'] });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.positions).toBeTruthy();
  });

  it('returns fieldErrors for zero positions', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateSportInfo({ ...validSport, positions: [] });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.positions).toBeTruthy();
  });
});

// ── addCareerEntry ────────────────────────────────────────────────────────────

const validCareer = { clubName: 'FC Dinamo', startYear: 2015, orderIndex: 0 };

describe('addCareerEntry — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await addCareerEntry(validCareer);
    expect(r.status).toBe('error');
    expect(mockCeCreate).not.toHaveBeenCalled();
  });

  it('rejects CLUB users', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await addCareerEntry(validCareer);
    expect(r.status).toBe('error');
    expect(mockCeCreate).not.toHaveBeenCalled();
  });
});

describe('addCareerEntry — happy path', () => {
  it('creates entry and returns success', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce({ id: 'fp1' });
    mockCeCreate.mockResolvedValueOnce({ id: 'ce1' });
    const r = await addCareerEntry(validCareer);
    expect(r.status).toBe('success');
    expect(mockCeCreate).toHaveBeenCalledOnce();
    const data = mockCeCreate.mock.calls[0]![0].data;
    expect(data).toMatchObject({ profileId: 'fp1', clubName: 'FC Dinamo', startYear: 2015 });
  });

  it('returns error when footballer profile is not found', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce(null);
    const r = await addCareerEntry(validCareer);
    expect(r.status).toBe('error');
    expect(mockCeCreate).not.toHaveBeenCalled();
  });
});

describe('addCareerEntry — validation', () => {
  it('returns fieldErrors for empty clubName', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await addCareerEntry({ ...validCareer, clubName: '' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.clubName).toBeTruthy();
  });

  it('returns fieldErrors for a past-limit startYear', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await addCareerEntry({ ...validCareer, startYear: 1949 });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.startYear).toBeTruthy();
  });
});

// ── updateCareerEntry ─────────────────────────────────────────────────────────

describe('updateCareerEntry — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateCareerEntry('ce1', validCareer);
    expect(r.status).toBe('error');
    expect(mockCeUpdate).not.toHaveBeenCalled();
  });
});

describe('updateCareerEntry — happy path', () => {
  it('updates entry and returns success', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce({ id: 'fp1' });
    mockCeFindUnique.mockResolvedValueOnce({ profileId: 'fp1' });
    mockCeUpdate.mockResolvedValueOnce({});
    const r = await updateCareerEntry('ce1', validCareer);
    expect(r.status).toBe('success');
    expect(mockCeUpdate).toHaveBeenCalledOnce();
  });

  it('returns error when entry belongs to another profile', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce({ id: 'fp1' });
    mockCeFindUnique.mockResolvedValueOnce({ profileId: 'fp-other' });
    const r = await updateCareerEntry('ce1', validCareer);
    expect(r.status).toBe('error');
    expect(mockCeUpdate).not.toHaveBeenCalled();
  });

  it('returns error when entry does not exist', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce({ id: 'fp1' });
    mockCeFindUnique.mockResolvedValueOnce(null);
    const r = await updateCareerEntry('ce1', validCareer);
    expect(r.status).toBe('error');
    expect(mockCeUpdate).not.toHaveBeenCalled();
  });

  it('returns error when footballer profile is not found', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce(null);
    const r = await updateCareerEntry('ce1', validCareer);
    expect(r.status).toBe('error');
    expect(mockCeUpdate).not.toHaveBeenCalled();
  });
});

// ── deleteCareerEntry ─────────────────────────────────────────────────────────

describe('deleteCareerEntry — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await deleteCareerEntry('ce1');
    expect(r.status).toBe('error');
    expect(mockCeDelete).not.toHaveBeenCalled();
  });

  it('rejects CLUB users', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await deleteCareerEntry('ce1');
    expect(r.status).toBe('error');
    expect(mockCeDelete).not.toHaveBeenCalled();
  });
});

describe('deleteCareerEntry — happy path', () => {
  it('deletes entry and returns success', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce({ id: 'fp1' });
    mockCeFindUnique.mockResolvedValueOnce({ profileId: 'fp1' });
    mockCeDelete.mockResolvedValueOnce({});
    const r = await deleteCareerEntry('ce1');
    expect(r.status).toBe('success');
    expect(mockCeDelete).toHaveBeenCalledOnce();
    expect(mockCeDelete.mock.calls[0]![0]).toEqual({ where: { id: 'ce1' } });
  });

  it('returns error when entry belongs to another profile', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce({ id: 'fp1' });
    mockCeFindUnique.mockResolvedValueOnce({ profileId: 'fp-other' });
    const r = await deleteCareerEntry('ce1');
    expect(r.status).toBe('error');
    expect(mockCeDelete).not.toHaveBeenCalled();
  });

  it('returns error when entry does not exist', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce({ id: 'fp1' });
    mockCeFindUnique.mockResolvedValueOnce(null);
    const r = await deleteCareerEntry('ce1');
    expect(r.status).toBe('error');
    expect(mockCeDelete).not.toHaveBeenCalled();
  });

  it('returns error when footballer profile is not found', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpFindUnique.mockResolvedValueOnce(null);
    const r = await deleteCareerEntry('ce1');
    expect(r.status).toBe('error');
    expect(mockCeDelete).not.toHaveBeenCalled();
  });
});

// ── updateAgentInfo ───────────────────────────────────────────────────────────

describe('updateAgentInfo — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateAgentInfo({});
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('rejects CLUB users', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await updateAgentInfo({});
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });
});

describe('updateAgentInfo — happy path', () => {
  it('saves agent info and returns success', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpUpdate.mockResolvedValueOnce({});
    const r = await updateAgentInfo({
      agentName: 'Test Agent',
      agentPhone: '+995 555 000 000',
      agentEmail: 'agent@example.com',
    });
    expect(r.status).toBe('success');
    expect(mockFpUpdate).toHaveBeenCalledOnce();
    const data = mockFpUpdate.mock.calls[0]![0].data;
    expect(data).toMatchObject({
      agentName: 'Test Agent',
      agentPhone: '+995 555 000 000',
      agentEmail: 'agent@example.com',
    });
  });

  it('stores null for empty optional fields', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFpUpdate.mockResolvedValueOnce({});
    await updateAgentInfo({ agentName: '', agentPhone: '', agentEmail: '' });
    const data = mockFpUpdate.mock.calls[0]![0].data;
    expect(data.agentName).toBeNull();
    expect(data.agentPhone).toBeNull();
    expect(data.agentEmail).toBeNull();
  });
});

describe('updateAgentInfo — validation', () => {
  it('returns fieldErrors for invalid agentEmail', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateAgentInfo({ agentEmail: 'not-an-email' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.agentEmail).toBeTruthy();
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });
});
