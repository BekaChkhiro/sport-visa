import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { VerificationStatus } from '@/components/verification-badge';
import { ProfileEditClient } from './profile-edit-client';

export const metadata: Metadata = {
  title: 'პროფილის რედაქტირება',
};

type PrismaVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

function toUiVerificationStatus(status: PrismaVerificationStatus): VerificationStatus {
  return status.toLowerCase() as VerificationStatus;
}

export default async function ProfileEditPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (!session.user.emailVerified) {
    redirect('/verification-pending');
  }

  if (session.user.role !== 'FOOTBALLER') {
    redirect('/dashboard');
  }

  const userId = session.user.id;

  const profile = await db.footballerProfile.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      nationality: true,
      city: true,
      country: true,
      phone: true,
      bio: true,
      positions: true,
      dominantFoot: true,
      height: true,
      weight: true,
      currentClub: true,
      jerseyNumber: true,
      experienceLevel: true,
      desiredLeague: true,
      avatarKey: true,
      verificationStatus: true,
      profileViewCount: true,
      shortlistedBy: { select: { id: true } },
    },
  });

  if (!profile) {
    redirect('/onboarding');
  }

  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = [profile.firstName[0], profile.lastName[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return (
    <ProfileEditClient
      currentPath="/profile/edit"
      user={{
        name,
        initials,
        image: profile.avatarKey ? `${r2BaseUrl}/${profile.avatarKey}` : undefined,
        position: profile.positions[0] ?? undefined,
        verificationStatus: toUiVerificationStatus(profile.verificationStatus),
      }}
      initialPersonalInfo={{
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : '',
        nationality: profile.nationality ?? '',
        city: profile.city ?? '',
        country: profile.country ?? '',
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
      }}
      initialSportInfo={{
        positions: profile.positions,
        dominantFoot: profile.dominantFoot ?? '',
        height: profile.height != null ? String(profile.height) : '',
        weight: profile.weight != null ? String(profile.weight) : '',
        currentClub: profile.currentClub ?? '',
        jerseyNumber: profile.jerseyNumber != null ? String(profile.jerseyNumber) : '',
        experienceLevel: profile.experienceLevel ?? '',
        desiredLeague: profile.desiredLeague ?? '',
      }}
    />
  );
}
