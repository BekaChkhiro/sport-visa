import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

const mockUserFindUnique = vi.hoisted(() => vi.fn());
const mockUserUpdate = vi.hoisted(() => vi.fn());
const mockUserDelete = vi.hoisted(() => vi.fn());
const mockUserCount = vi.hoisted(() => vi.fn());
const mockUserFindMany = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate,
      delete: mockUserDelete,
      count: mockUserCount,
      findMany: mockUserFindMany,
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { banUser, deleteUser, listUsers, unbanUser } from '@/lib/admin/users/actions';

const adminSession = { user: { id: 'admin-1', role: 'ADMIN' } };
const footballerSession = { user: { id: 'u3', role: 'FOOTBALLER' } };
const clubSession = { user: { id: 'u2', role: 'CLUB' } };

const makeRow = (
  overrides: Partial<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    emailVerified: null | Date;
    createdAt: Date;
    footballerProfile: { verificationStatus: string } | null;
    clubProfile: { verificationStatus: string } | null;
  }> = {},
) => ({
  id: 'u1',
  email: 'a@test.ge',
  firstName: 'A',
  lastName: 'B',
  role: 'FOOTBALLER',
  status: 'ACTIVE',
  emailVerified: null,
  createdAt: new Date('2026-05-01'),
  footballerProfile: { verificationStatus: 'PENDING' },
  clubProfile: null,
  ...overrides,
});

beforeEach(() => {
  mockAuth.mockReset();
  mockUserFindUnique.mockReset();
  mockUserUpdate.mockReset();
  mockUserDelete.mockReset();
  mockUserCount.mockReset();
  mockUserFindMany.mockReset();
});

// ── listUsers ────────────────────────────────────────────────────────────────

describe('listUsers', () => {
  it('throws when caller is not admin (FORBIDDEN)', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    await expect(listUsers({})).rejects.toThrow('FORBIDDEN');
  });

  it('throws when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(listUsers({})).rejects.toThrow('UNAUTHORIZED');
  });

  it('applies query filter with OR across email, firstName, lastName', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(0);
    mockUserFindMany.mockResolvedValueOnce([]);
    await listUsers({ query: 'giorgi' });
    expect(mockUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { email: { contains: 'giorgi', mode: 'insensitive' } },
            { firstName: { contains: 'giorgi', mode: 'insensitive' } },
            { lastName: { contains: 'giorgi', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });

  it('applies role filter for FOOTBALLER', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(0);
    mockUserFindMany.mockResolvedValueOnce([]);
    await listUsers({ role: 'FOOTBALLER' });
    expect(mockUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ role: 'FOOTBALLER' }),
      }),
    );
  });

  it('applies role filter for CLUB', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(0);
    mockUserFindMany.mockResolvedValueOnce([]);
    await listUsers({ role: 'CLUB' });
    expect(mockUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ role: 'CLUB' }),
      }),
    );
  });

  it('does not add role filter when role is ALL', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(0);
    mockUserFindMany.mockResolvedValueOnce([]);
    await listUsers({ role: 'ALL' });
    const callArgs = mockUserFindMany.mock.calls[0]?.[0];
    expect(callArgs?.where).not.toHaveProperty('role');
  });

  it('returns correct pageCount (Math.ceil(total/pageSize), min 1)', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(25);
    mockUserFindMany.mockResolvedValueOnce([]);
    const result = await listUsers({ page: 1, pageSize: 10 });
    expect(result.pageCount).toBe(3);
    expect(result.total).toBe(25);
  });

  it('returns pageCount of 1 when total is 0', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(0);
    mockUserFindMany.mockResolvedValueOnce([]);
    const result = await listUsers({});
    expect(result.pageCount).toBe(1);
  });

  it('maps rows correctly: footballerProfile.verificationStatus takes precedence', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(1);
    mockUserFindMany.mockResolvedValueOnce([
      makeRow({
        footballerProfile: { verificationStatus: 'PENDING' },
        clubProfile: { verificationStatus: 'VERIFIED' },
      }),
    ]);
    const result = await listUsers({});
    expect(result.items[0]?.verificationStatus).toBe('PENDING');
  });

  it('maps rows correctly: falls back to clubProfile when no footballerProfile', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(1);
    mockUserFindMany.mockResolvedValueOnce([
      makeRow({
        footballerProfile: null,
        clubProfile: { verificationStatus: 'VERIFIED' },
      }),
    ]);
    const result = await listUsers({});
    expect(result.items[0]?.verificationStatus).toBe('VERIFIED');
  });

  it('maps rows correctly: verificationStatus is null when both profiles are null', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(1);
    mockUserFindMany.mockResolvedValueOnce([
      makeRow({ footballerProfile: null, clubProfile: null }),
    ]);
    const result = await listUsers({});
    expect(result.items[0]?.verificationStatus).toBeNull();
  });

  it('maps emailVerified to ISO string when present, null otherwise', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(1);
    const verifiedDate = new Date('2026-01-15T10:00:00.000Z');
    mockUserFindMany.mockResolvedValueOnce([makeRow({ emailVerified: verifiedDate })]);
    const result = await listUsers({});
    expect(result.items[0]?.emailVerified).toBe(verifiedDate.toISOString());
  });

  it('maps createdAt to ISO string', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(1);
    const createdAt = new Date('2026-05-01');
    mockUserFindMany.mockResolvedValueOnce([makeRow({ createdAt })]);
    const result = await listUsers({});
    expect(result.items[0]?.createdAt).toBe(createdAt.toISOString());
  });

  it('applies correct skip/take for pagination', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserCount.mockResolvedValueOnce(50);
    mockUserFindMany.mockResolvedValueOnce([]);
    await listUsers({ page: 3, pageSize: 10 });
    expect(mockUserFindMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 10 }));
  });
});

