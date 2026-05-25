'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteObject } from '@/lib/r2';

import {
  updateClubIdentitySchema,
  updateClubBioSchema,
  clubHistoryEventSchema,
  type ClubActionState,
  type ClubHistoryEventAddState,
} from './schemas';

function revalidateClubPaths() {
  revalidatePath('/profile/club/edit');
  revalidatePath('/dashboard/club');
}

export async function updateClubIdentity(data: unknown): Promise<ClubActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = updateClubIdentitySchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[key] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const d = parsed.data;

  await db.clubProfile.update({
    where: { userId: session.user.id },
    data: {
      name: d.name,
      foundedYear: d.foundedYear ?? null,
      country: d.country ?? null,
      city: d.city ?? null,
      league: d.league ?? null,
      stadiumName: d.stadiumName ?? null,
      stadiumCapacity: d.stadiumCapacity ?? null,
      officialWebsite: d.officialWebsite ?? null,
    },
  });

  revalidateClubPaths();
  return { status: 'success' };
}

export async function updateClubLogo(key: string): Promise<ClubActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const existing = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { logoKey: true },
  });
  if (!existing) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  await db.clubProfile.update({
    where: { userId: session.user.id },
    data: { logoKey: key },
  });

  if (existing.logoKey && existing.logoKey !== key) {
    try {
      await deleteObject(existing.logoKey);
    } catch {
      // best-effort
    }
  }

  revalidateClubPaths();
  return { status: 'success' };
}

export async function updateClubCover(key: string): Promise<ClubActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const existing = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { coverKey: true },
  });
  if (!existing) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  await db.clubProfile.update({
    where: { userId: session.user.id },
    data: { coverKey: key },
  });

  if (existing.coverKey && existing.coverKey !== key) {
    try {
      await deleteObject(existing.coverKey);
    } catch {
      // best-effort
    }
  }

  revalidateClubPaths();
  return { status: 'success' };
}

export async function updateClubVisibility(isVisible: boolean): Promise<ClubActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  await db.clubProfile.update({
    where: { userId: session.user.id },
    data: { isVisible },
  });

  revalidateClubPaths();
  return { status: 'success' };
}

export async function updateClubBio(data: unknown): Promise<ClubActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = updateClubBioSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: 'ბიო/ისტ. 2000 სიმბოლოს მეტი ვერ იქნება' };
  }

  await db.clubProfile.update({
    where: { userId: session.user.id },
    data: { bio: parsed.data.bio ?? null },
  });

  revalidateClubPaths();
  return { status: 'success' };
}

export async function addClubHistoryEvent(data: unknown): Promise<ClubHistoryEventAddState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = clubHistoryEventSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [k, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[k] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const club = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!club) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const event = await db.clubHistoryEvent.create({
    data: {
      clubId: club.id,
      year: parsed.data.year,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      orderIndex: 0,
    },
  });

  revalidateClubPaths();
  return { status: 'success', eventId: event.id };
}

export async function updateClubHistoryEvent(id: string, data: unknown): Promise<ClubActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = clubHistoryEventSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [k, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[k] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const club = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!club) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const existing = await db.clubHistoryEvent.findFirst({
    where: { id, clubId: club.id },
    select: { id: true },
  });
  if (!existing) return { status: 'error', message: 'მოვლენა ვერ მოიძებნა' };

  await db.clubHistoryEvent.update({
    where: { id },
    data: {
      year: parsed.data.year,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
    },
  });

  revalidateClubPaths();
  return { status: 'success' };
}

export async function deleteClubHistoryEvent(id: string): Promise<ClubActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const club = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!club) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const existing = await db.clubHistoryEvent.findFirst({
    where: { id, clubId: club.id },
    select: { id: true },
  });
  if (!existing) return { status: 'error', message: 'მოვლენა ვერ მოიძებნა' };

  await db.clubHistoryEvent.delete({ where: { id } });

  revalidateClubPaths();
  return { status: 'success' };
}
