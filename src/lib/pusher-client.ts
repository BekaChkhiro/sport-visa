'use client';

import PusherJs from 'pusher-js';

// Re-export the isomorphic channel/event helpers so existing client imports
// (hooks, thread-client) keep working. The real definitions live in the
// non-'use client' pusher-channels module so server code gets callable
// functions instead of client-reference proxies.
export { channels, events } from './pusher-channels';

// Singleton Pusher client — one WebSocket connection for the entire browser
// session. Re-creating it on every render would thrash the connection limit.
let pusherClient: PusherJs | undefined;

export function getPusherClient(): PusherJs {
  if (pusherClient) return pusherClient;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error(
      'Pusher is not configured — set NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER',
    );
  }

  pusherClient = new PusherJs(key, {
    cluster,
    // Route private/presence channel auth through our Next.js API route so
    // the server can verify the user's session before signing the token.
    authEndpoint: '/api/pusher/auth',
    authTransport: 'ajax',
  });

  return pusherClient;
}

/** Disconnect and clear the singleton — useful in tests or on sign-out. */
export function disconnectPusherClient(): void {
  pusherClient?.disconnect();
  pusherClient = undefined;
}
