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
const mockRequireParticipant = vi.hoisted(() => vi.fn());
const mockMarkRead = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/require-user', () => ({ requireAuthenticatedUser: mockRequireUser }));
vi.mock('@/lib/messages', () => ({
  requireParticipantConversation: mockRequireParticipant,
  markConversationRead: mockMarkRead,
}));

import { POST } from '@/app/api/conversations/[conversationId]/read/route';

const SESSION_USER = {
  id: 'fb-user',
  email: 'fb@test.com',
  role: 'FOOTBALLER',
  emailVerified: null,
};

function paramsFor(conversationId: string) {
  return { params: Promise.resolve({ conversationId }) };
}

beforeEach(() => {
  mockRequireUser.mockReset();
  mockRequireParticipant.mockReset();
  mockMarkRead.mockReset();
});

describe('POST /api/conversations/[conversationId]/read', () => {
  it('marks messages as read and returns the count', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockRequireParticipant.mockResolvedValueOnce({
      id: 'conv-1',
      clubUserId: 'club-user',
      footballerUserId: 'fb-user',
    });
    mockMarkRead.mockResolvedValueOnce(3);

    const req = new Request('http://localhost/api/conversations/conv-1/read', {
      method: 'POST',
    });
    const res = await POST(req, paramsFor('conv-1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(3);
    expect(mockMarkRead).toHaveBeenCalledWith('conv-1', SESSION_USER.id);
  });

  it('returns 401 for anonymous callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));

    const req = new Request('http://localhost/api/conversations/conv-1/read', { method: 'POST' });
    const res = await POST(req, paramsFor('conv-1'));
    expect(res.status).toBe(401);
    expect(mockMarkRead).not.toHaveBeenCalled();
  });

  it('returns 404 when the caller is not a participant', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockRequireParticipant.mockRejectedValueOnce(
      new ApiError('NOT_FOUND', 'Conversation not found'),
    );

    const req = new Request('http://localhost/api/conversations/conv-1/read', { method: 'POST' });
    const res = await POST(req, paramsFor('conv-1'));
    expect(res.status).toBe(404);
    expect(mockMarkRead).not.toHaveBeenCalled();
  });

  it('returns 0 when there are no unread messages', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockRequireParticipant.mockResolvedValueOnce({
      id: 'conv-1',
      clubUserId: 'club-user',
      footballerUserId: 'fb-user',
    });
    mockMarkRead.mockResolvedValueOnce(0);

    const req = new Request('http://localhost/api/conversations/conv-1/read', { method: 'POST' });
    const res = await POST(req, paramsFor('conv-1'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.count).toBe(0);
  });
});
