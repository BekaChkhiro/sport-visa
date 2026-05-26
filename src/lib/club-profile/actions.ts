'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { createNotification } from '@/lib/notifications';
import { deleteObject } from '@/lib/r2';
import { sendNotificationEmail } from '@/lib/resend';

import {
  updateClubIdentitySchema,
  updateClubBioSchema,
  clubHistoryEventSchema,
  clubRosterEntrySchema,
  clubPostSchema,
  type ClubActionState,
  type ClubHistoryEventAddState,
  type ClubRosterEntryAddState,
  type ClubPostActionState,
  type ClubPostCreateState,
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

// ── Roster entries ────────────────────────────────────────────────────────────

export async function addClubRosterEntry(data: unknown): Promise<ClubRosterEntryAddState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = clubRosterEntrySchema.safeParse(data);
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

  // Append at the end of the list (orderIndex = current max + 1).
  const last = await db.clubRosterEntry.findFirst({
    where: { clubId: club.id },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });
  const nextOrder = (last?.orderIndex ?? -1) + 1;

  const entry = await db.clubRosterEntry.create({
    data: {
      clubId: club.id,
      playerName: parsed.data.playerName,
      position: parsed.data.position ?? null,
      jerseyNumber: parsed.data.jerseyNumber ?? null,
      orderIndex: nextOrder,
    },
  });

  revalidateClubPaths();
  return { status: 'success', entryId: entry.id };
}

export async function updateClubRosterEntry(id: string, data: unknown): Promise<ClubActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = clubRosterEntrySchema.safeParse(data);
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

  const existing = await db.clubRosterEntry.findFirst({
    where: { id, clubId: club.id },
    select: { id: true },
  });
  if (!existing) return { status: 'error', message: 'მოთამაშე ვერ მოიძებნა' };

  await db.clubRosterEntry.update({
    where: { id },
    data: {
      playerName: parsed.data.playerName,
      position: parsed.data.position ?? null,
      jerseyNumber: parsed.data.jerseyNumber ?? null,
    },
  });

  revalidateClubPaths();
  return { status: 'success' };
}

export async function deleteClubRosterEntry(id: string): Promise<ClubActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const club = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!club) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const existing = await db.clubRosterEntry.findFirst({
    where: { id, clubId: club.id },
    select: { id: true },
  });
  if (!existing) return { status: 'error', message: 'მოთამაშე ვერ მოიძებნა' };

  await db.clubRosterEntry.delete({ where: { id } });

  revalidateClubPaths();
  return { status: 'success' };
}

// ── Club posts ────────────────────────────────────────────────────────────────

function revalidatePostPaths(clubId: string, postId?: string) {
  revalidatePath('/dashboard/club');
  revalidatePath(`/clubs/${clubId}`);
  if (postId) revalidatePath(`/clubs/${clubId}/posts/${postId}`);
}

export async function createClubPost(data: unknown): Promise<ClubPostCreateState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = clubPostSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [k, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[k] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const club = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!club) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const post = await db.clubPost.create({
    data: {
      clubId: club.id,
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });

  void fanOutNewPostNotifications(club.id, club.name, post.title).catch(() => undefined);

  revalidatePostPaths(club.id, post.id);
  return { status: 'success', postId: post.id };
}

async function fanOutNewPostNotifications(
  clubProfileId: string,
  clubName: string,
  postTitle: string,
): Promise<void> {
  const subscribers = await db.clubSubscription.findMany({
    where: { clubProfileId },
    select: {
      footballerProfile: {
        select: {
          userId: true,
          firstName: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  if (!subscribers.length) return;

  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const notifTitle = `New post from ${clubName}`;

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      const fp = sub.footballerProfile;
      if (!fp) return;

      await createNotification({
        userId: fp.userId,
        type: 'NEW_CLUB_POST',
        title: notifTitle,
        body: postTitle,
      });

      await sendNotificationEmail(fp.user.email, {
        recipientName: fp.firstName,
        subject: notifTitle,
        bodyHtml: `<p><strong>${htmlEscape(clubName)}</strong> published a new post: &ldquo;${htmlEscape(postTitle)}&rdquo;</p>`,
        bodyText: `${clubName} published a new post: "${postTitle}"`,
        ctaLabel: 'View newsfeed',
        ctaUrl: `${appUrl}/dashboard/footballer`,
        appUrl,
      });
    }),
  );
}

function htmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function updateClubPost(postId: string, data: unknown): Promise<ClubPostActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const parsed = clubPostSchema.safeParse(data);
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

  const existing = await db.clubPost.findFirst({
    where: { id: postId, clubId: club.id },
    select: { id: true },
  });
  if (!existing) return { status: 'error', message: 'პოსტი ვერ მოიძებნა' };

  await db.clubPost.update({
    where: { id: postId },
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });

  revalidatePostPaths(club.id, postId);
  return { status: 'success' };
}

export async function deleteClubPost(postId: string): Promise<ClubPostActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'CLUB') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const club = await db.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!club) return { status: 'error', message: 'პროფილი ვერ მოიძებნა' };

  const existing = await db.clubPost.findFirst({
    where: { id: postId, clubId: club.id },
    select: { id: true },
  });
  if (!existing) return { status: 'error', message: 'პოსტი ვერ მოიძებნა' };

  await db.clubPost.delete({ where: { id: postId } });

  revalidatePostPaths(club.id);
  return { status: 'success' };
}
