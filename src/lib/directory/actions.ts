'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type ShortlistResult =
  | { status: 'success'; shortlisted: boolean }
  | { status: 'error'; message: string };

export async function toggleShortlist(footballerProfileId: string): Promise<ShortlistResult> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const club = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!club) return { status: 'error', message: 'კლუბის პროფილი ვერ მოიძებნა' };

  const existing = await db.clubShortlist.findUnique({
    where: {
      clubProfileId_footballerProfileId: {
        clubProfileId: club.id,
        footballerProfileId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await db.clubShortlist.delete({ where: { id: existing.id } });
    revalidatePath('/directory');
    revalidatePath('/dashboard/club');
    return { status: 'success', shortlisted: false };
  }

  await db.clubShortlist.create({
    data: { clubProfileId: club.id, footballerProfileId },
  });
  revalidatePath('/directory');
  revalidatePath('/dashboard/club');
  return { status: 'success', shortlisted: true };
}
