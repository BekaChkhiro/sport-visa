import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiError, apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { logger } from '@/lib/logger';
import {
  listMessages,
  MESSAGE_BODY_MAX,
  requireParticipantConversation,
  sendMessage,
} from '@/lib/messages';

export const runtime = 'nodejs';

const sendBodySchema = z.object({
  body: z
    .string()
    .min(1, 'Message body is required')
    .max(MESSAGE_BODY_MAX, `Message body exceeds ${MESSAGE_BODY_MAX} characters`),
});

function serialize(message: {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  attachmentKey: string | null;
  read: boolean;
  createdAt: Date;
}) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderUserId: message.senderUserId,
    body: message.body,
    attachmentKey: message.attachmentKey,
    read: message.read,
    createdAt: message.createdAt.toISOString(),
  };
}

/** GET /api/conversations/[conversationId]/messages — list messages in chronological order. */
export const GET = apiHandler(async (_request: Request, ...args: unknown[]) => {
  const user = await requireAuthenticatedUser();

  const context = args[0] as { params: Promise<{ conversationId: string }> };
  const { conversationId } = await context.params;

  await requireParticipantConversation(conversationId, user.id);
  const messages = await listMessages(conversationId);

  return NextResponse.json({ messages: messages.map(serialize) }, { status: 200 });
});

/** POST /api/conversations/[conversationId]/messages — send a new message in the thread. */
export const POST = apiHandler(async (request: Request, ...args: unknown[]) => {
  const user = await requireAuthenticatedUser();

  const context = args[0] as { params: Promise<{ conversationId: string }> };
  const { conversationId } = await context.params;

  const raw = await request.json().catch(() => null);
  const parsed = sendBodySchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError('VALIDATION', 'Invalid request body', {
      details: parsed.error.flatten(),
    });
  }

  const message = await sendMessage({
    conversationId,
    senderUserId: user.id,
    body: parsed.data.body,
  });

  logger.info(
    { conversationId, senderUserId: user.id, messageId: message.id },
    'chat_message_sent',
  );

  return NextResponse.json({ message: serialize(message) }, { status: 201 });
});
