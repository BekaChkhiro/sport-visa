import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

// ── League db mocks ────────────────────────────────────────────────────────────

const mockLeagueFindMany = vi.hoisted(() => vi.fn());
const mockLeagueFindUnique = vi.hoisted(() => vi.fn());
const mockLeagueCreate = vi.hoisted(() => vi.fn());
const mockLeagueUpdate = vi.hoisted(() => vi.fn());
const mockLeagueDelete = vi.hoisted(() => vi.fn());

// ── ServiceCategory db mocks ──────────────────────────────────────────────────

const mockScFindMany = vi.hoisted(() => vi.fn());
const mockScFindUnique = vi.hoisted(() => vi.fn());
const mockScCreate = vi.hoisted(() => vi.fn());
const mockScUpdate = vi.hoisted(() => vi.fn());
const mockScDelete = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    league: {
      findMany: mockLeagueFindMany,
      findUnique: mockLeagueFindUnique,
      create: mockLeagueCreate,
      update: mockLeagueUpdate,
      delete: mockLeagueDelete,
    },
    serviceCategory: {
      findMany: mockScFindMany,
      findUnique: mockScFindUnique,
      create: mockScCreate,
      update: mockScUpdate,
      delete: mockScDelete,
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

import {
  createLeague,
  createServiceCategory,
  deleteLeague,
  deleteServiceCategory,
  toggleLeagueActive,
  toggleServiceCategoryActive,
  updateLeague,
  updateServiceCategory,
} from '@/lib/admin/ref-data/actions';

const adminSession = { user: { id: 'admin-1', role: 'ADMIN' } };
const nonAdminSession = { user: { id: 'user-1', role: 'FOOTBALLER' } };

beforeEach(() => {
  mockAuth.mockReset();
  mockLeagueFindMany.mockReset();
  mockLeagueFindUnique.mockReset();
  mockLeagueCreate.mockReset();
  mockLeagueUpdate.mockReset();
  mockLeagueDelete.mockReset();
  mockScFindMany.mockReset();
  mockScFindUnique.mockReset();
  mockScCreate.mockReset();
  mockScUpdate.mockReset();
  mockScDelete.mockReset();
});

// ── createLeague ──────────────────────────────────────────────────────────────

describe('createLeague', () => {
  it('returns error when not admin', async () => {
    mockAuth.mockResolvedValueOnce(nonAdminSession);
    const r = await createLeague({ name: 'Premier League', country: 'GB', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockLeagueCreate).not.toHaveBeenCalled();
  });

  it('returns error when name is empty', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await createLeague({ name: '', country: 'GE', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockLeagueCreate).not.toHaveBeenCalled();
  });

  it('returns error when country is not 2 chars', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await createLeague({ name: 'Liga', country: 'GEO', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockLeagueCreate).not.toHaveBeenCalled();
  });

  it('calls db.league.create with correct data and returns success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueCreate.mockResolvedValueOnce({ id: 'lg-1', name: 'Liga', country: 'GE' });
    const r = await createLeague({ name: 'Liga', country: 'ge', orderIndex: 1 });
    expect(r.status).toBe('success');
    expect(mockLeagueCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: 'Liga', country: 'GE', orderIndex: 1 }),
    });
  });

  it('normalizes country to uppercase', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueCreate.mockResolvedValueOnce({ id: 'lg-2', name: 'Test', country: 'GE' });
    await createLeague({ name: 'Test', country: 'ge', orderIndex: 0 });
    expect(mockLeagueCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ country: 'GE' }),
    });
  });

  it('transforms empty string country to null', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueCreate.mockResolvedValueOnce({ id: 'lg-3', name: 'Test', country: null });
    await createLeague({ name: 'Test', country: '', orderIndex: 0 });
    expect(mockLeagueCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ country: null }),
    });
  });
});

// ── updateLeague ──────────────────────────────────────────────────────────────

