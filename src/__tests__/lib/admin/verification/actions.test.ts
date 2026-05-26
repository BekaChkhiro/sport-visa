import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

const mockFpFindUnique = vi.hoisted(() => vi.fn());
const mockFpUpdate = vi.hoisted(() => vi.fn());
const mockFpCount = vi.hoisted(() => vi.fn());
const mockFpFindMany = vi.hoisted(() => vi.fn());
const mockCpFindUnique = vi.hoisted(() => vi.fn());
const mockCpUpdate = vi.hoisted(() => vi.fn());
const mockCpCount = vi.hoisted(() => vi.fn());
const mockCpFindMany = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    footballerProfile: {
      findUnique: mockFpFindUnique,
      update: mockFpUpdate,
      count: mockFpCount,
      findMany: mockFpFindMany,
    },
    clubProfile: {
      findUnique: mockCpFindUnique,
      update: mockCpUpdate,
      count: mockCpCount,
      findMany: mockCpFindMany,
    },
  },
}));

const mockSendEmail = vi.hoisted(() => vi.fn());
vi.mock('@/lib/resend', () => ({ sendAccountVerificationEmail: mockSendEmail }));

vi.mock('@/lib/env', () => ({ env: { NEXT_PUBLIC_APP_URL: 'http://localhost:3000' } }));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  approveClub,
  approveFootballer,
  listPendingClubs,
  listPendingFootballers,
  rejectClub,
  rejectFootballer,
} from '@/lib/admin/verification/actions';

const adminSession = { user: { id: 'admin-1', role: 'ADMIN' } };
const clubUserSession = { user: { id: 'u2', role: 'CLUB' } };
const footballerUserSession = { user: { id: 'u3', role: 'FOOTBALLER' } };

beforeEach(() => {
  mockAuth.mockReset();
  mockFpFindUnique.mockReset();
  mockFpUpdate.mockReset();
  mockFpCount.mockReset();
  mockFpFindMany.mockReset();
  mockCpFindUnique.mockReset();
  mockCpUpdate.mockReset();
  mockCpCount.mockReset();
  mockCpFindMany.mockReset();
  mockSendEmail.mockReset();
  mockSendEmail.mockResolvedValue({ id: 'email-id' });
});

// ── approveFootballer ────────────────────────────────────────────────────────

describe('approveFootballer', () => {
  const pending = {
    id: 'fp-1',
    firstName: 'გიორგი',
    lastName: 'მაგ.',
    verificationStatus: 'PENDING' as const,
    user: { email: 'g@example.com' },
  };

  it('rejects unauthenticated callers', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const r = await approveFootballer({ profileId: 'fp-1' });
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('rejects non-admin callers', async () => {
    mockAuth.mockResolvedValueOnce(clubUserSession);
    const r = await approveFootballer({ profileId: 'fp-1' });
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('rejects when profileId is missing', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await approveFootballer({});
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('returns success when profile is already verified (no-op)', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFpFindUnique.mockResolvedValueOnce({ ...pending, verificationStatus: 'VERIFIED' });
    const r = await approveFootballer({ profileId: 'fp-1' });
    expect(r.status).toBe('success');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('flips verification status to VERIFIED and clears rejectionReason', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFpFindUnique.mockResolvedValueOnce(pending);
    mockFpUpdate.mockResolvedValueOnce({ id: 'fp-1' });
    const r = await approveFootballer({ profileId: 'fp-1' });
    expect(r.status).toBe('success');
    expect(mockFpUpdate).toHaveBeenCalledWith({
      where: { id: 'fp-1' },
      data: { verificationStatus: 'VERIFIED', rejectionReason: null },
    });
  });

  it('sends approval email with no rejection reason', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFpFindUnique.mockResolvedValueOnce(pending);
    mockFpUpdate.mockResolvedValueOnce({ id: 'fp-1' });
    await approveFootballer({ profileId: 'fp-1' });
    expect(mockSendEmail).toHaveBeenCalledWith(
      'g@example.com',
      expect.objectContaining({ status: 'approved' }),
    );
  });

  it('returns 404-style error when profile not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFpFindUnique.mockResolvedValueOnce(null);
    const r = await approveFootballer({ profileId: 'nope' });
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('still returns success when email send fails (best-effort)', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFpFindUnique.mockResolvedValueOnce(pending);
    mockFpUpdate.mockResolvedValueOnce({ id: 'fp-1' });
    mockSendEmail.mockRejectedValueOnce(new Error('resend down'));
    const r = await approveFootballer({ profileId: 'fp-1' });
    expect(r.status).toBe('success');
  });
});

// ── rejectFootballer ─────────────────────────────────────────────────────────

describe('rejectFootballer', () => {
  const pending = {
    id: 'fp-1',
    firstName: 'გ',
    lastName: 'მ',
    verificationStatus: 'PENDING' as const,
    user: { email: 'g@example.com' },
  };

  it('rejects empty reason', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await rejectFootballer({ profileId: 'fp-1', reason: '   ' });
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('rejects reason longer than 500 chars', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await rejectFootballer({ profileId: 'fp-1', reason: 'x'.repeat(501) });
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });

  it('stores rejection reason and sends email with note', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFpFindUnique.mockResolvedValueOnce(pending);
    mockFpUpdate.mockResolvedValueOnce({ id: 'fp-1' });
    const r = await rejectFootballer({
      profileId: 'fp-1',
      reason: 'ფოტო არასაკმარისი ხარისხის',
    });
    expect(r.status).toBe('success');
    expect(mockFpUpdate).toHaveBeenCalledWith({
      where: { id: 'fp-1' },
      data: {
        verificationStatus: 'REJECTED',
        rejectionReason: 'ფოტო არასაკმარისი ხარისხის',
      },
    });
    expect(mockSendEmail).toHaveBeenCalledWith(
      'g@example.com',
      expect.objectContaining({
        status: 'rejected',
        rejectionReason: 'ფოტო არასაკმარისი ხარისხის',
      }),
    );
  });

  it('rejects non-admin callers', async () => {
    mockAuth.mockResolvedValueOnce(footballerUserSession);
    const r = await rejectFootballer({ profileId: 'fp-1', reason: 'reason' });
    expect(r.status).toBe('error');
    expect(mockFpUpdate).not.toHaveBeenCalled();
  });
});

// ── approveClub / rejectClub ─────────────────────────────────────────────────

describe('approveClub', () => {
  it('flips club to VERIFIED and clears rejectionReason', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockCpFindUnique.mockResolvedValueOnce({
      id: 'cp-1',
      name: 'FC Test',
      verificationStatus: 'PENDING',
      user: { email: 'c@example.com' },
    });
    mockCpUpdate.mockResolvedValueOnce({ id: 'cp-1' });
    const r = await approveClub({ profileId: 'cp-1' });
    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith({
      where: { id: 'cp-1' },
      data: { verificationStatus: 'VERIFIED', rejectionReason: null },
    });
    expect(mockSendEmail).toHaveBeenCalledWith(
      'c@example.com',
      expect.objectContaining({ status: 'approved', recipientName: 'FC Test' }),
    );
  });
});

describe('rejectClub', () => {
  it('requires non-empty reason and stores it', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await rejectClub({ profileId: 'cp-1', reason: '' });
    expect(r.status).toBe('error');
    expect(mockCpUpdate).not.toHaveBeenCalled();
  });

  it('updates club to REJECTED with reason and sends email', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockCpFindUnique.mockResolvedValueOnce({
      id: 'cp-1',
      name: 'FC Test',
      verificationStatus: 'PENDING',
      user: { email: 'c@example.com' },
    });
    mockCpUpdate.mockResolvedValueOnce({ id: 'cp-1' });
    const r = await rejectClub({ profileId: 'cp-1', reason: 'არასრული პროფილი' });
    expect(r.status).toBe('success');
    expect(mockCpUpdate).toHaveBeenCalledWith({
      where: { id: 'cp-1' },
      data: { verificationStatus: 'REJECTED', rejectionReason: 'არასრული პროფილი' },
    });
    expect(mockSendEmail).toHaveBeenCalledWith(
      'c@example.com',
      expect.objectContaining({ status: 'rejected', rejectionReason: 'არასრული პროფილი' }),
    );
  });
});

