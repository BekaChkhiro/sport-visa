import { NextResponse } from 'next/server';

import { apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { markConversationRead, requireParticipantConversation } from '@/lib/messages';

export const runtime = 'nodejs';

/** POST /api/conversations/[conversationId]/read — mark the caller's unread messages as read. */
export const POST = apiHandler(async (_request: Request, ...args: unknown[]) => {
  const user = await requireAuthenticatedUser();

  const context = args[0] as { params: Promise<{ conversationId: string }> };
  const { conversationId } = await context.params;

  await requireParticipantConversation(conversationId, user.id);
  const count = await markConversationRead(conversationId, user.id);

  return NextResponse.json({ count }, { status: 200 });
});
