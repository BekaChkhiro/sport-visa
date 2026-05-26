import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

const mockPostCount = vi.hoisted(() => vi.fn());
const mockPostFindUnique = vi.hoisted(() => vi.fn());
const mockPostFindMany = vi.hoisted(() => vi.fn());
const mockPostDelete = vi.hoisted(() => vi.fn());
const mockConvCount = vi.hoisted(() => vi.fn());
const mockConvFindUnique = vi.hoisted(() => vi.fn());
const mockConvFindMany = vi.hoisted(() => vi.fn());
const mockConvDelete = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    clubPost: {
      count: mockPostCount,
      findUnique: mockPostFindUnique,
      findMany: mockPostFindMany,
      delete: mockPostDelete,
    },
    conversation: {
      count: mockConvCount,
      findUnique: mockConvFindUnique,
      findMany: mockConvFindMany,
      delete: mockConvDelete,
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
  listPosts,
  deletePost,
  listConversations,
  deleteConversation,
} from '@/lib/admin/moderation/actions';

const adminSession = { user: { id: 'admin-1', role: 'ADMIN' } };
const nonAdminSession = { user: { id: 'u2', role: 'FOOTBALLER' } };

beforeEach(() => {
  mockAuth.mockReset();
  mockPostCount.mockReset();
  mockPostFindUnique.mockReset();
  mockPostFindMany.mockReset();
  mockPostDelete.mockReset();
  mockConvCount.mockReset();
  mockConvFindUnique.mockReset();
  mockConvFindMany.mockReset();
  mockConvDelete.mockReset();
});

// ── listPosts ─────────────────────────────────────────────────────────────────

describe('listPosts', () => {
  it('throws when not admin', async () => {
    mockAuth.mockResolvedValueOnce(nonAdminSession);
    await expect(listPosts({})).rejects.toThrow();
  });

  it('applies query filter on title and club name (OR) when query provided', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPostCount.mockResolvedValueOnce(0);
    mockPostFindMany.mockResolvedValueOnce([]);
    await listPosts({ query: 'test' });
    expect(mockPostFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { club: { name: { contains: 'test', mode: 'insensitive' } } },
          ],
        },
      }),
    );
  });

  it('uses empty where when no query provided', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPostCount.mockResolvedValueOnce(0);
    mockPostFindMany.mockResolvedValueOnce([]);
    await listPosts({});
    expect(mockPostFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });

  it('returns correct pageCount', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPostCount.mockResolvedValueOnce(25);
    mockPostFindMany.mockResolvedValueOnce([]);
    const result = await listPosts({ page: 1, pageSize: 10 });
    expect(result.total).toBe(25);
    expect(result.pageCount).toBe(3);
  });

  it('maps rows correctly: bodyPreview truncated at 120 chars with ellipsis, likeCount from _count.likes', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const row = {
      id: 'p1',
      title: 'Test Post',
      body: 'A'.repeat(130),
      createdAt: new Date('2026-05-01'),
      club: { id: 'c1', name: 'FC Test' },
      _count: { likes: 5 },
    };
    mockPostCount.mockResolvedValueOnce(1);
    mockPostFindMany.mockResolvedValueOnce([row]);
    const result = await listPosts({});
    const item = result.items[0]!;
    expect(item.id).toBe('p1');
    expect(item.title).toBe('Test Post');
    expect(item.bodyPreview).toBe('A'.repeat(120) + '…');
    expect(item.clubId).toBe('c1');
    expect(item.clubName).toBe('FC Test');
    expect(item.likeCount).toBe(5);
    expect(item.createdAt).toBe(new Date('2026-05-01').toISOString());
  });
});

// ── deletePost ────────────────────────────────────────────────────────────────

describe('deletePost', () => {
  it('returns error when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await deletePost({ postId: 'p1' });
    expect(result.status).toBe('error');
    expect(mockPostDelete).not.toHaveBeenCalled();
  });

  it('returns error when postId missing', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const result = await deletePost({});
    expect(result.status).toBe('error');
    expect(mockPostDelete).not.toHaveBeenCalled();
  });

  it('returns error when post not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPostFindUnique.mockResolvedValueOnce(null);
    const result = await deletePost({ postId: 'nonexistent' });
    expect(result.status).toBe('error');
    expect(mockPostDelete).not.toHaveBeenCalled();
  });

  it('calls db.clubPost.delete with correct id and returns success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPostFindUnique.mockResolvedValueOnce({ id: 'p1', title: 'Test Post', clubId: 'c1' });
    mockPostDelete.mockResolvedValueOnce({ id: 'p1' });
    const result = await deletePost({ postId: 'p1' });
    expect(result.status).toBe('success');
    expect(mockPostDelete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });
});

