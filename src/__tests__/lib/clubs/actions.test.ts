import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

const mockFootballerProfileFindUnique = vi.hoisted(() => vi.fn());
const mockClubSubscriptionFindUnique = vi.hoisted(() => vi.fn());
const mockClubSubscriptionDelete = vi.hoisted(() => vi.fn());
const mockClubSubscriptionCreate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    footballerProfile: { findUnique: mockFootballerProfileFindUnique },
    clubSubscription: {
      findUnique: mockClubSubscriptionFindUnique,
      delete: mockClubSubscriptionDelete,
      create: mockClubSubscriptionCreate,
    },
  },
}));

import { toggleSubscription } from '@/lib/clubs/actions';
import { revalidatePath } from 'next/cache';

const footballerSession = { user: { id: 'u1', role: 'FOOTBALLER' } };
const clubSession = { user: { id: 'u2', role: 'CLUB' } };

beforeEach(() => {
  mockAuth.mockReset();
  mockFootballerProfileFindUnique.mockReset();
  mockClubSubscriptionFindUnique.mockReset();
  mockClubSubscriptionDelete.mockReset();
  mockClubSubscriptionCreate.mockReset();
  vi.mocked(revalidatePath).mockReset();
});

describe('toggleSubscription — auth guards', () => {
  it('returns error for unauthenticated request', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await toggleSubscription('cp1');
    expect(result.status).toBe('error');
    expect(mockFootballerProfileFindUnique).not.toHaveBeenCalled();
  });

  it('returns error when role is not FOOTBALLER', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const result = await toggleSubscription('cp1');
    expect(result.status).toBe('error');
    expect(mockFootballerProfileFindUnique).not.toHaveBeenCalled();
  });
});

describe('toggleSubscription — footballer profile guard', () => {
  it('returns error when footballer profile not found', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    mockFootballerProfileFindUnique.mockResolvedValueOnce(null);
    const result = await toggleSubscription('cp1');
    expect(result.status).toBe('error');
    expect(mockClubSubscriptionFindUnique).not.toHaveBeenCalled();
  });
});

describe('toggleSubscription — unsubscribe (entry exists)', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(footballerSession);
    mockFootballerProfileFindUnique.mockResolvedValue({ id: 'fb1' });
  });

  it('deletes existing subscription and returns subscribed: false', async () => {
    mockClubSubscriptionFindUnique.mockResolvedValueOnce({ id: 'sub1' });
    mockClubSubscriptionDelete.mockResolvedValueOnce({});

    const result = await toggleSubscription('cp1');

    expect(result).toEqual({ status: 'success', subscribed: false });
    expect(mockClubSubscriptionDelete).toHaveBeenCalledWith({ where: { id: 'sub1' } });
    expect(mockClubSubscriptionCreate).not.toHaveBeenCalled();
  });

  it('revalidates club and dashboard paths on unsubscribe', async () => {
    mockClubSubscriptionFindUnique.mockResolvedValueOnce({ id: 'sub1' });
    mockClubSubscriptionDelete.mockResolvedValueOnce({});

    await toggleSubscription('cp2');

    expect(revalidatePath).toHaveBeenCalledWith('/clubs');
    expect(revalidatePath).toHaveBeenCalledWith('/clubs/cp2');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/footballer');
  });
});

describe('toggleSubscription — subscribe (entry absent)', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(footballerSession);
    mockFootballerProfileFindUnique.mockResolvedValue({ id: 'fb1' });
  });

  it('creates subscription and returns subscribed: true', async () => {
    mockClubSubscriptionFindUnique.mockResolvedValueOnce(null);
    mockClubSubscriptionCreate.mockResolvedValueOnce({});

    const result = await toggleSubscription('cp1');

    expect(result).toEqual({ status: 'success', subscribed: true });
    expect(mockClubSubscriptionCreate).toHaveBeenCalledWith({
      data: { footballerProfileId: 'fb1', clubProfileId: 'cp1' },
    });
    expect(mockClubSubscriptionDelete).not.toHaveBeenCalled();
  });

  it('revalidates club and dashboard paths on subscribe', async () => {
    mockClubSubscriptionFindUnique.mockResolvedValueOnce(null);
    mockClubSubscriptionCreate.mockResolvedValueOnce({});

    await toggleSubscription('cp3');

    expect(revalidatePath).toHaveBeenCalledWith('/clubs');
    expect(revalidatePath).toHaveBeenCalledWith('/clubs/cp3');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/footballer');
  });
});
