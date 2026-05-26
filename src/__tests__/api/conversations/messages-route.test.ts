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
const mockSendMessage = vi.hoisted(() => vi.fn());
const mockListMessages = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/require-user', () => ({ requireAuthenticatedUser: mockRequireUser }));
vi.mock('@/lib/messages', () => ({
  requireParticipantConversation: mockRequireParticipant,
  sendMessage: mockSendMessage,
  listMessages: mockListMessages,
  MESSAGE_BODY_MAX: 2000,
}));

import { GET, POST } from '@/app/api/conversations/[conversationId]/messages/route';

const SESSION_USER = {
  id: 'club-user',
  email: 'c@b.com',
  role: 'CLUB',
  emailVerified: null,
};

const MESSAGE_ROW = {
  id: 'msg-1',
  conversationId: 'conv-1',
  senderUserId: 'club-user',
  body: 'hello',
  attachmentKey: null,
  read: false,
  createdAt: new Date('2026-05-26T10:00:00Z'),
};

function paramsFor(conversationId: string) {
  return { params: Promise.resolve({ conversationId }) };
}

beforeEach(() => {
  mockRequireUser.mockReset();
  mockRequireParticipant.mockReset();
  mockSendMessage.mockReset();
  mockListMessages.mockReset();
});

describe('GET /api/conversations/[conversationId]/messages', () => {
  it('returns serialized messages for participants', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockRequireParticipant.mockResolvedValueOnce({
      id: 'conv-1',
      clubUserId: 'club-user',
      footballerUserId: 'fb-user',
    });
    mockListMessages.mockResolvedValueOnce([MESSAGE_ROW]);

    const req = new Request('http://localhost/api/conversations/conv-1/messages');
    const res = await GET(req, paramsFor('conv-1'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].createdAt).toBe('2026-05-26T10:00:00.000Z');
    expect(mockListMessages).toHaveBeenCalledWith('conv-1');
  });

  it('returns 401 for anonymous callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));
    const req = new Request('http://localhost/api/conversations/conv-1/messages');
    const res = await GET(req, paramsFor('conv-1'));
    expect(res.status).toBe(401);
    expect(mockListMessages).not.toHaveBeenCalled();
  });

  it('returns 404 when caller is not a participant', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockRequireParticipant.mockRejectedValueOnce(
      new ApiError('NOT_FOUND', 'Conversation not found'),
    );
    const req = new Request('http://localhost/api/conversations/conv-1/messages');
    const res = await GET(req, paramsFor('conv-1'));
    expect(res.status).toBe(404);
    expect(mockListMessages).not.toHaveBeenCalled();
  });
});

describe('POST /api/conversations/[conversationId]/messages', () => {
  it('persists a message and returns 201', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockSendMessage.mockResolvedValueOnce(MESSAGE_ROW);

    const req = new Request('http://localhost/api/conversations/conv-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'hello' }),
    });
    const res = await POST(req, paramsFor('conv-1'));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.message.id).toBe('msg-1');
    expect(mockSendMessage).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      senderUserId: 'club-user',
      body: 'hello',
    });
  });

  it('returns 422 when body is empty', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const req = new Request('http://localhost/api/conversations/conv-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: '' }),
    });
    const res = await POST(req, paramsFor('conv-1'));
    expect(res.status).toBe(422);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('returns 422 when body exceeds 2000 chars', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const req = new Request('http://localhost/api/conversations/conv-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'x'.repeat(2001) }),
    });
    const res = await POST(req, paramsFor('conv-1'));
    expect(res.status).toBe(422);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('returns 422 when JSON is invalid', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    const req = new Request('http://localhost/api/conversations/conv-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req, paramsFor('conv-1'));
    expect(res.status).toBe(422);
  });

  it('returns 401 for anonymous callers', async () => {
    mockRequireUser.mockRejectedValueOnce(new ApiError('UNAUTHORIZED', 'Authentication required'));
    const req = new Request('http://localhost/api/conversations/conv-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'hello' }),
    });
    const res = await POST(req, paramsFor('conv-1'));
    expect(res.status).toBe(401);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('returns 404 when caller is not a participant', async () => {
    mockRequireUser.mockResolvedValueOnce(SESSION_USER);
    mockSendMessage.mockRejectedValueOnce(new ApiError('NOT_FOUND', 'Conversation not found'));

    const req = new Request('http://localhost/api/conversations/conv-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'hello' }),
    });
    const res = await POST(req, paramsFor('conv-1'));
    expect(res.status).toBe(404);
  });
});
