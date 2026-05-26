import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

const mockClubProfileFindUnique = vi.hoisted(() => vi.fn());
const mockClubShortlistFindUnique = vi.hoisted(() => vi.fn());
const mockClubShortlistDelete = vi.hoisted(() => vi.fn());
const mockClubShortlistCreate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    clubProfile: { findUnique: mockClubProfileFindUnique },
    clubShortlist: {
      findUnique: mockClubShortlistFindUnique,
      delete: mockClubShortlistDelete,
      create: mockClubShortlistCreate,
    },
  },
}));

import { toggleShortlist } from '@/lib/directory/actions';
import { revalidatePath } from 'next/cache';

const clubSession = { user: { id: 'u1', role: 'CLUB' } };
const footballerSession = { user: { id: 'u2', role: 'FOOTBALLER' } };

beforeEach(() => {
  mockAuth.mockReset();
  mockClubProfileFindUnique.mockReset();
  mockClubShortlistFindUnique.mockReset();
  mockClubShortlistDelete.mockReset();
  mockClubShortlistCreate.mockReset();
  vi.mocked(revalidatePath).mockReset();
});

describe('toggleShortlist — auth guards', () => {
  it('returns error for unauthenticated request', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await toggleShortlist('fp1');
    expect(result.status).toBe('error');
    expect(mockClubProfileFindUnique).not.toHaveBeenCalled();
  });

  it('returns error when role is not CLUB', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const result = await toggleShortlist('fp1');
    expect(result.status).toBe('error');
    expect(mockClubProfileFindUnique).not.toHaveBeenCalled();
  });
});

describe('toggleShortlist — club profile guard', () => {
  it('returns error when club profile not found', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    mockClubProfileFindUnique.mockResolvedValueOnce(null);
    const result = await toggleShortlist('fp1');
    expect(result.status).toBe('error');
    expect(mockClubShortlistFindUnique).not.toHaveBeenCalled();
  });
});

describe('toggleShortlist — remove existing entry', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(clubSession);
    mockClubProfileFindUnique.mockResolvedValue({ id: 'club1' });
  });

  it('deletes existing entry and returns shortlisted: false', async () => {
    mockClubShortlistFindUnique.mockResolvedValueOnce({ id: 'sl1' });
    mockClubShortlistDelete.mockResolvedValueOnce({});

    const result = await toggleShortlist('fp1');

    expect(result).toEqual({ status: 'success', shortlisted: false });
    expect(mockClubShortlistDelete).toHaveBeenCalledWith({ where: { id: 'sl1' } });
    expect(mockClubShortlistCreate).not.toHaveBeenCalled();
  });

  it('revalidates directory and shortlist paths on remove', async () => {
    mockClubShortlistFindUnique.mockResolvedValueOnce({ id: 'sl1' });
    mockClubShortlistDelete.mockResolvedValueOnce({});

    await toggleShortlist('fp2');

    expect(revalidatePath).toHaveBeenCalledWith('/directory');
    expect(revalidatePath).toHaveBeenCalledWith('/directory/fp2');
    expect(revalidatePath).toHaveBeenCalledWith('/shortlist');
  });
});

describe('toggleShortlist — add new entry', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(clubSession);
    mockClubProfileFindUnique.mockResolvedValue({ id: 'club1' });
  });

  it('creates entry and returns shortlisted: true', async () => {
    mockClubShortlistFindUnique.mockResolvedValueOnce(null);
    mockClubShortlistCreate.mockResolvedValueOnce({});

    const result = await toggleShortlist('fp1');

    expect(result).toEqual({ status: 'success', shortlisted: true });
    expect(mockClubShortlistCreate).toHaveBeenCalledWith({
      data: { clubProfileId: 'club1', footballerProfileId: 'fp1' },
    });
    expect(mockClubShortlistDelete).not.toHaveBeenCalled();
  });

  it('revalidates directory and shortlist paths on add', async () => {
    mockClubShortlistFindUnique.mockResolvedValueOnce(null);
    mockClubShortlistCreate.mockResolvedValueOnce({});

    await toggleShortlist('fp3');

    expect(revalidatePath).toHaveBeenCalledWith('/directory');
    expect(revalidatePath).toHaveBeenCalledWith('/directory/fp3');
    expect(revalidatePath).toHaveBeenCalledWith('/shortlist');
  });
});