// ── banUser ──────────────────────────────────────────────────────────────────

describe('banUser', () => {
  it('returns error when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await banUser({ userId: 'u1' });
    expect(result.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('returns error when not admin', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const result = await banUser({ userId: 'u1' });
    expect(result.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('returns error when userId is missing', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const result = await banUser({});
    expect(result.status).toBe('error');
    expect(mockUserFindUnique).not.toHaveBeenCalled();
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('returns error when userId is invalid (empty string)', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const result = await banUser({ userId: '' });
    expect(result.status).toBe('error');
    expect(mockUserFindUnique).not.toHaveBeenCalled();
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('returns error when user is ADMIN role (cannot ban)', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce({ id: 'u1', role: 'ADMIN', status: 'ACTIVE' });
    const result = await banUser({ userId: 'u1' });
    expect(result.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('returns success (no-op) when user is already BLOCKED', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce({ id: 'u1', role: 'FOOTBALLER', status: 'BLOCKED' });
    const result = await banUser({ userId: 'u1' });
    expect(result.status).toBe('success');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('calls db.user.update with status BLOCKED and returns success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce({ id: 'u1', role: 'FOOTBALLER', status: 'ACTIVE' });
    mockUserUpdate.mockResolvedValueOnce({ id: 'u1' });
    const result = await banUser({ userId: 'u1' });
    expect(result.status).toBe('success');
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { status: 'BLOCKED' },
    });
  });

  it('returns error when user not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce(null);
    const result = await banUser({ userId: 'nonexistent' });
    expect(result.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});

// ── unbanUser ────────────────────────────────────────────────────────────────

describe('unbanUser', () => {
  it('returns error when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await unbanUser({ userId: 'u1' });
    expect(result.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('returns error when not admin', async () => {
    mockAuth.mockResolvedValueOnce(footballerSession);
    const result = await unbanUser({ userId: 'u1' });
    expect(result.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('returns success (no-op) when user is already ACTIVE', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce({ id: 'u1', status: 'ACTIVE' });
    const result = await unbanUser({ userId: 'u1' });
    expect(result.status).toBe('success');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('calls db.user.update with status ACTIVE and returns success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce({ id: 'u1', status: 'BLOCKED' });
    mockUserUpdate.mockResolvedValueOnce({ id: 'u1' });
    const result = await unbanUser({ userId: 'u1' });
    expect(result.status).toBe('success');
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { status: 'ACTIVE' },
    });
  });

  it('returns error when user not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce(null);
    const result = await unbanUser({ userId: 'nonexistent' });
    expect(result.status).toBe('error');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});

// ── deleteUser ───────────────────────────────────────────────────────────────

describe('deleteUser', () => {
  it('returns error when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await deleteUser({ userId: 'u1' });
    expect(result.status).toBe('error');
    expect(mockUserDelete).not.toHaveBeenCalled();
  });

  it('returns error when not admin', async () => {
    mockAuth.mockResolvedValueOnce(clubSession);
    const result = await deleteUser({ userId: 'u1' });
    expect(result.status).toBe('error');
    expect(mockUserDelete).not.toHaveBeenCalled();
  });

  it('returns error when user is ADMIN role', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce({ id: 'u1', role: 'ADMIN' });
    const result = await deleteUser({ userId: 'u1' });
    expect(result.status).toBe('error');
    expect(mockUserDelete).not.toHaveBeenCalled();
  });

  it('returns error when user tries to delete themselves (adminId === userId)', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce({ id: 'admin-1', role: 'FOOTBALLER' });
    const result = await deleteUser({ userId: 'admin-1' });
    expect(result.status).toBe('error');
    expect(mockUserDelete).not.toHaveBeenCalled();
  });

  it('calls db.user.delete and returns success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce({ id: 'u1', role: 'FOOTBALLER' });
    mockUserDelete.mockResolvedValueOnce({ id: 'u1' });
    const result = await deleteUser({ userId: 'u1' });
    expect(result.status).toBe('success');
    expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('returns error when user not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockUserFindUnique.mockResolvedValueOnce(null);
    const result = await deleteUser({ userId: 'nonexistent' });
    expect(result.status).toBe('error');
    expect(mockUserDelete).not.toHaveBeenCalled();
  });
});
