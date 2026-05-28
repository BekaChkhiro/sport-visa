import { ApiError } from './api-error';
import { db } from './db';
import { createNotification } from './notifications';
import { channels, events, triggerEvent } from './pusher';

export type MessageRow = {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  attachmentKey: string | null;
  read: boolean;
  createdAt: Date;
};

export type ConversationParticipants = {
  id: string;
  clubUserId: string;
  footballerUserId: string;
};

export const MESSAGE_BODY_MAX = 2000;

/**
 * Count unread messages addressed to a user across all their conversations.
 * A message counts as unread for me when it's in one of my conversations, I'm
 * not the sender, and `read` is still false. Used to drive the chats badge in
 * the sidebar for both footballer and club roles.
 */
export function countUnreadMessages(userId: string, role: 'footballer' | 'club'): Promise<number> {
  return db.message.count({
    where: {
      conversation: role === 'club' ? { clubUserId: userId } : { footballerUserId: userId },
      senderUserId: { not: userId },
      read: false,
    },
  });
}

/**
 * Load conversation participant ids, scoped to the caller. Throws NOT_FOUND
 * if the conversation does not exist OR the caller is not a participant —
 * the two cases are deliberately indistinguishable so we don't leak the
 * existence of conversations the user can't see.
 */
export async function requireParticipantConversation(
  conversationId: string,
  userId: string,
): Promise<ConversationParticipants> {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, clubUserId: true, footballerUserId: true },
  });
  if (!conversation) {
    throw new ApiError('NOT_FOUND', 'Conversation not found');
  }
  if (conversation.clubUserId !== userId && conversation.footballerUserId !== userId) {
    throw new ApiError('NOT_FOUND', 'Conversation not found');
  }
  return conversation;
}

/** List messages in chronological order (oldest first). */
export async function listMessages(conversationId: string, limit = 200): Promise<MessageRow[]> {
  return db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

/**
 * Mark every unread message in the conversation that was NOT sent by the
 * caller as read. Returns the count updated so callers can refresh UI counters.
 *
 * When at least one message is marked read, broadcasts a MESSAGES_READ event
 * on the conversation's Pusher channel so the sender's client can update the
 * read-receipt indicator in real time (fire-and-forget).
 */
export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<number> {
  const result = await db.message.updateMany({
    where: { conversationId, senderUserId: { not: userId }, read: false },
    data: { read: true },
  });

  if (result.count > 0) {
    const conv = await db.conversation.findUnique({
      where: { id: conversationId },
      select: { clubUserId: true, footballerUserId: true },
    });
    if (conv) {
      triggerEvent(channels.chat(conv.clubUserId, conv.footballerUserId), events.MESSAGES_READ, {
        conversationId,
      }).catch(() => undefined);
    }
  }

  return result.count;
}

export type SendMessageParams = {
  conversationId: string;
  senderUserId: string;
  body: string;
};

/**
 * Persist a new message and broadcast it on the conversation's private Pusher
 * channel. Also bumps the conversation's `updatedAt` so the list view sorts
 * correctly, and creates a NEW_MESSAGE notification for the recipient.
 *
 * Pusher and notification side effects are fire-and-forget — the message row
 * is the source of truth and recipients can always poll if the realtime path
 * silently fails.
 */
export async function sendMessage(params: SendMessageParams): Promise<MessageRow> {
  const body = params.body.trim();
  if (body.length === 0) {
    throw new ApiError('VALIDATION', 'Message body is required');
  }
  if (body.length > MESSAGE_BODY_MAX) {
    throw new ApiError('VALIDATION', `Message body exceeds ${MESSAGE_BODY_MAX} characters`);
  }

  const conversation = await requireParticipantConversation(
    params.conversationId,
    params.senderUserId,
  );

  const message = await db.message.create({
    data: {
      conversationId: conversation.id,
      senderUserId: params.senderUserId,
      body,
    },
  });

  // Touch the conversation so the chats list re-orders by recency.
  await db.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: message.createdAt },
  });

  const recipientUserId =
    params.senderUserId === conversation.clubUserId
      ? conversation.footballerUserId
      : conversation.clubUserId;

  // Broadcast on the private chat channel so both clients update in real time.
  triggerEvent(
    channels.chat(conversation.clubUserId, conversation.footballerUserId),
    events.NEW_MESSAGE,
    {
      id: message.id,
      conversationId: message.conversationId,
      senderUserId: message.senderUserId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    },
  ).catch(() => undefined);

  const preview = body.length > 80 ? `${body.slice(0, 80)}…` : body;
  createNotification({
    userId: recipientUserId,
    type: 'NEW_MESSAGE',
    title: 'ახალი შეტყობინება',
    body: preview,
  }).catch(() => undefined);

  return message;
}
