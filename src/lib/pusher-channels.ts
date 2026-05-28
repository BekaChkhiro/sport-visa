// Isomorphic Pusher channel-name + event-name helpers. Pure string builders
// with no client- or server-only dependencies, so BOTH server code (trigger
// calls in pusher.ts / messages.ts / notifications.ts) and client hooks can
// import the real values.
//
// IMPORTANT: this module must NOT carry a 'use client' directive. When server
// code imports from a 'use client' module, Next.js replaces the exports with
// client-reference proxies in the server build, so `channels.chat(...)` would
// throw "channels.chat is not a function" at runtime.

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
