import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

const mockCpUpdate = vi.hoisted(() => vi.fn());
const mockCpFindUnique = vi.hoisted(() => vi.fn());
const mockDeleteObject = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    clubProfile: {
      update: mockCpUpdate,
      findUnique: mockCpFindUnique,
    },
  },
}));

vi.mock('@/lib/r2', () => ({ deleteObject: mockDeleteObject }));

import {
  updateClubIdentity,
  updateClubLogo,
  updateClubCover,
  updateClubVisibility,
} from '@/lib/club-profile/actions';

const clubSession = { user: { id: 'u1', role: 'CLUB' } };
const footballerSession = { user: { id: 'u2', role: 'FOOTBALLER' } };

const validIdentity = { name: 'FC Dinamo' };

beforeEach(() => {
  mockAuth.mockReset();
  mockCpUpdate.mockReset();
  mockCpFindUnique.mockReset();
  mockDeleteObject.mockReset();
});

// ── updateClubIdentity ────────────────────────────────────────────────────────

describe('updateClubIdentity — auth & role guards', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateClubIdentity(validIdentity);
    expect(r.status).toBe('error');
    expect(mockCpUpdate).not.toHaveBeenCalled();
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateClubIdentity(validIdentity);
    expect(r.status).toBe('error');
    expect(mockCpUpdate).not.toHaveBeenCalled();
  });
});

describe('updateClubIdentity — validation', () => {
  it('returns fieldErrors on invalid payload', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const r = await updateClubIdentity({ name: '' });
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.fieldErrors?.name).toBeTruthy();
  });
});

describe('updateClubIdentity — happy path', () => {
  it('saves and returns success', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubIdentity(validIdentity);

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1' },
        data: expect.objectContaining({ name: 'FC Dinamo' }),
      }),
    );
  });

  it('sets null for omitted optional fields', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    await updateClubIdentity({ name: 'FC Test' });

    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          city: null,
          league: null,
          stadiumName: null,
        }),
      }),
    );
  });
});

// ── updateClubLogo ────────────────────────────────────────────────────────────

describe('updateClubLogo — auth guard', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateClubLogo('logo/key.png');
    expect(r.status).toBe('error');
  });

  it('rejects FOOTBALLER users', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const r = await updateClubLogo('logo/key.png');
    expect(r.status).toBe('error');
  });
});

describe('updateClubLogo — happy path', () => {
  it('saves the new logo key', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ logoKey: null });
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubLogo('logo/new.png');

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { logoKey: 'logo/new.png' } }),
    );
  });

  it('deletes the old logo key when replacing', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ logoKey: 'logo/old.png' });
    mockCpUpdate.mockResolvedValueOnce({});
    mockDeleteObject.mockResolvedValueOnce(undefined);

    await updateClubLogo('logo/new.png');

    expect(mockDeleteObject).toHaveBeenCalledWith('logo/old.png');
  });

  it('does not delete when key is unchanged', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ logoKey: 'logo/same.png' });
    mockCpUpdate.mockResolvedValueOnce({});

    await updateClubLogo('logo/same.png');

    expect(mockDeleteObject).not.toHaveBeenCalled();
  });

  it('returns error when profile not found', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce(null);

    const r = await updateClubLogo('logo/key.png');
    expect(r.status).toBe('error');
  });
});

// ── updateClubCover ───────────────────────────────────────────────────────────

describe('updateClubCover — happy path', () => {
  it('saves the new cover key', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ coverKey: null });
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubCover('cover/new.jpg');

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { coverKey: 'cover/new.jpg' } }),
    );
  });

  it('deletes the old cover when replacing', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpFindUnique.mockResolvedValueOnce({ coverKey: 'cover/old.jpg' });
    mockCpUpdate.mockResolvedValueOnce({});
    mockDeleteObject.mockResolvedValueOnce(undefined);

    await updateClubCover('cover/new.jpg');

    expect(mockDeleteObject).toHaveBeenCalledWith('cover/old.jpg');
  });
});

// ── updateClubVisibility ──────────────────────────────────────────────────────

describe('updateClubVisibility', () => {
  it('rejects unauthenticated caller', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await updateClubVisibility(false);
    expect(r.status).toBe('error');
  });

  it('saves visibility=false', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubVisibility(false);

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isVisible: false } }),
    );
  });

  it('saves visibility=true', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockCpUpdate.mockResolvedValueOnce({});

    const r = await updateClubVisibility(true);

    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isVisible: true } }),
    );
  });
});
