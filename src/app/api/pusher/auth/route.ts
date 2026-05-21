import { NextResponse } from 'next/server';

import { ApiError, apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { logger } from '@/lib/logger';
import { authenticateChannel, isChannelAllowedForUser } from '@/lib/pusher';

export const runtime = 'nodejs';

// Pusher sends auth requests as application/x-www-form-urlencoded.
export const POST = apiHandler(async (request: Request) => {
  const user = await requireAuthenticatedUser();

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

  if (!isChannelAllowedForUser(channelName, user.id)) {
    logger.warn({ userId: user.id, channelName }, 'pusher_channel_auth_forbidden');
    throw new ApiError('FORBIDDEN', 'Caller is not allowed on this channel');
  }

  logger.debug({ socketId, channelName, userId: user.id }, 'pusher_channel_auth');

  const authPayload = authenticateChannel(socketId, channelName, { user_id: user.id });

  // Return raw JSON string parsed back to object so Next.js serialises it correctly.
  return NextResponse.json(JSON.parse(authPayload) as Record<string, unknown>);
});
