import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDeleteMany = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockFindUnique = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    verificationToken: {
      deleteMany: mockDeleteMany,
      create: mockCreate,
      findUnique: mockFindUnique,
      delete: mockDelete,
    },
  },
}));

import {
  consumeEmailVerificationToken,
  consumePasswordResetToken,
  createEmailVerificationToken,
  createPasswordResetToken,
} from '@/lib/auth/tokens';

beforeEach(() => {
  mockDeleteMany.mockReset();
  mockCreate.mockReset();
  mockFindUnique.mockReset();
  mockDelete.mockReset();
});

describe('createEmailVerificationToken', () => {
  it('returns a 64-char hex token and persists a row', async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });
    mockCreate.mockResolvedValueOnce({});

    const token = await createEmailVerificationToken('user@example.com');

    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { identifier: 'user@example.com' } });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const arg = mockCreate.mock.calls[0]![0];
    expect(arg.data.identifier).toBe('user@example.com');
    expect(arg.data.token).toBe(token);
    expect(arg.data.expires).toBeInstanceOf(Date);
    // ~24h ahead
    const diffMs = arg.data.expires.getTime() - Date.now();
    expect(diffMs).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(diffMs).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 1000);
  });

  it('produces a different token each call (cryptographic randomness)', async () => {
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreate.mockResolvedValue({});

    const a = await createEmailVerificationToken('user@example.com');
    const b = await createEmailVerificationToken('user@example.com');
    expect(a).not.toBe(b);
  });
});

describe('createPasswordResetToken', () => {
  it('namespaces the identifier with the "pr:" prefix', async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });
    mockCreate.mockResolvedValueOnce({});

    await createPasswordResetToken('user@example.com');

    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { identifier: 'pr:user@example.com' } });
    const arg = mockCreate.mock.calls[0]![0];
    expect(arg.data.identifier).toBe('pr:user@example.com');
  });
});

describe('consumeEmailVerificationToken', () => {
  it('returns true and deletes the row on a valid, unexpired token', async () => {
    const future = new Date(Date.now() + 60_000);
    mockFindUnique.mockResolvedValueOnce({
      identifier: 'user@example.com',
      token: 'tok',
      expires: future,
    });
    mockDelete.mockResolvedValueOnce({});

    const ok = await consumeEmailVerificationToken('tok', 'user@example.com');

    expect(ok).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: 'user@example.com', token: 'tok' } },
    });
  });

  it('returns false and does NOT delete when no matching row exists', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const ok = await consumeEmailVerificationToken('tok', 'user@example.com');
    expect(ok).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('returns false and deletes the row when the token is expired (one-shot cleanup)', async () => {
    const past = new Date(Date.now() - 60_000);
    mockFindUnique.mockResolvedValueOnce({
      identifier: 'user@example.com',
      token: 'tok',
      expires: past,
    });
    mockDelete.mockResolvedValueOnce({});

    const ok = await consumeEmailVerificationToken('tok', 'user@example.com');

    expect(ok).toBe(false);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});

describe('consumePasswordResetToken', () => {
  it('uses the namespaced identifier and returns true on valid', async () => {
    const future = new Date(Date.now() + 60_000);
    mockFindUnique.mockResolvedValueOnce({
      identifier: 'pr:user@example.com',
      token: 'tok',
      expires: future,
    });
    mockDelete.mockResolvedValueOnce({});

    const ok = await consumePasswordResetToken('tok', 'user@example.com');

    expect(ok).toBe(true);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: 'pr:user@example.com', token: 'tok' } },
    });
    expect(mockDelete).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: 'pr:user@example.com', token: 'tok' } },
    });
  });

  it('returns false but still deletes the row when the token has expired (single-use)', async () => {
    const past = new Date(Date.now() - 60_000);
    mockFindUnique.mockResolvedValueOnce({
      identifier: 'pr:user@example.com',
      token: 'tok',
      expires: past,
    });
    mockDelete.mockResolvedValueOnce({});

    const ok = await consumePasswordResetToken('tok', 'user@example.com');

    expect(ok).toBe(false);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it('returns false when no matching row exists, without deleting', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const ok = await consumePasswordResetToken('tok', 'user@example.com');
    expect(ok).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