// ── listPendingFootballers / listPendingClubs ────────────────────────────────

describe('listPendingFootballers', () => {
  it('applies query filter on first/last name and email', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFpCount.mockResolvedValueOnce(0);
    mockFpFindMany.mockResolvedValueOnce([]);
    await listPendingFootballers({ query: 'giorgi', sort: 'oldest', page: 1, pageSize: 10 });
    expect(mockFpFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          verificationStatus: 'PENDING',
          OR: [
            { firstName: { contains: 'giorgi', mode: 'insensitive' } },
            { lastName: { contains: 'giorgi', mode: 'insensitive' } },
            { user: { email: { contains: 'giorgi', mode: 'insensitive' } } },
          ],
        }),
        orderBy: { createdAt: 'asc' },
        skip: 0,
        take: 10,
      }),
    );
  });

  it('returns paginated mapped rows with computed page count', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFpCount.mockResolvedValueOnce(15);
    mockFpFindMany.mockResolvedValueOnce([
      {
        id: 'fp-1',
        firstName: 'A',
        lastName: 'B',
        positions: ['CM'],
        city: 'Tbilisi',
        nationality: 'GE',
        avatarKey: 'avatars/a.jpg',
        createdAt: new Date('2026-05-01'),
        user: { email: 'a@b.ge' },
      },
    ]);
    const r = await listPendingFootballers({ sort: 'newest', page: 2, pageSize: 10 });
    expect(r.total).toBe(15);
    expect(r.pageCount).toBe(2);
    expect(r.items[0]?.email).toBe('a@b.ge');
    expect(mockFpFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      }),
    );
  });

  it('throws when caller is not admin', async () => {
    mockAuth.mockResolvedValueOnce(clubUserSession);
    await expect(listPendingFootballers({})).rejects.toThrow();
  });
});

describe('listPendingClubs', () => {
  it('filters by name and email when query provided', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockCpCount.mockResolvedValueOnce(0);
    mockCpFindMany.mockResolvedValueOnce([]);
    await listPendingClubs({ query: 'dila' });
    expect(mockCpFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          verificationStatus: 'PENDING',
          OR: [
            { name: { contains: 'dila', mode: 'insensitive' } },
            { user: { email: { contains: 'dila', mode: 'insensitive' } } },
          ],
        }),
      }),
    );
  });
});
