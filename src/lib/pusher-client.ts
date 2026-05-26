'use client';

import PusherJs from 'pusher-js';

// Channel-name helpers shared between the browser SDK and server-side trigger
// calls. Defined here (client-safe module) so client hooks don't need to
// import the server-only pusher.ts, which pulls in node:async_hooks.
export const channels = {
  chat: (userAId: string, userBId: string): string => {
    const [a, b] = [userAId, userBId].sort();
    return `private-chat.${a}.${b}`;
  },
  userNotifications: (userId: string): string => `private-user.${userId}.notifications`,
  clubFeed: (clubId: string): string => `club-feed.${clubId}`,
} as const;

export const events = {
  NEW_MESSAGE: 'new-message',
  MESSAGES_READ: 'messages-read',
  NOTIFICATION: 'notification',
  POST_PUBLISHED: 'post-published',
} as const;

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
