'use server';

import { Prisma } from '@prisma/client';
import type { DominantFoot, ExperienceLevel, Position } from '@prisma/client';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

import {
  clubOnboardingSchema,
  footballerOnboardingSchema,
  type OnboardingActionState,
} from './schemas';

export async function saveFootballerProfile(data: unknown): Promise<OnboardingActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  }
  if (session.user.role !== 'FOOTBALLER') {
    return { status: 'error', message: 'მხოლოდ ფეხბურთელებს შეუძლიათ ამ ფორმის შევსება' };
  }

  const parsed = footballerOnboardingSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[key] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const d = parsed.data;
  const userId = session.user.id;

  const existingProfile = await db.footballerProfile.findUnique({ where: { userId } });
  if (existingProfile) {
    return { status: 'success' };
  }

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });

  try {
    await db.footballerProfile.create({
      data: {
        userId,
        firstName: dbUser?.firstName ?? '',
        lastName: dbUser?.lastName ?? '',
        dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
        nationality: d.nationality ?? null,
        city: d.city ?? null,
        country: d.country ?? null,
        phone: d.phone ?? null,
        bio: d.bio ?? null,
        positions: d.positions as Position[],
        dominantFoot: d.dominantFoot as DominantFoot,
        height: d.height ?? null,
        weight: d.weight ?? null,
        currentClub: d.currentClub ?? null,
        jerseyNumber: d.jerseyNumber ?? null,
        experienceLevel: (d.experienceLevel as ExperienceLevel) ?? null,
        desiredLeague: d.desiredLeague ?? null,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      // Concurrent request already created the profile — idempotent success.
      return { status: 'success' };
    }
    logger.error({ err, userId }, 'onboarding_footballer_create_failed');
    return { status: 'error', message: 'პროფილის შექმნა ვერ მოხერხდა. სცადე თავიდან.' };
  }

  return { status: 'success' };
}

export async function saveClubProfile(data: unknown): Promise<OnboardingActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  }
  if (session.user.role !== 'CLUB') {
    return { status: 'error', message: 'მხოლოდ კლუბებს შეუძლიათ ამ ფორმის შევსება' };
  }

  const parsed = clubOnboardingSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[key] = issues;
    }
    return { status: 'error', message: 'შეავსე ფორმა სწორად', fieldErrors };
  }

  const d = parsed.data;
  const userId = session.user.id;

  const existingProfile = await db.clubProfile.findUnique({ where: { userId } });
  if (existingProfile) {
    return { status: 'success' };
  }

  try {
    await db.clubProfile.create({
      data: {
        userId,
        name: d.name,
        foundedYear: d.foundedYear ?? null,
        country: d.country ?? null,
        city: d.city ?? null,
        league: d.league ?? null,
        stadiumName: d.stadiumName ?? null,
        stadiumCapacity: d.stadiumCapacity ?? null,
        officialWebsite: d.officialWebsite ?? null,
        bio: d.bio ?? null,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      // Concurrent request already created the profile — idempotent success.
      return { status: 'success' };
    }
    logger.error({ err, userId }, 'onboarding_club_create_failed');
    return { status: 'error', message: 'პროფილის შექმნა ვერ მოხერხდა. სცადე თავიდან.' };
  }

  return { status: 'success' };
}
