import Pusher from 'pusher';

import { ApiError } from './api-error';
import { env } from './env';

type PusherConfig = {
  appId: string;
  key: string;
  secret: string;
  cluster: string;
};

function getPusherConfig(): PusherConfig {
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    throw new ApiError(
      'INTERNAL',
      'Pusher is not configured — set PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER',
    );
  }
  return { appId: PUSHER_APP_ID, key: PUSHER_KEY, secret: PUSHER_SECRET, cluster: PUSHER_CLUSTER };
}

let cachedPusher: Pusher | undefined;

function getPusherServer(): Pusher {
  if (cachedPusher) return cachedPusher;
  const cfg = getPusherConfig();
  cachedPusher = new Pusher({
    appId: cfg.appId,
    key: cfg.key,
    secret: cfg.secret,
    cluster: cfg.cluster,
    useTLS: true,
  });
  return cachedPusher;
}

/** Trigger a Pusher event on one or more channels. */
export async function triggerEvent(
  channel: string | string[],
  event: string,
  data: unknown,
): Promise<void> {
  await getPusherServer().trigger(channel, event, data);
}

/**
 * Authenticate a private or presence channel subscription.
 * Called by the /api/pusher/auth route after the server verifies the user's
 * identity. `userData` is only required for presence channels.
 */
export function authenticateChannel(
  socketId: string,
  channelName: string,
  userData?: { user_id: string; user_info?: Record<string, unknown> },
): string {
  const pusher = getPusherServer();
  if (channelName.startsWith('presence-')) {
    if (!userData) {
      throw new ApiError('BAD_REQUEST', 'Presence channels require user data for authentication');
    }
    const auth = pusher.authorizeChannel(socketId, channelName, {
      user_id: userData.user_id,
      user_info: userData.user_info ?? {},
    });
    return JSON.stringify(auth);
  }
  const auth = pusher.authorizeChannel(socketId, channelName);
  return JSON.stringify(auth);
}

// Channel naming conventions used across the app.
// Centralised here so feature code never hard-codes channel strings.
export const channels = {
  /** Private channel for direct messages between two users (sorted IDs). */
  chat: (userAId: string, userBId: string): string => {
    const [a, b] = [userAId, userBId].sort();
    return `private-chat.${a}.${b}`;
  },
  /** Private channel for a single user's notifications feed. */
  userNotifications: (userId: string): string => `private-user.${userId}.notifications`,
  /** Public channel for a club's newsfeed updates (no auth required to read). */
  clubFeed: (clubId: string): string => `club-feed.${clubId}`,
} as const;

// Canonical event names. Feature code imports these instead of bare strings.
export const events = {
  NEW_MESSAGE: 'new-message',
  NOTIFICATION: 'notification',
  POST_PUBLISHED: 'post-published',
} as const;
