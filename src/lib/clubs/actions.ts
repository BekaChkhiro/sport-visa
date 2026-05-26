'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type SubscribeResult =
  | { status: 'success'; subscribed: boolean }
  | { status: 'error'; message: string };

export async function toggleSubscription(clubProfileId: string): Promise<SubscribeResult> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const footballer = await db.footballerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!footballer) return { status: 'error', message: 'ფეხბურთელის პროფილი ვერ მოიძებნა' };

  const existing = await db.clubSubscription.findUnique({
    where: {
      footballerProfileId_clubProfileId: {
        footballerProfileId: footballer.id,
        clubProfileId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await db.clubSubscription.delete({ where: { id: existing.id } });
    revalidatePath('/clubs');
    revalidatePath('/dashboard/footballer');
    return { status: 'success', subscribed: false };
  }

  await db.clubSubscription.create({
    data: { footballerProfileId: footballer.id, clubProfileId },
  });
  revalidatePath('/clubs');
  revalidatePath('/dashboard/footballer');
  return { status: 'success', subscribed: true };
}
