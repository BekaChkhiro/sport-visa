'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { sendAccountVerificationEmail } from '@/lib/resend';

import {
  approveSchema,
  listPendingSchema,
  rejectSchema,
  type ListPendingInput,
  type VerificationActionState,
} from './schemas';

export type PendingFootballerRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  positions: string[];
  city: string | null;
  nationality: string | null;
  avatarKey: string | null;
  createdAt: Date;
};

export type PendingClubRow = {
  id: string;
  name: string;
  email: string | null;
  league: string | null;
  city: string | null;
  country: string | null;
  logoKey: string | null;
  createdAt: Date;
};

export type PendingPage<T> = {
  items: T[];
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

function revalidateVerificationPages(profileType: 'footballer' | 'club') {
  revalidatePath('/admin');
  revalidatePath('/admin/verification');
  if (profileType === 'footballer') {
    revalidatePath('/directory');
  } else {
    revalidatePath('/clubs');
  }
}

export async function listPendingFootballers(
  rawInput: ListPendingInput = {},
): Promise<PendingPage<PendingFootballerRow>> {
  await ensureAdmin();
  const parsed = listPendingSchema.safeParse(rawInput);
  if (!parsed.success) throw new Error('INVALID_INPUT');
  const { query, sort, page, pageSize } = parsed.data;

  const where: Prisma.FootballerProfileWhereInput = {
    verificationStatus: 'PENDING',
    ...(query
      ? {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    db.footballerProfile.count({ where }),
    db.footballerProfile.findMany({
      where,
      orderBy: { createdAt: sort === 'newest' ? 'desc' : 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        positions: true,
        city: true,
        nationality: true,
        avatarKey: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.user?.email ?? null,
      positions: r.positions,
      city: r.city,
      nationality: r.nationality,
      avatarKey: r.avatarKey,
      createdAt: r.createdAt,
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listPendingClubs(
  rawInput: ListPendingInput = {},
): Promise<PendingPage<PendingClubRow>> {
  await ensureAdmin();
  const parsed = listPendingSchema.safeParse(rawInput);
  if (!parsed.success) throw new Error('INVALID_INPUT');
  const { query, sort, page, pageSize } = parsed.data;

  const where: Prisma.ClubProfileWhereInput = {
    verificationStatus: 'PENDING',
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    db.clubProfile.count({ where }),
    db.clubProfile.findMany({
      where,
      orderBy: { createdAt: sort === 'newest' ? 'desc' : 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        league: true,
        city: true,
        country: true,
        logoKey: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.user?.email ?? null,
      league: r.league,
      city: r.city,
      country: r.country,
      logoKey: r.logoKey,
      createdAt: r.createdAt,
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

async function tryNotify(
  email: string | null | undefined,
  recipientName: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
) {
  if (!email) return;
  try {
    await sendAccountVerificationEmail(email, {
      recipientName,
      status,
      rejectionReason,
      appUrl: env.NEXT_PUBLIC_APP_URL,
    });
  } catch (err) {
    // Email failure must not block the verification decision; admin still saved.
    logger.warn({ err, email, status }, 'failed to send verification email');
  }
}

export async function approveFootballer(data: unknown): Promise<VerificationActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = approveSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const profile = await db.footballerProfile.findUnique({
    where: { id: parsed.data.profileId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      verificationStatus: true,
      user: { select: { email: true } },
    },
  });
  if (!profile) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };
  if (profile.verificationStatus === 'VERIFIED') {
    return { status: 'success', message: 'უკვე დადასტურებულია' };
  }

  await db.footballerProfile.update({
    where: { id: profile.id },
    data: {
      verificationStatus: 'VERIFIED',
      rejectionReason: null,
    },
  });

  logger.info(
    { adminId, profileId: profile.id, action: 'approve_footballer' },
    'footballer approved',
  );

  await tryNotify(
    profile.user?.email,
    `${profile.firstName} ${profile.lastName}`.trim() || 'Footballer',
    'approved',
  );

  revalidateVerificationPages('footballer');
  return { status: 'success', message: 'პროფილი დადასტურდა' };
}

export async function rejectFootballer(data: unknown): Promise<VerificationActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = rejectSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'არასწორი მონაცემები' };
  }

  const profile = await db.footballerProfile.findUnique({
    where: { id: parsed.data.profileId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      verificationStatus: true,
      user: { select: { email: true } },
    },
  });
  if (!profile) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  await db.footballerProfile.update({
    where: { id: profile.id },
    data: {
      verificationStatus: 'REJECTED',
      rejectionReason: parsed.data.reason,
    },
  });

  logger.info(
    { adminId, profileId: profile.id, action: 'reject_footballer' },
    'footballer rejected',
  );

  await tryNotify(
    profile.user?.email,
    `${profile.firstName} ${profile.lastName}`.trim() || 'Footballer',
    'rejected',
    parsed.data.reason,
  );

  revalidateVerificationPages('footballer');
  return { status: 'success', message: 'უარყოფა გაიგზავნა' };
}

export async function approveClub(data: unknown): Promise<VerificationActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = approveSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const club = await db.clubProfile.findUnique({
    where: { id: parsed.data.profileId },
    select: {
      id: true,
      name: true,
      verificationStatus: true,
      user: { select: { email: true } },
    },
  });
  if (!club) return { status: 'error', message: 'კლუბი ვერ მოიძებნა' };
  if (club.verificationStatus === 'VERIFIED') {
    return { status: 'success', message: 'უკვე დადასტურებულია' };
  }

  await db.clubProfile.update({
    where: { id: club.id },
    data: {
      verificationStatus: 'VERIFIED',
      rejectionReason: null,
    },
  });

  logger.info({ adminId, profileId: club.id, action: 'approve_club' }, 'club approved');

  await tryNotify(club.user?.email, club.name || 'Club', 'approved');

  revalidateVerificationPages('club');
  return { status: 'success', message: 'კლუბი დადასტურდა' };
}

export async function rejectClub(data: unknown): Promise<VerificationActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = rejectSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'არასწორი მონაცემები' };
  }

  const club = await db.clubProfile.findUnique({
    where: { id: parsed.data.profileId },
    select: {
      id: true,
      name: true,
      verificationStatus: true,
      user: { select: { email: true } },
    },
  });
  if (!club) return { status: 'error', message: 'კლუბი ვერ მოიძებნა' };

  await db.clubProfile.update({
    where: { id: club.id },
    data: {
      verificationStatus: 'REJECTED',
      rejectionReason: parsed.data.reason,
    },
  });

  logger.info({ adminId, profileId: club.id, action: 'reject_club' }, 'club rejected');

  await tryNotify(club.user?.email, club.name || 'Club', 'rejected', parsed.data.reason);

  revalidateVerificationPages('club');
  return { status: 'success', message: 'უარყოფა გაიგზავნა' };
}
