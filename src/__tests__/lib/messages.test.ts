import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    PUSHER_APP_ID: 'app-id',
    PUSHER_KEY: 'key-123',
    PUSHER_SECRET: 'secret-456',
    PUSHER_CLUSTER: 'eu',
  },
}));
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockTrigger = vi.hoisted(() => vi.fn());
vi.mock('pusher', () => ({
  default: vi.fn(function () {
    return { trigger: mockTrigger, authorizeChannel: vi.fn() };
  }),
}));

const mockConversationFind = vi.hoisted(() => vi.fn());
const mockConversationUpdate = vi.hoisted(() => vi.fn());
const mockMessageCreate = vi.hoisted(() => vi.fn());
const mockMessageFindMany = vi.hoisted(() => vi.fn());
const mockMessageUpdateMany = vi.hoisted(() => vi.fn());
const mockNotificationCreate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: {
    conversation: {
      findUnique: mockConversationFind,
      update: mockConversationUpdate,
    },
    message: {
      create: mockMessageCreate,
      findMany: mockMessageFindMany,
      updateMany: mockMessageUpdateMany,
    },
    notification: { create: mockNotificationCreate },
  },
}));

import {
  listMessages,
  markConversationRead,
  requireParticipantConversation,
  sendMessage,
} from '@/lib/messages';

const CONVERSATION = {
  id: 'conv-1',
  clubUserId: 'club-user',
  footballerUserId: 'footballer-user',
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

beforeEach(() => {
  mockConversationFind.mockReset();
  mockConversationUpdate.mockReset();
  mockMessageCreate.mockReset();
  mockMessageFindMany.mockReset();
  mockMessageUpdateMany.mockReset();
  mockNotificationCreate.mockReset();
  mockTrigger.mockReset();
});

describe('requireParticipantConversation', () => {
  it('returns the row when the caller is the club participant', async () => {
    mockConversationFind.mockResolvedValueOnce(CONVERSATION);
    const result = await requireParticipantConversation('conv-1', 'club-user');
    expect(result).toEqual(CONVERSATION);
  });

  it('returns the row when the caller is the footballer participant', async () => {
    mockConversationFind.mockResolvedValueOnce(CONVERSATION);
    const result = await requireParticipantConversation('conv-1', 'footballer-user');
    expect(result).toEqual(CONVERSATION);
  });

  it('throws NOT_FOUND when no conversation exists', async () => {
    mockConversationFind.mockResolvedValueOnce(null);
    await expect(requireParticipantConversation('missing', 'club-user')).rejects.toBeInstanceOf(
      ApiError,
    );
    await expect(
      requireParticipantConversation('missing', 'club-user').catch((e) => e),
    ).resolves.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws NOT_FOUND (not FORBIDDEN) when caller is unrelated to hide existence', async () => {
    mockConversationFind.mockResolvedValueOnce(CONVERSATION);
    const err = await requireParticipantConversation('conv-1', 'stranger').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('NOT_FOUND');
  });
});

describe('listMessages', () => {
  it('orders messages chronologically', async () => {
    mockMessageFindMany.mockResolvedValueOnce([MESSAGE_ROW]);
    await listMessages('conv-1');
    expect(mockMessageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { conversationId: 'conv-1' },
        orderBy: { createdAt: 'asc' },
        take: 200,
      }),
    );
  });

  it('respects the provided limit', async () => {
    mockMessageFindMany.mockResolvedValueOnce([]);
    await listMessages('conv-1', 25);
    expect(mockMessageFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 25 }));
  });
});

describe('markConversationRead', () => {
  it('marks unread messages from the OTHER participant as read', async () => {
    mockMessageUpdateMany.mockResolvedValueOnce({ count: 2 });
    const count = await markConversationRead('conv-1', 'footballer-user');
    expect(count).toBe(2);
    expect(mockMessageUpdateMany).toHaveBeenCalledWith({
      where: {
        conversationId: 'conv-1',
        senderUserId: { not: 'footballer-user' },
        read: false,
      },
      data: { read: true },
    });
  });
});