// ── listConversations ─────────────────────────────────────────────────────────

describe('listConversations', () => {
  it('throws when not admin', async () => {
    mockAuth.mockResolvedValueOnce(nonAdminSession);
    await expect(listConversations({})).rejects.toThrow();
  });

  it('applies query filter on club/footballer email, club name, and footballer first/last name', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockConvCount.mockResolvedValueOnce(0);
    mockConvFindMany.mockResolvedValueOnce([]);
    await listConversations({ query: 'giorgi' });
    expect(mockConvFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { clubUser: { email: { contains: 'giorgi', mode: 'insensitive' } } },
            { footballerUser: { email: { contains: 'giorgi', mode: 'insensitive' } } },
            { clubUser: { clubProfile: { name: { contains: 'giorgi', mode: 'insensitive' } } } },
            {
              footballerUser: {
                footballerProfile: {
                  OR: [
                    { firstName: { contains: 'giorgi', mode: 'insensitive' } },
                    { lastName: { contains: 'giorgi', mode: 'insensitive' } },
                  ],
                },
              },
            },
          ],
        },
      }),
    );
  });

  it('maps rows correctly: footballerName = firstName + lastName, null when no profile', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const row = {
      id: 'conv1',
      createdAt: new Date('2026-05-01'),
      updatedAt: new Date('2026-05-01'),
      clubUser: { email: 'club@test.ge', clubProfile: { name: 'FC Test' } },
      footballerUser: { email: 'f@test.ge', footballerProfile: { firstName: 'გ', lastName: 'მ' } },
      _count: { messages: 3 },
      messages: [{ createdAt: new Date('2026-05-20') }],
    };
    mockConvCount.mockResolvedValueOnce(1);
    mockConvFindMany.mockResolvedValueOnce([row]);
    const result = await listConversations({});
    const item = result.items[0]!;
    expect(item.id).toBe('conv1');
    expect(item.clubUserEmail).toBe('club@test.ge');
    expect(item.clubName).toBe('FC Test');
    expect(item.footballerUserEmail).toBe('f@test.ge');
    expect(item.footballerName).toBe('გ მ');
    expect(item.messageCount).toBe(3);
    expect(item.lastMessageAt).toBe(new Date('2026-05-20').toISOString());
    expect(item.createdAt).toBe(new Date('2026-05-01').toISOString());
  });

  it('sets footballerName to null when footballerProfile is absent', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const row = {
      id: 'conv2',
      createdAt: new Date('2026-05-01'),
      updatedAt: new Date('2026-05-01'),
      clubUser: { email: 'club@test.ge', clubProfile: null },
      footballerUser: { email: 'f@test.ge', footballerProfile: null },
      _count: { messages: 0 },
      messages: [],
    };
    mockConvCount.mockResolvedValueOnce(1);
    mockConvFindMany.mockResolvedValueOnce([row]);
    const result = await listConversations({});
    const item = result.items[0]!;
    expect(item.footballerName).toBeNull();
    expect(item.clubName).toBeNull();
    expect(item.lastMessageAt).toBeNull();
  });
});

// ── deleteConversation ────────────────────────────────────────────────────────

describe('deleteConversation', () => {
  it('returns error when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await deleteConversation({ conversationId: 'conv1' });
    expect(result.status).toBe('error');
    expect(mockConvDelete).not.toHaveBeenCalled();
  });

  it('returns error when conversationId missing', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const result = await deleteConversation({});
    expect(result.status).toBe('error');
    expect(mockConvDelete).not.toHaveBeenCalled();
  });

  it('returns error when conversation not found', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockConvFindUnique.mockResolvedValueOnce(null);
    const result = await deleteConversation({ conversationId: 'nonexistent' });
    expect(result.status).toBe('error');
    expect(mockConvDelete).not.toHaveBeenCalled();
  });

  it('calls db.conversation.delete with correct id and returns success', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockConvFindUnique.mockResolvedValueOnce({
      id: 'conv1',
      clubUserId: 'club-user-1',
      footballerUserId: 'footballer-user-1',
    });
    mockConvDelete.mockResolvedValueOnce({ id: 'conv1' });
    const result = await deleteConversation({ conversationId: 'conv1' });
    expect(result.status).toBe('success');
    expect(mockConvDelete).toHaveBeenCalledWith({ where: { id: 'conv1' } });
  });
});
