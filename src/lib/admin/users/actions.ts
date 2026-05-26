'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

import {
  listUsersSchema,
  userIdSchema,
  type ListUsersInput,
  type UserActionState,
} from './schemas';

export type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'FOOTBALLER' | 'CLUB' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
  emailVerified: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | null;
  createdAt: string;
};

export type UsersPage = {
  items: UserRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

async function ensureAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHORIZED');
  if (session.user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return session.user.id;
}

function revalidateUserPages() {
  revalidatePath('/admin');
  revalidatePath('/admin/users');
  revalidatePath('/directory');
  revalidatePath('/clubs');
}

export async function listUsers(rawInput: ListUsersInput = {}): Promise<UsersPage> {
  await ensureAdmin();
  const parsed = listUsersSchema.safeParse(rawInput);
  if (!parsed.success) throw new Error('INVALID_INPUT');
  const { query, role, page, pageSize } = parsed.data;

  const where: Prisma.UserWhereInput = {
    ...(role !== 'ALL' ? { role } : {}),
    ...(query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        footballerProfile: { select: { verificationStatus: true } },
        clubProfile: { select: { verificationStatus: true } },
      },
    }),
  ]);

  const items: UserRow[] = rows.map((r) => ({
    id: r.id,
    email: r.email,
    firstName: r.firstName,
    lastName: r.lastName,
    role: r.role,
    status: r.status,
    emailVerified: r.emailVerified?.toISOString() ?? null,
    verificationStatus:
      r.footballerProfile?.verificationStatus ?? r.clubProfile?.verificationStatus ?? null,
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

export async function banUser(data: unknown): Promise<UserActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = userIdSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const user = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true, status: true },
  });
  if (!user) return { status: 'error', message: 'მომხმარებელი ვერ მოიძებნა' };
  if (user.role === 'ADMIN') return { status: 'error', message: 'ადმინის ბლოკირება შეუძლებელია' };
  if (user.status === 'BLOCKED') return { status: 'success', message: 'უკვე დაბლოკილია' };

  await db.user.update({ where: { id: user.id }, data: { status: 'BLOCKED' } });
  logger.info({ adminId, userId: user.id, action: 'ban_user' }, 'user banned');

  revalidateUserPages();
  return { status: 'success', message: 'მომხმარებელი დაბლოკილია' };
}

export async function unbanUser(data: unknown): Promise<UserActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = userIdSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const user = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, status: true },
  });
  if (!user) return { status: 'error', message: 'მომხმარებელი ვერ მოიძებნა' };
  if (user.status === 'ACTIVE') return { status: 'success', message: 'უკვე აქტიურია' };

  await db.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } });
  logger.info({ adminId, userId: user.id, action: 'unban_user' }, 'user unbanned');

  revalidateUserPages();
  return { status: 'success', message: 'მომხმარებლის ბლოკი მოხსნილია' };
}

export async function deleteUser(data: unknown): Promise<UserActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = userIdSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const user = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true },
  });
  if (!user) return { status: 'error', message: 'მომხმარებელი ვერ მოიძებნა' };
  if (user.role === 'ADMIN') return { status: 'error', message: 'ადმინის წაშლა შეუძლებელია' };
  if (user.id === adminId)
    return { status: 'error', message: 'საკუთარი ანგარიშის წაშლა შეუძლებელია' };

  await db.user.delete({ where: { id: user.id } });
  logger.info({ adminId, userId: user.id, action: 'delete_user' }, 'user deleted');

  revalidateUserPages();
  return { status: 'success', message: 'მომხმარებელი წაშლილია' };
}
