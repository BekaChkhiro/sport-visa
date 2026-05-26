import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test', NEXT_PUBLIC_APP_URL: 'https://app.sportvisa.io' },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({
      status: init?.status ?? 200,
      headers: new Headers(),
      json: async () => body,
    })),
  },
}));

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock('@/lib/request-context', () => ({
  generateRequestId: vi.fn(() => 'rid'),
  getRequestId: vi.fn(() => null),
  REQUEST_ID_HEADER: 'x-request-id',
  runWithRequestContext: vi.fn((_c: unknown, fn: () => unknown) => fn()),
}));

const mockRequireUser = vi.hoisted(() => vi.fn());
const mockFootballerFind = vi.hoisted(() => vi.fn());
const mockConversationUpsert = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/require-user', () => ({ requireAuthenticatedUser: mockRequireUser }));
vi.mock('@/lib/db', () => ({
  db: {
    footballerProfile: { findUnique: mockFootballerFind },
    conversation: { upsert: mockConversationUpsert },
  },
}));

import { POST } from '@/app/api/conversations/route';

const CLUB_USER = { id: 'club-user', email: 'c@b.com', role: 'CLUB', emailVerified: null };
const FB_USER = { id: 'fb-user', email: 'f@b.com', role: 'FOOTBALLER', emailVerified: null };

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  mockRequireUser.mockReset();
  mockFootballerFind.mockReset();
  mockConversationUpsert.mockReset();
});

describe('POST /api/conversations', () => {
  it('upserts a conversation between the calling club and the footballer', async () => {
    mockRequireUser.mockResolvedValueOnce(CLUB_USER);
    mockFootballerFind.mockResolvedValueOnce({ userId: 'fb-user' });
    mockConversationUpsert.mockResolvedValueOnce({ id: 'conv-1' });

    const res = await POST(jsonRequest({ footballerProfileId: 'fb-profile-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.conversationId).toBe('conv-1');
    expect(mockConversationUpsert).toHaveBeenCalledWith({
      where: {
        clubUserId_footballerUserId: {
          clubUserId: 'club-user',
          footballerUserId: 'fb-user',
        },
      },
      create: { clubUserId: 'club-user', footballerUserId: 'fb-user' },
      update: {},
      select: { id: true },
    });
  });

  it('returns 401 for anonymous callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));
    const res = await POST(jsonRequest({ footballerProfileId: 'fb-profile-1' }));
    expect(res.status).toBe(401);
    expect(mockConversationUpsert).not.toHaveBeenCalled();
  });

  it('returns 403 when caller is a footballer (only clubs can initiate)', async () => {
    mockRequireUser.mockResolvedValueOnce(FB_USER);
    const res = await POST(jsonRequest({ footballerProfileId: 'fb-profile-1' }));
    expect(res.status).toBe(403);
    expect(mockFootballerFind).not.toHaveBeenCalled();
    expect(mockConversationUpsert).not.toHaveBeenCalled();
  });

  it('returns 422 when footballerProfileId is missing', async () => {
    mockRequireUser.mockResolvedValueOnce(CLUB_USER);
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(422);
    expect(mockConversationUpsert).not.toHaveBeenCalled();
  });

  it('returns 422 when footballerProfileId is empty', async () => {
    mockRequireUser.mockResolvedValueOnce(CLUB_USER);
    const res = await POST(jsonRequest({ footballerProfileId: '' }));
    expect(res.status).toBe(422);
    expect(mockConversationUpsert).not.toHaveBeenCalled();
  });

  it('returns 422 when the JSON body is invalid', async () => {
    mockRequireUser.mockResolvedValueOnce(CLUB_USER);
    const res = await POST(jsonRequest('not-json'));
    expect(res.status).toBe(422);
  });

  it('returns 404 when the footballer profile does not exist', async () => {
    mockRequireUser.mockResolvedValueOnce(CLUB_USER);
    mockFootballerFind.mockResolvedValueOnce(null);
    const res = await POST(jsonRequest({ footballerProfileId: 'missing' }));
    expect(res.status).toBe(404);
    expect(mockConversationUpsert).not.toHaveBeenCalled();
  });

  it('returns the existing conversation when one already exists (idempotent upsert)', async () => {
    mockRequireUser.mockResolvedValueOnce(CLUB_USER);
    mockFootballerFind.mockResolvedValueOnce({ userId: 'fb-user' });
    mockConversationUpsert.mockResolvedValueOnce({ id: 'conv-existing' });

    const res = await POST(jsonRequest({ footballerProfileId: 'fb-profile-1' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.conversationId).toBe('conv-existing');
  });
});
