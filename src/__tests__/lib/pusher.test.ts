import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    PUSHER_APP_ID: 'app-id',
    PUSHER_KEY: 'key-123',
    PUSHER_SECRET: 'secret-456',
    PUSHER_CLUSTER: 'eu',
  },
}));

vi.mock('next/server', () => ({ NextResponse: { json: vi.fn() } }));
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

const mockAuthorizeChannel = vi.hoisted(() => vi.fn());
const mockTrigger = vi.hoisted(() => vi.fn());

vi.mock('pusher', () => ({
  default: vi.fn(function () {
    return { authorizeChannel: mockAuthorizeChannel, trigger: mockTrigger };
  }),
}));

import { ApiError } from '@/lib/api-error';
import {
  authenticateChannel,
  channels,
  events,
  isChannelAllowedForUser,
  triggerEvent,
} from '@/lib/pusher';

describe('channels', () => {
  it('chat sorts user IDs lexicographically', () => {
    expect(channels.chat('z-user', 'a-user')).toBe('private-chat.a-user.z-user');
  });

  it('chat is commutative regardless of argument order', () => {
    expect(channels.chat('u1', 'u2')).toBe(channels.chat('u2', 'u1'));
  });

  it('userNotifications returns private-user.<id>.notifications', () => {
    expect(channels.userNotifications('uid-42')).toBe('private-user.uid-42.notifications');
  });

  it('clubFeed returns club-feed.<id>', () => {
    expect(channels.clubFeed('club-99')).toBe('club-feed.club-99');
  });
});

describe('events', () => {
  it('NEW_MESSAGE is new-message', () => {
    expect(events.NEW_MESSAGE).toBe('new-message');
  });

  it('NOTIFICATION is notification', () => {
    expect(events.NOTIFICATION).toBe('notification');
  });

  it('POST_PUBLISHED is post-published', () => {
    expect(events.POST_PUBLISHED).toBe('post-published');
  });
});

describe('authenticateChannel', () => {
  it('returns a JSON auth token for a private channel', () => {
    mockAuthorizeChannel.mockReturnValue({ auth: 'app-id:signature' });
    const result = authenticateChannel('123.456', 'private-chat.a.b');
    expect(JSON.parse(result)).toEqual({ auth: 'app-id:signature' });
  });

  it('passes user data when authorising a presence channel', () => {
    mockAuthorizeChannel.mockReturnValue({ auth: 'sig', channel_data: '{"user_id":"u1"}' });
    authenticateChannel('123.456', 'presence-room', { user_id: 'u1' });
    expect(mockAuthorizeChannel).toHaveBeenCalledWith(
      '123.456',
      'presence-room',
      expect.objectContaining({ user_id: 'u1' }),
    );
  });

  it('throws BAD_REQUEST for a presence channel without user data', () => {
    expect(() => authenticateChannel('123.456', 'presence-room')).toThrow(ApiError);
  });
});

describe('isChannelAllowedForUser', () => {
  it('allows a participant on a private chat channel', () => {
    expect(isChannelAllowedForUser('private-chat.alice.bob', 'alice')).toBe(true);
    expect(isChannelAllowedForUser('private-chat.alice.bob', 'bob')).toBe(true);
  });

  it('denies a non-participant on a private chat channel', () => {
    expect(isChannelAllowedForUser('private-chat.alice.bob', 'carol')).toBe(false);
  });

  it('allows only the owning user on a private-user channel', () => {
    expect(isChannelAllowedForUser('private-user.uid-1.notifications', 'uid-1')).toBe(true);
    expect(isChannelAllowedForUser('private-user.uid-1.notifications', 'uid-2')).toBe(false);
  });

  it('does not match a prefix of a different userId', () => {
    expect(isChannelAllowedForUser('private-user.uid-12.notifications', 'uid-1')).toBe(false);
  });

  it('allows any authenticated user on presence channels', () => {
    expect(isChannelAllowedForUser('presence-lobby', 'anyone')).toBe(true);
  });

  it('denies unknown / public channels (auth route should not be hit for them)', () => {
    expect(isChannelAllowedForUser('club-feed.club-1', 'uid-1')).toBe(false);
    expect(isChannelAllowedForUser('weird-channel', 'uid-1')).toBe(false);
  });
});

describe('triggerEvent', () => {
  it('delegates to the Pusher SDK trigger method', async () => {
    mockTrigger.mockResolvedValueOnce({});
    await triggerEvent('club-feed.x', 'post-published', { postId: '123' });
    expect(mockTrigger).toHaveBeenCalledWith('club-feed.x', 'post-published', { postId: '123' });
  });
});
