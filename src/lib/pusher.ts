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

/**
 * Returns true if `userId` is allowed to subscribe to `channelName`.
 *
 * The channel namespaces (defined in `channels` below) encode ownership
 * directly into the name, so authorization is purely a string-shape check:
 *   - `private-chat.<a>.<b>` — both participants are listed, sorted; the
 *     caller must be `a` or `b`.
 *   - `private-user.<userId>.<...>` — single-user channels; userId must match.
 *   - `presence-<...>` — any authenticated user may join (their presence
 *     payload identifies them; no cross-user leak).
 *
 * Public channels (no `private-` / `presence-` prefix) do not require auth
 * and should never reach this code path — Pusher only calls the auth route
 * for private/presence subscriptions. Default deny anything unrecognised.
 */
export function isChannelAllowedForUser(channelName: string, userId: string): boolean {
  if (channelName.startsWith('private-chat.')) {
    const parts = channelName.slice('private-chat.'.length).split('.');
    return parts.includes(userId);
  }
  if (channelName.startsWith('private-user.')) {
    const [chanUserId] = channelName.slice('private-user.'.length).split('.');
    return chanUserId === userId;
  }
  if (channelName.startsWith('presence-')) {
    return true;
  }
  return false;
}

// Re-export channel helpers and event names from the client-safe module so
// server code can import them from here without a second source of truth.
export { channels, events } from './pusher-client';