describe('sendMessage', () => {
  it('persists the message, touches the conversation, and broadcasts on Pusher', async () => {
    mockConversationFind.mockResolvedValueOnce(CONVERSATION);
    mockMessageCreate.mockResolvedValueOnce(MESSAGE_ROW);
    mockConversationUpdate.mockResolvedValueOnce(undefined);
    mockTrigger.mockResolvedValueOnce(undefined);
    mockNotificationCreate.mockResolvedValueOnce(undefined);

    const result = await sendMessage({
      conversationId: 'conv-1',
      senderUserId: 'club-user',
      body: 'hello',
    });

    expect(result).toEqual(MESSAGE_ROW);
    expect(mockMessageCreate).toHaveBeenCalledWith({
      data: { conversationId: 'conv-1', senderUserId: 'club-user', body: 'hello' },
    });
    expect(mockConversationUpdate).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: { updatedAt: MESSAGE_ROW.createdAt },
    });
    expect(mockTrigger).toHaveBeenCalledWith(
      'private-chat.club-user.footballer-user',
      'new-message',
      expect.objectContaining({ id: 'msg-1', body: 'hello' }),
    );
  });

  it('creates a NEW_MESSAGE notification for the recipient (not the sender)', async () => {
    mockConversationFind.mockResolvedValueOnce(CONVERSATION);
    mockMessageCreate.mockResolvedValueOnce(MESSAGE_ROW);
    mockConversationUpdate.mockResolvedValueOnce(undefined);
    mockTrigger.mockResolvedValueOnce(undefined);
    mockNotificationCreate.mockResolvedValueOnce(undefined);

    await sendMessage({ conversationId: 'conv-1', senderUserId: 'club-user', body: 'hi' });

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'footballer-user', type: 'NEW_MESSAGE' }),
    });
  });

  it('rejects empty (whitespace-only) bodies', async () => {
    const err = await sendMessage({
      conversationId: 'conv-1',
      senderUserId: 'club-user',
      body: '   ',
    }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('VALIDATION');
    expect(mockMessageCreate).not.toHaveBeenCalled();
  });

  it('rejects bodies above the 2000-character limit', async () => {
    const tooLong = 'x'.repeat(2001);
    const err = await sendMessage({
      conversationId: 'conv-1',
      senderUserId: 'club-user',
      body: tooLong,
    }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('VALIDATION');
    expect(mockMessageCreate).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when the caller is not a participant', async () => {
    mockConversationFind.mockResolvedValueOnce(CONVERSATION);
    const err = await sendMessage({
      conversationId: 'conv-1',
      senderUserId: 'stranger',
      body: 'hello',
    }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('NOT_FOUND');
    expect(mockMessageCreate).not.toHaveBeenCalled();
  });

  it('returns the row even when the Pusher broadcast fails (fire-and-forget)', async () => {
    mockConversationFind.mockResolvedValueOnce(CONVERSATION);
    mockMessageCreate.mockResolvedValueOnce(MESSAGE_ROW);
    mockConversationUpdate.mockResolvedValueOnce(undefined);
    mockTrigger.mockRejectedValueOnce(new Error('pusher down'));
    mockNotificationCreate.mockResolvedValueOnce(undefined);

    const result = await sendMessage({
      conversationId: 'conv-1',
      senderUserId: 'club-user',
      body: 'hello',
    });
    expect(result).toEqual(MESSAGE_ROW);
  });

  it('trims whitespace from the body before persisting', async () => {
    mockConversationFind.mockResolvedValueOnce(CONVERSATION);
    mockMessageCreate.mockResolvedValueOnce({ ...MESSAGE_ROW, body: 'hello' });
    mockConversationUpdate.mockResolvedValueOnce(undefined);
    mockTrigger.mockResolvedValueOnce(undefined);
    mockNotificationCreate.mockResolvedValueOnce(undefined);

    await sendMessage({
      conversationId: 'conv-1',
      senderUserId: 'club-user',
      body: '   hello   ',
    });
    expect(mockMessageCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ body: 'hello' }),
    });
  });
});
