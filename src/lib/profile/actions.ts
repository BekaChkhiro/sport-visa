'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

import { updatePersonalInfoSchema, type ProfileActionState } from './schemas';

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
