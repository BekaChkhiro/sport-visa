'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PostRow = {
  id: string;
  title: string;
  bodyPreview: string;
  clubId: string;
  clubName: string;
  likeCount: number;
  createdAt: string;
};

export type ConversationRow = {
  id: string;
  clubUserEmail: string;
  clubName: string | null;
  footballerUserEmail: string;
  footballerName: string | null;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
};

export type ModerationPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type ModerationActionState = {
  status: 'success' | 'error' | 'idle';
  message?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ensureAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHORIZED');
  if (session.user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return session.user.id;
}

function revalidateModerationPages() {
  revalidatePath('/admin');
  revalidatePath('/admin/moderation');
}

// ── Post schemas ──────────────────────────────────────────────────────────────

const listPostsSchema = z.object({
  query: z.string().trim().max(200).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

const postIdSchema = z.object({
  postId: z.string().min(1),
});

type ListPostsInput = z.input<typeof listPostsSchema>;

// ── Conversation schemas ───────────────────────────────────────────────────────

const listConversationsSchema = z.object({
  query: z.string().trim().max(200).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

const conversationIdSchema = z.object({
  conversationId: z.string().min(1),
});

type ListConversationsInput = z.input<typeof listConversationsSchema>;

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function listPosts(rawInput: ListPostsInput = {}): Promise<ModerationPage<PostRow>> {
  await ensureAdmin();
  const parsed = listPostsSchema.safeParse(rawInput);
  if (!parsed.success) throw new Error('INVALID_INPUT');
  const { query, page, pageSize } = parsed.data;

  const where: Prisma.ClubPostWhereInput = query
    ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { club: { name: { contains: query, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [total, rows] = await Promise.all([
    db.clubPost.count({ where }),
    db.clubPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
        club: { select: { id: true, name: true } },
        _count: { select: { likes: true } },
      },
    }),
  ]);

  const items: PostRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    bodyPreview: r.body.length > 120 ? r.body.slice(0, 120) + '…' : r.body,
    clubId: r.club.id,
    clubName: r.club.name,
    likeCount: r._count.likes,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function deletePost(data: unknown): Promise<ModerationActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = postIdSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const post = await db.clubPost.findUnique({
    where: { id: parsed.data.postId },
    select: { id: true, title: true, clubId: true },
  });
  if (!post) return { status: 'error', message: 'პოსტი ვერ მოიძებნა' };

  await db.clubPost.delete({ where: { id: post.id } });
  logger.info(
    { adminId, postId: post.id, clubId: post.clubId, title: post.title, action: 'delete_post' },
    'post_deleted_by_admin',
  );

  revalidateModerationPages();
  revalidatePath('/admin/moderation');
  revalidatePath(`/clubs/${post.clubId}`);
  return { status: 'success', message: 'პოსტი წაშლილია' };
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function listConversations(
  rawInput: ListConversationsInput = {},
): Promise<ModerationPage<ConversationRow>> {
  await ensureAdmin();
  const parsed = listConversationsSchema.safeParse(rawInput);
  if (!parsed.success) throw new Error('INVALID_INPUT');
  const { query, page, pageSize } = parsed.data;

  const where: Prisma.ConversationWhereInput = query
    ? {
        OR: [
          { clubUser: { email: { contains: query, mode: 'insensitive' } } },
          { footballerUser: { email: { contains: query, mode: 'insensitive' } } },
          { clubUser: { clubProfile: { name: { contains: query, mode: 'insensitive' } } } },
          {
            footballerUser: {
              footballerProfile: {
                OR: [
                  { firstName: { contains: query, mode: 'insensitive' } },
                  { lastName: { contains: query, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      }
    : {};

  const [total, rows] = await Promise.all([
    db.conversation.count({ where }),
    db.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        clubUser: {
          select: {
            email: true,
            clubProfile: { select: { name: true } },
          },
        },
        footballerUser: {
          select: {
            email: true,
            footballerProfile: { select: { firstName: true, lastName: true } },
          },
        },
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
  ]);

  const items: ConversationRow[] = rows.map((r) => ({
    id: r.id,
    clubUserEmail: r.clubUser.email,
    clubName: r.clubUser.clubProfile?.name ?? null,
    footballerUserEmail: r.footballerUser.email,
    footballerName: r.footballerUser.footballerProfile
      ? `${r.footballerUser.footballerProfile.firstName} ${r.footballerUser.footballerProfile.lastName}`.trim()
      : null,
    messageCount: r._count.messages,
    lastMessageAt: r.messages[0]?.createdAt.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function deleteConversation(data: unknown): Promise<ModerationActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = conversationIdSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const conv = await db.conversation.findUnique({
    where: { id: parsed.data.conversationId },
    select: { id: true, clubUserId: true, footballerUserId: true },
  });
  if (!conv) return { status: 'error', message: 'საუბარი ვერ მოიძებნა' };

  await db.conversation.delete({ where: { id: conv.id } });
  logger.info(
    {
      adminId,
      conversationId: conv.id,
      clubUserId: conv.clubUserId,
      footballerUserId: conv.footballerUserId,
      action: 'delete_conversation',
    },
    'conversation_deleted_by_admin',
  );

  revalidateModerationPages();
  return { status: 'success', message: 'საუბარი წაშლილია' };
}
