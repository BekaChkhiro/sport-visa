import { NextResponse } from 'next/server';

import { ApiError, apiHandler } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { authenticateChannel } from '@/lib/pusher';

export const runtime = 'nodejs';

// Pusher sends auth requests as application/x-www-form-urlencoded.
export const POST = apiHandler(async (request: Request) => {
  let socketId: string | undefined;
  let channelName: string | undefined;

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    socketId = params.get('socket_id') ?? undefined;
    channelName = params.get('channel_name') ?? undefined;
  } else {
    // Accept JSON as a fallback (easier to call from server-side tests).
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError('BAD_REQUEST', 'Request body must be valid JSON or form-encoded');
    }
    if (typeof body === 'object' && body !== null) {
      socketId = (body as Record<string, string>).socket_id;
      channelName = (body as Record<string, string>).channel_name;
    }
  }

  if (!socketId || !channelName) {
    throw new ApiError('BAD_REQUEST', 'socket_id and channel_name are required');
  }

  // TODO(T3): Replace this placeholder with a real session check once auth
  // (NextAuth) lands in T1.3/T3. For now the route returns a valid token for
  // any authenticated request — guarding by session will be added there.
  // Private channel names are validated by Pusher server-side; the app just
  // needs to decide whether the caller is allowed to subscribe.
  const userId = 'placeholder-user';

  logger.debug({ socketId, channelName, userId }, 'pusher_channel_auth');

  const authPayload = authenticateChannel(socketId, channelName, { user_id: userId });

  // Return raw JSON string parsed back to object so Next.js serialises it correctly.
  return NextResponse.json(JSON.parse(authPayload) as Record<string, unknown>);
});