describe('updateLeague', () => {
  it('returns error when id is missing', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await updateLeague({ name: 'Liga', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockLeagueUpdate).not.toHaveBeenCalled();
  });

  it('returns error when league not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueFindUnique.mockResolvedValueOnce(null);
    const r = await updateLeague({ id: 'lg-999', name: 'Liga', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockLeagueUpdate).not.toHaveBeenCalled();
  });

  it('calls db.league.update with correct data and returns success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueFindUnique.mockResolvedValueOnce({ id: 'lg-1' });
    mockLeagueUpdate.mockResolvedValueOnce({ id: 'lg-1' });
    const r = await updateLeague({
      id: 'lg-1',
      name: 'Liga Updated',
      country: 'GE',
      orderIndex: 2,
    });
    expect(r.status).toBe('success');
    expect(mockLeagueUpdate).toHaveBeenCalledWith({
      where: { id: 'lg-1' },
      data: expect.objectContaining({ name: 'Liga Updated', country: 'GE', orderIndex: 2 }),
    });
  });
});

// ── deleteLeague ──────────────────────────────────────────────────────────────

describe('deleteLeague', () => {
  it('returns error when id is missing', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await deleteLeague({});
    expect(r.status).toBe('error');
    expect(mockLeagueDelete).not.toHaveBeenCalled();
  });

  it('returns error when league not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueFindUnique.mockResolvedValueOnce(null);
    const r = await deleteLeague({ id: 'lg-999' });
    expect(r.status).toBe('error');
    expect(mockLeagueDelete).not.toHaveBeenCalled();
  });

  it('calls db.league.delete and returns success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueFindUnique.mockResolvedValueOnce({ id: 'lg-1', name: 'Liga' });
    mockLeagueDelete.mockResolvedValueOnce({ id: 'lg-1' });
    const r = await deleteLeague({ id: 'lg-1' });
    expect(r.status).toBe('success');
    expect(mockLeagueDelete).toHaveBeenCalledWith({ where: { id: 'lg-1' } });
  });
});

// ── toggleLeagueActive ────────────────────────────────────────────────────────

describe('toggleLeagueActive', () => {
  it('returns error when id is missing', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await toggleLeagueActive({});
    expect(r.status).toBe('error');
    expect(mockLeagueUpdate).not.toHaveBeenCalled();
  });

  it('returns error when league not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueFindUnique.mockResolvedValueOnce(null);
    const r = await toggleLeagueActive({ id: 'lg-999' });
    expect(r.status).toBe('error');
    expect(mockLeagueUpdate).not.toHaveBeenCalled();
  });

  it('flips isActive from true to false', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueFindUnique.mockResolvedValueOnce({ id: 'lg-1', isActive: true });
    mockLeagueUpdate.mockResolvedValueOnce({ id: 'lg-1' });
    const r = await toggleLeagueActive({ id: 'lg-1' });
    expect(r.status).toBe('success');
    expect(mockLeagueUpdate).toHaveBeenCalledWith({
      where: { id: 'lg-1' },
      data: { isActive: false },
    });
  });

  it('flips isActive from false to true', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockLeagueFindUnique.mockResolvedValueOnce({ id: 'lg-1', isActive: false });
    mockLeagueUpdate.mockResolvedValueOnce({ id: 'lg-1' });
    const r = await toggleLeagueActive({ id: 'lg-1' });
    expect(r.status).toBe('success');
    expect(mockLeagueUpdate).toHaveBeenCalledWith({
      where: { id: 'lg-1' },
      data: { isActive: true },
    });
  });
});

// ── createServiceCategory ─────────────────────────────────────────────────────

describe('createServiceCategory', () => {
  it('returns error when not admin', async () => {
    mockAuth.mockResolvedValueOnce(nonAdminSession);
    const r = await createServiceCategory({ slug: 'visa', name: 'Visa', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockScCreate).not.toHaveBeenCalled();
  });

  it('returns error when slug is empty', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await createServiceCategory({ slug: '', name: 'Visa', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockScCreate).not.toHaveBeenCalled();
  });

  it('returns error when slug has invalid chars (space)', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await createServiceCategory({ slug: 'My Slug', name: 'Visa', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockScCreate).not.toHaveBeenCalled();
  });

  it('returns error when name is empty', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const r = await createServiceCategory({ slug: 'visa', name: '', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockScCreate).not.toHaveBeenCalled();
  });

  it('returns error when slug already exists', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockScFindUnique.mockResolvedValueOnce({ id: 'sc-existing', slug: 'visa' });
    const r = await createServiceCategory({ slug: 'visa', name: 'Visa', orderIndex: 0 });
    expect(r.status).toBe('error');
    expect(mockScCreate).not.toHaveBeenCalled();
  });

  it('calls db.serviceCategory.create and returns success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockScFindUnique.mockResolvedValueOnce(null);
    mockScCreate.mockResolvedValueOnce({ id: 'sc-1', slug: 'visa', name: 'Visa' });
    const r = await createServiceCategory({ slug: 'visa', name: 'Visa', orderIndex: 0 });
    expect(r.status).toBe('success');
    expect(mockScCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'visa', name: 'Visa', orderIndex: 0 }),
    });
  });
});

