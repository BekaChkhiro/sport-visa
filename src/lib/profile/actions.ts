'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteObject } from '@/lib/r2';

import {
  updatePersonalInfoSchema,
  updateSportInfoSchema,
  careerEntrySchema,
  updateAgentInfoSchema,
  type ProfileActionState,
} from './schemas';

export async function updatePersonalInfo(data: unknown): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = updatePersonalInfoSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[key] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const d = parsed.data;
  const userId = session.user.id;

  await db.footballerProfile.update({
    where: { userId },
    data: {
      firstName: d.firstName,
      lastName: d.lastName,
      dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
      nationality: d.nationality,
      city: d.city,
      country: d.country,
      phone: d.phone ?? null,
      bio: d.bio ?? null,
    },
  });

  revalidatePath('/profile/edit');
  revalidatePath('/dashboard/footballer');

  return { status: 'success' };
}

export async function updateSportInfo(data: unknown): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = updateSportInfoSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[key] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const d = parsed.data;
  const userId = session.user.id;

  await db.footballerProfile.update({
    where: { userId },
    data: {
      positions: d.positions,
      dominantFoot: d.dominantFoot,
      height: d.height,
      weight: d.weight,
      currentClub: d.currentClub ?? null,
      jerseyNumber: d.jerseyNumber ?? null,
      experienceLevel: d.experienceLevel ?? null,
      desiredLeague: d.desiredLeague ?? null,
    },
  });

  revalidatePath('/profile/edit');
  revalidatePath('/dashboard/footballer');

  return { status: 'success' };
}

// ── career history ────────────────────────────────────────────────────────────

async function getFootballerProfileId(userId: string): Promise<string | null> {
  const p = await db.footballerProfile.findUnique({ where: { userId }, select: { id: true } });
  return p?.id ?? null;
}

export async function addCareerEntry(data: unknown): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = careerEntrySchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[key] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const profileId = await getFootballerProfileId(session.user.id);
  if (!profileId) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const d = parsed.data;
  await db.careerEntry.create({
    data: {
      profileId,
      clubName: d.clubName,
      startYear: d.startYear,
      endYear: d.endYear ?? null,
      position: d.position ?? null,
      orderIndex: d.orderIndex,
    },
  });

  revalidatePath('/profile/edit');
  return { status: 'success' };
}

export async function updateCareerEntry(id: string, data: unknown): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = careerEntrySchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[key] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const profileId = await getFootballerProfileId(session.user.id);
  if (!profileId) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const existing = await db.careerEntry.findUnique({ where: { id }, select: { profileId: true } });
  if (!existing || existing.profileId !== profileId) {
    return { status: 'error', message: 'ჩანაწერი ვერ მოიძებნა' };
  }

  const d = parsed.data;
  await db.careerEntry.update({
    where: { id },
    data: {
      clubName: d.clubName,
      startYear: d.startYear,
      endYear: d.endYear ?? null,
      position: d.position ?? null,
      orderIndex: d.orderIndex,
    },
  });

  revalidatePath('/profile/edit');
  return { status: 'success' };
}

export async function deleteCareerEntry(id: string): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const profileId = await getFootballerProfileId(session.user.id);
  if (!profileId) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const existing = await db.careerEntry.findUnique({ where: { id }, select: { profileId: true } });
  if (!existing || existing.profileId !== profileId) {
    return { status: 'error', message: 'ჩანაწერი ვერ მოიძებნა' };
  }

  await db.careerEntry.delete({ where: { id } });

  revalidatePath('/profile/edit');
  return { status: 'success' };
}

// ── gallery ───────────────────────────────────────────────────────────────────

export type AddGalleryItemState =
  | { status: 'success'; id: string }
  | { status: 'error'; message: string };

const MAX_GALLERY_PHOTOS = 8;

export async function addGalleryItem(key: string): Promise<AddGalleryItemState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const profileId = await getFootballerProfileId(session.user.id);
  if (!profileId) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const count = await db.galleryItem.count({ where: { profileId } });
  if (count >= MAX_GALLERY_PHOTOS) {
    return { status: 'error', message: `მაქსიმუმ ${MAX_GALLERY_PHOTOS} ფოტო შეიძლება` };
  }

  const item = await db.galleryItem.create({
    data: { profileId, mediaKey: key, orderIndex: count },
    select: { id: true },
  });

  revalidatePath('/profile/edit');
  return { status: 'success', id: item.id };
}

export async function deleteGalleryItem(id: string): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const profileId = await getFootballerProfileId(session.user.id);
  if (!profileId) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const item = await db.galleryItem.findUnique({
    where: { id },
    select: { profileId: true, mediaKey: true },
  });
  if (!item || item.profileId !== profileId) {
    return { status: 'error', message: 'ფოტო ვერ მოიძებნა' };
  }

  await db.galleryItem.delete({ where: { id } });

  try {
    await deleteObject(item.mediaKey);
  } catch {
    // best-effort — DB row is gone regardless
  }

  revalidatePath('/profile/edit');
  return { status: 'success' };
}

export async function reorderGalleryItems(orderedIds: string[]): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const profileId = await getFootballerProfileId(session.user.id);
  if (!profileId) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const owned = await db.galleryItem.findMany({
    where: { profileId },
    select: { id: true },
  });
  const ownedSet = new Set(owned.map((i) => i.id));
  if (orderedIds.some((id) => !ownedSet.has(id))) {
    return { status: 'error', message: 'ფოტო ვერ მოიძებნა' };
  }

  await db.$transaction(
    orderedIds.map((id, idx) =>
      db.galleryItem.update({ where: { id }, data: { orderIndex: idx } }),
    ),
  );

  revalidatePath('/profile/edit');
  return { status: 'success' };
}

// ── agent info ────────────────────────────────────────────────────────────────

export async function updateAgentInfo(data: unknown): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = updateAgentInfoSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[key] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const d = parsed.data;
  await db.footballerProfile.update({
    where: { userId: session.user.id },
    data: {
      agentName: d.agentName ?? null,
      agentPhone: d.agentPhone ?? null,
      agentEmail: d.agentEmail ?? null,
    },
  });

  revalidatePath('/profile/edit');
  return { status: 'success' };
}