// ── updateServiceCategory ─────────────────────────────────────────────────────

describe('updateServiceCategory', () => {
  it('returns error when category not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockScFindUnique.mockResolvedValueOnce(null);
    const r = await updateServiceCategory({
      id: 'sc-999',
      slug: 'visa',
      name: 'Visa',
      orderIndex: 0,
    });
    expect(r.status).toBe('error');
    expect(mockScUpdate).not.toHaveBeenCalled();
  });

  it('returns error when new slug is already used by another record', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    // First findUnique: returns the existing record with a different slug
    mockScFindUnique.mockResolvedValueOnce({ id: 'sc-1', slug: 'old_slug' });
    // Second findUnique: conflict check — another record owns the new slug
    mockScFindUnique.mockResolvedValueOnce({ id: 'sc-other', slug: 'new_slug' });
    const r = await updateServiceCategory({
      id: 'sc-1',
      slug: 'new_slug',
      name: 'Visa',
      orderIndex: 0,
    });
    expect(r.status).toBe('error');
    expect(mockScUpdate).not.toHaveBeenCalled();
  });

  it('calls db.serviceCategory.update on success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockScFindUnique.mockResolvedValueOnce({ id: 'sc-1', slug: 'visa' });
    // No slug change → no conflict check call needed
    mockScUpdate.mockResolvedValueOnce({ id: 'sc-1' });
    const r = await updateServiceCategory({
      id: 'sc-1',
      slug: 'visa',
      name: 'Visa Updated',
      orderIndex: 1,
    });
    expect(r.status).toBe('success');
    expect(mockScUpdate).toHaveBeenCalledWith({
      where: { id: 'sc-1' },
      data: expect.objectContaining({ slug: 'visa', name: 'Visa Updated', orderIndex: 1 }),
    });
  });
});

// ── deleteServiceCategory ─────────────────────────────────────────────────────

describe('deleteServiceCategory', () => {
  it('returns error when category has active requests', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockScFindUnique.mockResolvedValueOnce({
      id: 'sc-1',
      slug: 'visa',
      name: 'Visa',
      _count: { requests: 3 },
    });
    const r = await deleteServiceCategory({ id: 'sc-1' });
    expect(r.status).toBe('error');
    expect(mockScDelete).not.toHaveBeenCalled();
  });

  it('calls db.serviceCategory.delete when _count.requests === 0', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockScFindUnique.mockResolvedValueOnce({
      id: 'sc-1',
      slug: 'visa',
      name: 'Visa',
      _count: { requests: 0 },
    });
    mockScDelete.mockResolvedValueOnce({ id: 'sc-1' });
    const r = await deleteServiceCategory({ id: 'sc-1' });
    expect(r.status).toBe('success');
    expect(mockScDelete).toHaveBeenCalledWith({ where: { id: 'sc-1' } });
  });
});

// ── toggleServiceCategoryActive ───────────────────────────────────────────────

describe('toggleServiceCategoryActive', () => {
  it('flips isActive from true to false', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockScFindUnique.mockResolvedValueOnce({ id: 'sc-1', isActive: true });
    mockScUpdate.mockResolvedValueOnce({ id: 'sc-1' });
    const r = await toggleServiceCategoryActive({ id: 'sc-1' });
    expect(r.status).toBe('success');
    expect(mockScUpdate).toHaveBeenCalledWith({
      where: { id: 'sc-1' },
      data: { isActive: false },
    });
  });

  it('flips isActive from false to true', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockScFindUnique.mockResolvedValueOnce({ id: 'sc-1', isActive: false });
    mockScUpdate.mockResolvedValueOnce({ id: 'sc-1' });
    const r = await toggleServiceCategoryActive({ id: 'sc-1' });
    expect(r.status).toBe('success');
    expect(mockScUpdate).toHaveBeenCalledWith({
      where: { id: 'sc-1' },
      data: { isActive: true },
    });
  });
});
